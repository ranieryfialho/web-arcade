'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation'; // <--- Importante
import { Loader2, Save, CheckCircle2, AlertTriangle, Trophy, DownloadCloud } from 'lucide-react';
import { Database } from '@/types/database.types';
import { getLatestSave, uploadSaveState, incrementPlaytime } from '@/app/play/actions';

type Game = Database['public']['Tables']['games']['Row'];

interface GameEmulatorProps {
  game: Game;
}

export function GameEmulator({ game }: GameEmulatorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const searchParams = useSearchParams(); // <--- Pega os parâmetros da URL
  const hasAutoloadedRef = useRef(false); // <--- Evita carregar duas vezes
  
  // Estados de UI
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [newAchievement, setNewAchievement] = useState<string | null>(null);

  // --- HTML DO IFRAME (SANDBOX) ---
  const getIframeContent = () => {
    const systemCode = (() => {
      switch (game.console_type) {
        case 'SNES': return 'snes';
        case 'MEGA_DRIVE': return 'segaMD';
        case 'GBA': return 'gba';
        default: return '';
      }
    })();

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; padding: 0; background-color: #000; overflow: hidden; height: 100vh; width: 100vw; }
            #game-container { width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <div id="game-container"></div>
          
          <script>
            window.EJS_player = '#game-container';
            window.EJS_core = '${systemCode}';
            window.EJS_gameUrl = '${game.rom_url}';
            window.EJS_pathtodata = 'https://cdn.jsdelivr.net/gh/ethanaobrien/emulatorjs@main/data/';
            window.EJS_startOnLoaded = true;
            window.EJS_backgroundColor = '#000000';
            window.EJS_b_save = true;
            window.EJS_b_load = false;

            window.EJS_onSaveState = function(data) {
              try {
                const stateData = data.state || data;
                const blob = new Blob([stateData], { type: 'application/octet-stream' });
                const reader = new FileReader();
                reader.onload = function() {
                  window.parent.postMessage({ type: 'SAVE_STATE_FROM_EMULATOR', buffer: reader.result }, '*');
                };
                reader.readAsArrayBuffer(blob);
              } catch (e) {
                console.error('Erro no iframe save:', e);
              }
              return false;
            };

            window.EJS_onGameStart = function() {
              window.parent.postMessage({ type: 'GAME_STARTED' }, '*');
            };

            window.addEventListener('message', function(e) {
              if (e.data.type === 'LOAD_SAVE_INTO_EMULATOR') {
                console.log('📦 Iframe: Load Command Received');
                try {
                  const u8array = new Uint8Array(e.data.buffer);
                  if (window.EJS_emulator) {
                     if (typeof window.EJS_emulator.loadState === 'function') {
                        window.EJS_emulator.loadState(u8array);
                     } else if (window.EJS_emulator.gameManager && typeof window.EJS_emulator.gameManager.loadState === 'function') {
                        window.EJS_emulator.gameManager.loadState(u8array);
                     }
                  }
                } catch(err) { console.error(err); }
              }
            });
          </script>
          <script src="https://cdn.jsdelivr.net/gh/ethanaobrien/emulatorjs@main/data/loader.js"></script>
        </body>
      </html>
    `;
  };

  // --- FUNÇÃO DE LOAD (USADA NO BOTÃO E NO AUTOLOAD) ---
  const handleLoadClick = useCallback(async () => {
    setLoadStatus('loading');
    setErrorMessage('');
    
    try {
      const signedUrl = await getLatestSave(game.id);
      
      if (!signedUrl) {
        setErrorMessage("Nenhum save encontrado.");
        setLoadStatus('error');
        setTimeout(() => setLoadStatus('idle'), 3000);
        return;
      }

      console.log("☁️ Baixando save da nuvem...");
      const response = await fetch(signedUrl);
      const arrayBuffer = await response.arrayBuffer();

      if (iframeRef.current && iframeRef.current.contentWindow) {
        console.log("📤 Enviando save para o Iframe...");
        iframeRef.current.contentWindow.postMessage({
          type: 'LOAD_SAVE_INTO_EMULATOR',
          buffer: arrayBuffer
        }, '*');
        
        setLoadStatus('success');
        setTimeout(() => setLoadStatus('idle'), 3000);
      }
    } catch (error) {
      console.error("Erro no load:", error);
      setLoadStatus('error');
      setTimeout(() => setLoadStatus('idle'), 3000);
    }
  }, [game.id]);

  // --- HANDLE SAVE ---
  const handleSaveFromIframe = useCallback(async (arrayBuffer: ArrayBuffer) => {
    setSaveStatus('saving');
    try {
      const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
      const formData = new FormData();
      formData.append('file', blob);
      formData.append('gameId', game.id);

      const result = await uploadSaveState(formData);
      if (result.error) throw new Error(result.error);

      console.log("✅ Save salvo na nuvem!");
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (error: any) {
      console.error("❌ Erro upload:", error);
      setSaveStatus('error');
      setErrorMessage(error.message);
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  }, [game.id]);

  // --- LISTENER DE MENSAGENS E AUTOLOAD ---
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;

      if (event.data.type === 'GAME_STARTED') {
        setIsPlaying(true);

        // --- LÓGICA DE AUTOLOAD ---
        const shouldAutoload = searchParams.get('autoload') === 'true';
        
        if (shouldAutoload && !hasAutoloadedRef.current) {
          console.log("🔄 Autoload detectado! Iniciando carregamento...");
          hasAutoloadedRef.current = true;
          
          // Espera 1s para garantir que o emulador está respirando
          setTimeout(() => {
            handleLoadClick();
          }, 1000);
        }
      }
      
      if (event.data.type === 'SAVE_STATE_FROM_EMULATOR' && event.data.buffer) {
        handleSaveFromIframe(event.data.buffer);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleSaveFromIframe, handleLoadClick, searchParams]);


  // --- GAMIFICAÇÃO ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(async () => {
        const unlocked = await incrementPlaytime(60);
        if (unlocked) {
          setNewAchievement(unlocked.title);
          setTimeout(() => setNewAchievement(null), 6000);
        }
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-background-tertiary bg-black shadow-2xl">
        <iframe
          ref={iframeRef}
          srcDoc={getIframeContent()}
          title="Emulator Sandbox"
          className="h-full w-full border-none"
          allow="autoplay; fullscreen; gamepad"
        />
        
        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white bg-black/90 z-10 pointer-events-none">
            <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
            <p className="font-mono text-sm animate-pulse">Iniciando Sistema...</p>
          </div>
        )}

        {/* Feedback Save */}
        {saveStatus !== 'idle' && (
          <div className={`absolute top-4 right-4 z-20 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2
            ${saveStatus === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-200' : 'bg-background-card/90 border-white/10 text-white'}`}>
            {saveStatus === 'saving' && <><Loader2 className="h-4 w-4 animate-spin text-brand-primary" /><span>Salvando...</span></>}
            {saveStatus === 'success' && <><CheckCircle2 className="h-4 w-4 text-accent-success" /><span>Salvo!</span></>}
            {saveStatus === 'error' && <><AlertTriangle className="h-4 w-4 text-accent-danger" /><span>Erro ao salvar</span></>}
          </div>
        )}

        {/* Feedback Load */}
        {loadStatus !== 'idle' && (
          <div className={`absolute top-16 right-4 z-20 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2
            ${loadStatus === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-200' : 'bg-blue-950/90 border-blue-500/50 text-blue-200'}`}>
            {loadStatus === 'loading' && <><Loader2 className="h-4 w-4 animate-spin" /><span>Carregando...</span></>}
            {loadStatus === 'success' && <><CheckCircle2 className="h-4 w-4" /><span>Carregado!</span></>}
            {loadStatus === 'error' && <><AlertTriangle className="h-4 w-4" /><span>Erro.</span></>}
          </div>
        )}

        {/* Toast Conquista */}
        {newAchievement && (
          <div className="absolute top-4 left-4 z-30 flex items-center gap-4 rounded-xl border border-brand-primary/50 bg-black/90 p-4 shadow-glow animate-in slide-in-from-top-4 duration-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 text-white shadow-lg animate-bounce">
              <Trophy size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">Conquista Desbloqueada!</span>
              <span className="text-lg font-bold text-white leading-tight">{newAchievement}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border border-background-tertiary bg-background-card p-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Save size={16} className="text-brand-primary" />
            Como Salvar
          </span>
          <span className="text-xs text-text-muted">
            Use o ícone de disquete (<span className="text-white">💾</span>) na barra do jogo.
          </span>
        </div>

        <button
          onClick={handleLoadClick}
          disabled={loadStatus === 'loading' || !isPlaying}
          className="flex items-center gap-2 rounded-md bg-background-secondary px-4 py-2 text-sm font-medium text-text-primary hover:bg-background-tertiary hover:text-white transition-colors border border-background-tertiary disabled:opacity-50"
        >
          {loadStatus === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <DownloadCloud className="h-4 w-4 text-brand-primary" />
          )}
          Recarregar da Nuvem
        </button>
      </div>
    </div>
  );
}
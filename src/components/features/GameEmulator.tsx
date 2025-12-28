'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Save, CheckCircle2, AlertTriangle, Trophy, DownloadCloud, LogIn } from 'lucide-react';
import { Database } from '@/types/database.types';
import { getLatestSave, uploadSaveState, incrementPlaytime } from '@/app/play/actions';
import { trackGameSession } from '@/app/play/sessionTracking';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

type Game = Database['public']['Tables']['games']['Row'];

interface GameEmulatorProps {
  game: Game;
  isGuest: boolean;
}

export function GameEmulator({ game, isGuest }: GameEmulatorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasAutoloadedRef = useRef(false);
  const hasTrackedSessionRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [newAchievement, setNewAchievement] = useState<string | null>(null);
  
  const [showLoginModal, setShowLoginModal] = useState(false);

  const getIframeContent = () => {
    const systemCode = (() => {
      switch (game.console_type) {
        case 'SNES':  return 'snes';
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
            window. EJS_core = '${systemCode}';
            window.EJS_gameUrl = '${game.rom_url}';
            window. EJS_pathtodata = 'https://cdn.jsdelivr.net/gh/ethanaobrien/emulatorjs@main/data/';
            window.EJS_startOnLoaded = true;
            window.EJS_backgroundColor = '#000000';
            
            // Habilita botão de save na UI do emulador para interceptarmos
            window.EJS_b_save = true; 
            window.EJS_b_load = false; 

            // INTERCEPTADOR DE SAVE
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
              return false; // Bloqueia download nativo do navegador
            };

            // NOTIFICAÇÃO DE START
            window.EJS_onGameStart = function() {
              window.parent.postMessage({ type: 'GAME_STARTED' }, '*');
            };

            // LISTENER DE LOAD (Recebe do React)
            window.addEventListener('message', function(e) {
              if (e.data. type === 'LOAD_SAVE_INTO_EMULATOR') {
                try {
                  const u8array = new Uint8Array(e.data.buffer);
                  if (window.EJS_emulator) {
                     if (typeof window.EJS_emulator. loadState === 'function') {
                        window.EJS_emulator. loadState(u8array);
                     } else if (window.EJS_emulator.gameManager && typeof window.EJS_emulator. gameManager.loadState === 'function') {
                        window. EJS_emulator.gameManager.loadState(u8array);
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

  const handleLoadClick = useCallback(async () => {
    if (isGuest) {
      setShowLoginModal(true);
      return;
    }

    setLoadStatus('loading');
    setErrorMessage('');
    
    try {
      const signedUrl = await getLatestSave(game.id);
      
      if (! signedUrl) {
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
  }, [game.id, isGuest]);

  const handleSaveFromIframe = useCallback(async (arrayBuffer: ArrayBuffer) => {
    if (isGuest) {
      console.log("🔒 Visitante tentou salvar.  Mostrando convite.");
      setShowLoginModal(true);
      return;
    }

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

      if (result.newUnlocks && result.newUnlocks.length > 0) {
        result.newUnlocks.forEach((title, index) => {
          setTimeout(() => {
            setNewAchievement(title);
            setTimeout(() => setNewAchievement(null), 6000);
          }, index * 6500);
        });
      }

      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (error:  any) {
      console.error("❌ Erro upload:", error);
      setSaveStatus('error');
      setErrorMessage(error.message);
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  }, [game.id, isGuest]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;

      if (event.data.type === 'GAME_STARTED') {
        setIsPlaying(true);

        const shouldAutoload = searchParams.get('autoload') === 'true';
        if (shouldAutoload && !hasAutoloadedRef.current && !isGuest) {
          console.log("🔄 Autoload detectado!");
          hasAutoloadedRef. current = true;
          setTimeout(() => {
            handleLoadClick();
          }, 1000);
        }
      }
      
      if (event.data. type === 'SAVE_STATE_FROM_EMULATOR' && event.data.buffer) {
        handleSaveFromIframe(event. data.buffer);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleSaveFromIframe, handleLoadClick, searchParams, isGuest]);


  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && !isGuest) {
      if (!hasTrackedSessionRef.current) {
        hasTrackedSessionRef.current = true;
        
        console.log('🎮 Iniciando rastreamento de sessão...');
        trackGameSession(game.id, game.console_type).then(unlocks => {
          console.log('✅ Sessão rastreada.  Conquistas:', unlocks);
          
          if (unlocks && unlocks.length > 0) {
            unlocks.forEach((title, index) => {
              setTimeout(() => {
                setNewAchievement(title);
                setTimeout(() => setNewAchievement(null), 6000);
              }, index * 6500);
            });
          }
        }).catch(err => {
          console.error('❌ Erro ao rastrear sessão:', err);
        });
      }

      interval = setInterval(async () => {
        const unlocked = await incrementPlaytime(60);
        if (unlocked) {
          setNewAchievement(unlocked. title);
          setTimeout(() => setNewAchievement(null), 6000);
        }
      }, 60000);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, isGuest, game.id, game.console_type]);

  const handleExternalAchievement = useCallback((title: string) => {
    setNewAchievement(title);
    setTimeout(() => setNewAchievement(null), 6000);
  }, []);

  useEffect(() => {
    (window as any).__showAchievement = handleExternalAchievement;
    return () => {
      delete (window as any).__showAchievement;
    };
  }, [handleExternalAchievement]);

  const handleGoToLogin = () => {
    router.push('/login');
  };

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
        
        {! isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white bg-black/90 z-10 pointer-events-none">
            <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
            <p className="font-mono text-sm animate-pulse">Iniciando Sistema... </p>
          </div>
        )}

        {saveStatus !== 'idle' && (
          <div className={`absolute top-4 right-4 z-20 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2
            ${saveStatus === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-200' : 'bg-background-card/90 border-white/10 text-white'}`}>
            {saveStatus === 'saving' && <><Loader2 className="h-4 w-4 animate-spin text-brand-primary" /><span>Salvando...</span></>}
            {saveStatus === 'success' && <><CheckCircle2 className="h-4 w-4 text-accent-success" /><span>Salvo!</span></>}
            {saveStatus === 'error' && <><AlertTriangle className="h-4 w-4 text-accent-danger" /><span>Erro ao salvar</span></>}
          </div>
        )}

        {loadStatus !== 'idle' && (
          <div className={`absolute top-16 right-4 z-20 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2
            ${loadStatus === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-200' : 'bg-blue-950/90 border-blue-500/50 text-blue-200'}`}>
            {loadStatus === 'loading' && <><Loader2 className="h-4 w-4 animate-spin" /><span>Carregando... </span></>}
            {loadStatus === 'success' && <><CheckCircle2 className="h-4 w-4" /><span>Carregado!</span></>}
            {loadStatus === 'error' && <><AlertTriangle className="h-4 w-4" /><span>Erro. </span></>}
          </div>
        )}

        {newAchievement && (
          <div className="absolute top-4 left-4 z-30 flex items-center gap-4 rounded-xl border border-brand-primary/50 bg-black/90 p-4 shadow-glow animate-in slide-in-from-top-4 duration-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 text-white shadow-lg animate-bounce">
              <Trophy size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">Conquista Desbloqueada! </span>
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
             {isGuest 
               ? "Crie uma conta para salvar seu progresso na nuvem." 
               : "Use o ícone de disquete (💾) dentro do jogo.  O save é automático. "}
          </span>
        </div>

        <button
          onClick={handleLoadClick}
          disabled={loadStatus === 'loading' || ! isPlaying}
          className="flex items-center gap-2 rounded-md bg-background-secondary px-4 py-2 text-sm font-medium text-text-primary hover:bg-background-tertiary hover:text-white transition-colors border border-background-tertiary disabled:opacity-50"
        >
          {isGuest ? (
             <><LogIn size={16} /> Entrar para Salvar</>
          ) : (
             <><DownloadCloud className="h-4 w-4 text-brand-primary" /> Recarregar da Nuvem</>
          )}
        </button>
      </div>

      <ConfirmationModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onConfirm={handleGoToLogin}
        title="Crie sua conta para salvar!"
        description="Visitantes podem jogar à vontade, mas o progresso é perdido ao fechar a aba.  Crie uma conta gratuita para habilitar o salvamento na nuvem e continuar de onde parou em qualquer lugar."
        isLoading={false}
        variant="primary"
        confirmLabel="Criar Conta / Login"
        cancelLabel="Jogar sem salvar"
      />
    </div>
  );
}
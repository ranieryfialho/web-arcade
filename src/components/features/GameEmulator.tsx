'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Save, CheckCircle2, CloudUpload, AlertTriangle, Trophy } from 'lucide-react';
import { Database } from '@/types/database.types';
import { getLatestSave, uploadSaveState, incrementPlaytime } from '@/app/play/actions';

type Game = Database['public']['Tables']['games']['Row'];

interface GameEmulatorProps {
  game: Game;
}

export function GameEmulator({ game }: GameEmulatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoadedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Estados para feedback visual do Save
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Estado para feedback visual da Conquista
  const [newAchievement, setNewAchievement] = useState<string | null>(null);

  const getSystemCode = (consoleType: string) => {
    switch (consoleType) {
      case 'SNES': return 'snes';
      case 'MEGA_DRIVE': return 'segaMD';
      case 'GBA': return 'gba';
      default: return '';
    }
  };

  // Carrega o save da nuvem
  const loadCloudSave = async () => {
    try {
      const signedUrl = await getLatestSave(game.id);
      if (signedUrl) {
        console.log("☁️ Save encontrado na nuvem. Baixando...", signedUrl);
        const response = await fetch(signedUrl);
        const blob = await response.blob();
        
        // @ts-ignore
        if (window.EJS_emulator && typeof window.EJS_emulator.loadState === 'function') {
           // @ts-ignore
           window.EJS_emulator.loadState(blob);
        } else {
           // @ts-ignore
           window.EJS_loadStateBlob = blob;
        }
      }
    } catch (error) {
      console.error("❌ Erro ao carregar save:", error);
    }
  };

  // Processa o upload (chamado pelo interceptador)
  const processUpload = async (blob: Blob) => {
    setSaveStatus('saving');
    setErrorMessage('');
    
    try {
      console.log("☁️ Enviando save para o Supabase...");
      const formData = new FormData();
      formData.append('file', blob);
      formData.append('gameId', game.id);

      const result = await uploadSaveState(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      console.log("✅ Salvo com sucesso na nuvem!");
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (error: any) {
      console.error("❌ Erro no upload:", error);
      setSaveStatus('error');
      setErrorMessage(error.message || 'Erro desconhecido');
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  };

  // Efeito Principal: Configuração do Emulador
  useEffect(() => {
    if (isLoadedRef.current || !containerRef.current) return;
    isLoadedRef.current = true;

    // Configuração Global
    // @ts-ignore
    window.EJS_player = '#game-container';
    // @ts-ignore
    window.EJS_gameUrl = game.rom_url;
    // @ts-ignore
    window.EJS_core = getSystemCode(game.console_type);
    // @ts-ignore
    window.EJS_pathtodata = 'https://cdn.jsdelivr.net/gh/ethanaobrien/emulatorjs@main/data/';
    // @ts-ignore
    window.EJS_backgroundColor = '#0a0a0a';
    // @ts-ignore
    window.EJS_startOnLoaded = true;
    
    // Configura botões nativos
    // @ts-ignore
    window.EJS_b_save = true; 
    // @ts-ignore
    window.EJS_b_load = false;

    // INTERCEPTADOR DE SAVE
    // @ts-ignore
    window.EJS_onSaveState = (data: any) => {
      try {
        console.log("💾 Interceptando save nativo...");
        const actualData = data.state || data;
        if (actualData) {
          const blob = new Blob([actualData], { type: 'application/octet-stream' });
          processUpload(blob);
        }
      } catch (e) {
        console.error("Erro crítico ao interceptar save:", e);
      }
      return false; // Bloqueia download nativo
    };

    // Hook de início do jogo
    // @ts-ignore
    window.EJS_onGameStart = () => {
      setIsPlaying(true);
      setTimeout(() => loadCloudSave(), 2000);
    };

    // Injeta o script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/ethanaobrien/emulatorjs@main/data/loader.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
       // @ts-ignore
       window.EJS_onSaveState = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]); 

  // NOVO: Efeito de Heartbeat (Gamificação)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      // Configurado para 60 segundos (tempo real de jogo)
      interval = setInterval(async () => {
        // Envia o tempo para o servidor (adiciona 60s)
        const unlocked = await incrementPlaytime(60);
        
        if (unlocked) {
          console.log("🏆 CONQUISTA:", unlocked.title);
          setNewAchievement(unlocked.title);
          // Esconde o toast após 6s
          setTimeout(() => setNewAchievement(null), 6000);
        }
      }, 60000); // 60000ms = 1 minuto
    }

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-background-tertiary bg-black shadow-2xl">
        <div id="game-container" ref={containerRef} className="h-full w-full" />
        
        {/* Loading Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white bg-black/90 z-10">
            <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
            <p className="font-mono text-sm animate-pulse">Iniciando Sistema...</p>
          </div>
        )}

        {/* Toast de Save */}
        {saveStatus !== 'idle' && (
          <div className={`absolute top-4 right-4 z-20 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2
            ${saveStatus === 'error' 
              ? 'bg-red-950/90 border-red-500/50 text-red-200' 
              : 'bg-background-card/90 border-white/10 text-white'}`}
          >
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
                <span>Sincronizando com a nuvem...</span>
              </>
            )}
            {saveStatus === 'success' && (
              <>
                <CheckCircle2 className="h-4 w-4 text-accent-success" />
                <span className="text-accent-success">Progresso salvo com sucesso!</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertTriangle className="h-4 w-4 text-accent-danger" />
                <div className="flex flex-col">
                  <span className="font-bold">Erro ao salvar</span>
                  <span className="text-xs opacity-80">{errorMessage}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* NOVO: Toast de Conquista */}
        {newAchievement && (
          <div className="absolute top-4 left-4 z-30 flex items-center gap-4 rounded-xl border border-brand-primary/50 bg-black/90 p-4 shadow-glow animate-in slide-in-from-top-4 duration-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 text-white shadow-lg animate-bounce">
              <Trophy size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                Conquista Desbloqueada!
              </span>
              <span className="text-lg font-bold text-white leading-tight">
                {newAchievement}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Barra de Instruções */}
      <div className="flex items-center justify-between rounded-lg border border-background-tertiary bg-background-card p-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Save size={16} className="text-brand-primary" />
            Como Salvar
          </span>
          <span className="text-xs text-text-muted">
            Clique no ícone de disquete (<span className="text-white">💾</span>) na barra de ferramentas 
            <strong> dentro do jogo</strong> acima. O Web Arcade interceptará o arquivo e salvará na nuvem automaticamente.
          </span>
        </div>
      </div>
    </div>
  );
}
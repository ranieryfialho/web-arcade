'use client';

import { useEffect, useRef, useState, MouseEvent } from 'react';
import { Loader2, Save, CheckCircle2, CloudUpload, AlertTriangle, Trophy, RotateCcw, DownloadCloud } from 'lucide-react';
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
  
  // Estados para feedback visual
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [newAchievement, setNewAchievement] = useState<string | null>(null);

  const getSystemCode = (consoleType: string) => {
    switch (consoleType) {
      case 'SNES': return 'snes';
      case 'MEGA_DRIVE': return 'segaMD';
      case 'GBA': return 'gba';
      default: return '';
    }
  };

  // --- FUNÇÃO DE CARREGAR (MANUAL) ---
  const handleLoadClick = async (e: MouseEvent<HTMLButtonElement>) => {
    // 1. Bloqueia qualquer comportamento padrão do navegador (como recarregar página)
    e.preventDefault(); 
    e.stopPropagation();

    setLoadStatus('loading');
    try {
      const signedUrl = await getLatestSave(game.id);
      
      if (!signedUrl) {
        setErrorMessage("Nenhum save encontrado.");
        setLoadStatus('error'); 
        setTimeout(() => setLoadStatus('idle'), 3000);
        return; 
      }

      console.log("☁️ Save encontrado. Baixando...", signedUrl);
      
      const response = await fetch(signedUrl);
      const arrayBuffer = await response.arrayBuffer(); 
      const u8array = new Uint8Array(arrayBuffer); 

      // @ts-ignore
      const emulator = window.EJS_emulator;

      if (emulator) {
        console.log("🎮 Injetando save no emulador...");
        
        if (typeof emulator.loadState === 'function') {
           emulator.loadState(u8array);
        } else if (emulator.gameManager && typeof emulator.gameManager.loadState === 'function') {
           emulator.gameManager.loadState(u8array);
        } else {
           console.warn("⚠️ Core não suporta loadState dinâmico.");
           setErrorMessage("Erro: Core incompatível.");
           setLoadStatus('error');
           return;
        }
        
        setLoadStatus('success');
        setTimeout(() => setLoadStatus('idle'), 3000);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar save:", error);
      setLoadStatus('error');
      setTimeout(() => setLoadStatus('idle'), 3000);
    }
  };

  // Processa o upload
  const processUpload = async (blob: Blob) => {
    setSaveStatus('saving');
    setErrorMessage('');
    
    try {
      console.log("☁️ Enviando save para o Supabase...");
      const formData = new FormData();
      formData.append('file', blob);
      formData.append('gameId', game.id);

      const result = await uploadSaveState(formData);

      if (result.error) throw new Error(result.error);

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

  // --- EFEITO PRINCIPAL ---
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
    
    // UI Config
    // @ts-ignore
    window.EJS_b_save = true; 
    // @ts-ignore
    window.EJS_b_load = false; 

    // Interceptador de Save
    // @ts-ignore
    window.EJS_onSaveState = (data: any) => {
      try {
        const actualData = data.state || data;
        if (actualData) {
          const blob = new Blob([actualData], { type: 'application/octet-stream' });
          processUpload(blob);
        }
      } catch (e) {
        console.error("Erro no interceptador:", e);
      }
      return false; 
    };

    // @ts-ignore
    window.EJS_onGameStart = () => {
      setIsPlaying(true);
    };

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/ethanaobrien/emulatorjs@main/data/loader.js';
    script.async = true;
    document.body.appendChild(script);

    // --- CLEANUP ---
    return () => {
       console.log("🧹 Limpando emulador...");
       // @ts-ignore
       if (window.EJS_emulator && typeof window.EJS_emulator.destroy === 'function') {
           // @ts-ignore
           window.EJS_emulator.destroy();
       }
       // @ts-ignore
       window.EJS_onSaveState = null;
       // @ts-ignore
       window.EJS_onGameStart = null;
       // @ts-ignore
       window.EJS_emulator = null;
       
       if (document.body.contains(script)) {
         document.body.removeChild(script);
       }
       isLoadedRef.current = false;
    };
    // Dependências primitivas para evitar reload desnecessário
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.id, game.rom_url, game.console_type]); 

  // Heartbeat
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
        <div id="game-container" ref={containerRef} className="h-full w-full" />
        
        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white bg-black/90 z-10">
            <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
            <p className="font-mono text-sm animate-pulse">Iniciando Sistema...</p>
          </div>
        )}

        {/* Feedback de Save */}
        {saveStatus !== 'idle' && (
          <div className={`absolute top-4 right-4 z-20 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2
            ${saveStatus === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-200' : 'bg-background-card/90 border-white/10 text-white'}`}>
            {saveStatus === 'saving' && <><Loader2 className="h-4 w-4 animate-spin text-brand-primary" /><span>Salvando na nuvem...</span></>}
            {saveStatus === 'success' && <><CheckCircle2 className="h-4 w-4 text-accent-success" /><span>Salvo com sucesso!</span></>}
            {saveStatus === 'error' && <><AlertTriangle className="h-4 w-4 text-accent-danger" /><span>Erro ao salvar.</span></>}
          </div>
        )}

        {/* Feedback de Load */}
        {loadStatus !== 'idle' && (
          <div className={`absolute top-16 right-4 z-20 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2
            ${loadStatus === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-200' : 'bg-blue-950/90 border-blue-500/50 text-blue-200'}`}>
            {loadStatus === 'loading' && <><Loader2 className="h-4 w-4 animate-spin" /><span>Carregando da nuvem...</span></>}
            {loadStatus === 'success' && <><RotateCcw className="h-4 w-4" /><span>Jogo restaurado!</span></>}
            {loadStatus === 'error' && <><AlertTriangle className="h-4 w-4" /><span>{errorMessage || 'Falha ao carregar.'}</span></>}
          </div>
        )}

        {/* Toast de Conquista */}
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
            Use o ícone de disquete (<span className="text-white">💾</span>) na barra do jogo. O sistema salva na nuvem automaticamente.
          </span>
        </div>

        {/* BOTÃO CORRIGIDO */}
        <button
          type="button" // <--- TRAVA O COMPORTAMENTO DE SUBMIT
          onClick={handleLoadClick} // <--- CHAMA A FUNÇÃO COM PREVENT DEFAULT
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
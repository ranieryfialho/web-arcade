'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Database } from '@/types/database.types';

type Game = Database['public']['Tables']['games']['Row'];

interface GameEmulatorProps {
  game: Game;
}

export function GameEmulator({ game }: GameEmulatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const getSystemCode = (consoleType: string) => {
    switch (consoleType) {
      case 'SNES': return 'snes';
      case 'MEGA_DRIVE': return 'segaMD';
      case 'GBA': return 'gba';
      default: return '';
    }
  };

  useEffect(() => {
    if (!containerRef.current || isPlaying) return;

    // @ts-ignore
    window.EJS_player = '#game-container';
    // @ts-ignore
    window.EJS_gameUrl = game.rom_url;
    // @ts-ignore
    window.EJS_core = getSystemCode(game.console_type);
    // @ts-ignore
    window.EJS_pathtodata = 'https://cdn.jsdelivr.net/gh/ethanaobrien/emulatorjs@main/data/';
    // @ts-ignore - Tema escuro para combinar com o site
    window.EJS_backgroundColor = '#0a0a0a'; 
    // @ts-ignore
    window.EJS_startOnLoaded = true;
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/ethanaobrien/emulatorjs@main/data/loader.js';
    script.async = true;
    
    script.onload = () => {
      setIsPlaying(true);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [game, isPlaying]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-background-tertiary bg-black shadow-2xl">
      <div id="game-container" ref={containerRef} className="h-full w-full" />

      {!isPlaying && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
          <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
          <p className="font-mono text-sm animate-pulse">Carregando Sistema...</p>
        </div>
      )}
    </div>
  );
}
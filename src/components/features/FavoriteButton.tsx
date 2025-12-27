'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toggleFavorite } from '@/app/favorites/actions';

interface FavoriteButtonProps {
  gameId: string;
  initialIsFavorite: boolean;
}

export function FavoriteButton({ gameId, initialIsFavorite }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (isLoading) return;
    
    const newState = !isFavorite;
    setIsFavorite(newState);
    setIsLoading(true);

    try {
      await toggleFavorite(gameId);
    } catch (error) {
      setIsFavorite(!newState);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`group flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold transition-all 
        ${isFavorite 
          ? 'border-red-500/50 bg-red-500/10 text-red-500 hover:bg-red-500/20' 
          : 'border-background-tertiary bg-background-secondary text-text-secondary hover:text-white hover:border-white/20'
        }`}
      title={isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
    >
      <Heart 
        size={18} 
        className={`transition-transform group-active:scale-75 ${isFavorite ? 'fill-current' : ''}`} 
      />
      <span className="hidden sm:inline">
        {isFavorite ? 'Favorito' : 'Favoritar'}
      </span>
    </button>
  );
}
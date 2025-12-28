'use client';

import { Heart } from 'lucide-react';
import { toggleFavorite } from '@/app/play/actions'; 
import { useState } from 'react';

interface FavoriteButtonProps {
  gameId: string;
  initialIsFavorite:  boolean;
}

export function FavoriteButton({ gameId, initialIsFavorite }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    
    const previousState = isFavorite;
    setIsFavorite(!isFavorite);

    try {
      const newUnlocks = await toggleFavorite(gameId);

      if (newUnlocks && newUnlocks.length > 0) {
        const showAchievement = (window as any).__showAchievement;
        
        if (showAchievement) {
          newUnlocks.forEach((achievementTitle, index) => {
            setTimeout(() => {
              showAchievement(achievementTitle);
            }, index * 6500);
          });
        } else {
          console.warn('⚠️ GameEmulator não está disponível para exibir conquista');
        }
      }

    } catch (error) {
      console.error(error);
      setIsFavorite(previousState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all border
        ${isFavorite 
          ? 'bg-red-500/10 text-red-500 border-red-500/50 hover:bg-red-500/20' 
          : 'bg-background-tertiary text-text-secondary border-transparent hover:bg-background-hover hover:text-white'
        }`}
    >
      <Heart size={18} fill={isFavorite ? "currentColor" : "none"} className={loading ? "animate-pulse" : ""} />
      {isFavorite ? 'Favorito' : 'Favoritar'}
    </button>
  );
}
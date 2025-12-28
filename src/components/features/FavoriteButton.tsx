'use client';

import { Heart, Trophy } from 'lucide-react';
import { toggleFavorite } from '@/app/play/actions'; 
import { toast } from 'sonner';
import { useState } from 'react';

interface FavoriteButtonProps {
  gameId: string;
  initialIsFavorite: boolean;
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
        newUnlocks.forEach((achievementTitle) => {
          toast.success(`Conquista Desbloqueada: ${achievementTitle}`, {
            icon: <Trophy className="text-yellow-500 h-5 w-5" />,
            duration: 5000,
            style: {
              background: '#1a1a1a',
              border: '1px solid #7c3aed',
              color: '#fff'
            }
          });
        });
      } else {
        if (!previousState) {
          toast.success("Adicionado aos favoritos");
        } else {
          toast.info("Removido dos favoritos");
        }
      }

    } catch (error) {
      console.error(error);
      setIsFavorite(previousState);
      toast.error("Erro ao favoritar.");
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
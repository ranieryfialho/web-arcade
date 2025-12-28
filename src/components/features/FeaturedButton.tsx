'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { toggleFeaturedAchievement } from '@/app/achievements/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface FeaturedButtonProps {
  achievementId: string;
  initialIsFeatured: boolean;
}

export function FeaturedButton({ achievementId, initialIsFeatured }:  FeaturedButtonProps) {
  const [isFeatured, setIsFeatured] = useState(initialIsFeatured);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;
    
    setIsLoading(true);

    try {
      const result = await toggleFeaturedAchievement(achievementId);

      if (result?. error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      if (result?.success) {
        setIsFeatured(result.isFeatured);
        
        if (result.isFeatured) {
          toast.success('Conquista adicionada aos destaques do perfil!');
        } else {
          toast.info('Conquista removida dos destaques');
        }

        // Aguardar um pouco e revalidar
        setTimeout(() => {
          router.refresh();
          setIsLoading(false);
        }, 300);
      }
    } catch (error) {
      console.error('Erro ao destacar conquista:', error);
      toast.error('Erro ao atualizar conquista');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`shrink-0 rounded-lg p-2 transition-all
        ${isFeatured 
          ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30' 
          : 'bg-background-tertiary text-text-muted hover:bg-background-hover hover:text-yellow-500'
        }
        disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isFeatured ? 'Remover dos destaques' : 'Adicionar aos destaques do perfil'}
    >
      <Star 
        size={16} 
        fill={isFeatured ? 'currentColor' : 'none'} 
        className={isLoading ? 'animate-spin' : ''} 
      />
    </button>
  );
}
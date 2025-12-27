import { Lock, Trophy } from 'lucide-react';
import { clsx } from 'clsx';
import { Database } from '@/types/database.types';

type Achievement = Database['public']['Tables']['achievements']['Row'];

interface AchievementCardProps {
  achievement: Achievement;
  unlockedAt?: string | null; // Se existir data, está desbloqueado
}

export function AchievementCard({ achievement, unlockedAt }: AchievementCardProps) {
  const isUnlocked = !!unlockedAt;

  return (
    <div 
      className={clsx(
        "relative flex flex-col items-center p-6 rounded-xl border transition-all duration-300",
        isUnlocked 
          ? "bg-background-card border-brand-primary/50 shadow-glow" 
          : "bg-background-secondary border-background-tertiary opacity-70 grayscale hover:grayscale-0 hover:opacity-100"
      )}
    >
      {/* Ícone / Medalha */}
      <div 
        className={clsx(
          "flex h-16 w-16 items-center justify-center rounded-full mb-4 text-3xl transition-transform duration-500",
          isUnlocked 
            ? "bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-lg scale-110" 
            : "bg-background-tertiary text-text-muted"
        )}
      >
        {isUnlocked ? <Trophy size={32} /> : <Lock size={24} />}
      </div>

      {/* Textos */}
      <h3 className="text-lg font-bold text-text-primary text-center mb-1">
        {achievement.title}
      </h3>
      <p className="text-sm text-text-secondary text-center leading-snug">
        {achievement.description}
      </p>

      {/* Data de Desbloqueio (se houver) */}
      {isUnlocked && (
        <span className="absolute top-3 right-3 text-[10px] font-mono text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full border border-brand-primary/20">
          {new Date(unlockedAt).toLocaleDateString('pt-BR')}
        </span>
      )}
      
      {/* Barra de Progresso Fictícia (Visual apenas para bloqueados) */}
      {!isUnlocked && (
        <div className="w-full mt-4 h-1.5 bg-background-tertiary rounded-full overflow-hidden">
          <div className="h-full bg-text-muted w-[10%] opacity-20" />
        </div>
      )}
    </div>
  );
}
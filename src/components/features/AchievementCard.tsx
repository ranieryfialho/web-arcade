'use client';

import { Trophy, Calendar } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  unlockedAt:  string;
}

export function AchievementCard({ achievement, unlockedAt }: AchievementCardProps) {
  const formattedDate = new Date(unlockedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month:  'short',
    year: 'numeric'
  });

  return (
    <div className="group relative overflow-hidden rounded-xl border border-brand-primary/30 bg-gradient-to-br from-background-card to-background-secondary p-5 transition-all duration-300 hover:border-brand-primary hover:shadow-glow hover:-translate-y-1">
      
      <div className="flex items-start gap-4">
        {/* Ícone do Troféu */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-brand-primary bg-brand-primary/20 text-brand-primary transition-all group-hover:scale-110 group-hover:rotate-12 shadow-lg">
          <Trophy size={32} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Título */}
          <h3 className="font-bold text-lg leading-tight text-text-primary group-hover:text-brand-primary transition-colors">
            {achievement.title}
          </h3>
          
          {/* Descrição */}
          <p className="mt-2 text-sm text-text-secondary line-clamp-2 leading-relaxed">
            {achievement.description}
          </p>

          {/* Data de Desbloqueio */}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
            <Calendar size={12} className="text-brand-primary" />
            <span>Desbloqueado em {formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Brilho de fundo (hover) */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-primary/0 via-brand-primary/5 to-brand-primary/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
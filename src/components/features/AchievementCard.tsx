'use client';

import React from 'react';
import { Trophy, Lock, Calendar } from 'lucide-react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: string;
  points: number;
  unlockedAt?: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementCardProps {
  achievement: Achievement;
}

const rarityColors = {
  common: 'text-slate-400 border-slate-700 bg-slate-800/50',
  rare: 'text-blue-400 border-blue-700 bg-blue-900/20',
  epic: 'text-purple-400 border-purple-700 bg-purple-900/20',
  legendary: 'text-amber-400 border-amber-700 bg-amber-900/20',
};

export default function AchievementCard({ achievement }: AchievementCardProps) {
  const isUnlocked = !!achievement.unlockedAt;
  
  const formattedDate = achievement.unlockedAt 
    ? new Date(achievement.unlockedAt).toLocaleDateString('pt-BR') 
    : null;

  return (
    <div 
      className={`relative group flex items-center p-4 rounded-xl border transition-all duration-300 
      ${isUnlocked 
        ? `${rarityColors[achievement.rarity]} border-opacity-50 hover:border-opacity-100 hover:scale-[1.02]` 
        : 'bg-slate-900/50 border-slate-800 opacity-60 grayscale hover:grayscale-0 hover:opacity-80'
      }`}
    >
      <div className={`flex-shrink-0 mr-4 w-12 h-12 rounded-full flex items-center justify-center border-2 
        ${isUnlocked ? 'border-current bg-black/30' : 'border-slate-700 bg-slate-800'}`}>
        {isUnlocked ? (
          <Trophy className="w-6 h-6" />
        ) : (
          <Lock className="w-5 h-5 text-slate-500" />
        )}
      </div>

      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <h3 className={`font-bold text-lg ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
            {achievement.title}
          </h3>
          <span className={`text-xs font-mono px-2 py-0.5 rounded border ${rarityColors[achievement.rarity].split(' ')[1]} border-opacity-40`}>
            +{achievement.points} XP
          </span>
        </div>
        
        <p className="text-sm text-slate-400 mt-1 leading-relaxed">
          {achievement.description}
        </p>
        
        {isUnlocked && (
          <div className="flex items-center mt-3 text-xs opacity-70">
            <Calendar className="w-3 h-3 mr-1" />
            <span>Desbloqueado em {formattedDate}</span>
          </div>
        )}
      </div>

      {isUnlocked && (achievement.rarity === 'legendary' || achievement.rarity === 'epic') && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 animate-pulse" />
      )}
    </div>
  );
}
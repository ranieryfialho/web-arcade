'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Trash2, Play, Calendar, Loader2 } from 'lucide-react';
import { deleteSave } from '@/app/profile/actions';

interface SaveRowProps {
  save: {
    id: string;
    last_played_at: string;
    games: {
      id: string;
      title: string;
      console_type: string;
    } | null;
  };
}

export function SaveRow({ save }: SaveRowProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const confirmed = window.confirm(`Tem certeza que deseja apagar o save de ${save.games?.title}? Essa ação não pode ser desfeita.`);
    if (!confirmed) return;

    startTransition(async () => {
      await deleteSave(save.id);
    });
  };

  if (!save.games) return null;

  return (
    <tr className="group hover:bg-background-secondary/50 transition-colors border-b border-background-tertiary last:border-0">
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-bold text-text-primary text-sm sm:text-base">
            {save.games.title}
          </span>
          <span className="text-xs text-text-muted md:hidden">
            {save.games.console_type}
          </span>
        </div>
      </td>

      <td className="px-6 py-4 hidden md:table-cell">
        <span className="rounded bg-background-tertiary border border-white/10 px-2 py-1 text-xs font-mono font-bold text-text-secondary">
          {save.games.console_type}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Calendar size={14} className="text-brand-primary" />
          <span>
            {new Date(save.last_played_at).toLocaleDateString('pt-BR')} 
            <span className="hidden sm:inline"> às {new Date(save.last_played_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </span>
        </div>
      </td>

      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/play/${save.games.id}?autoload=true`}
            className="flex items-center gap-2 rounded-md bg-brand-primary/10 px-3 py-2 text-sm font-bold text-brand-primary hover:bg-brand-primary hover:text-white transition-all"
            title="Continuar Jogo de onde parou"
          >
            <Play size={16} fill="currentColor" />
            <span className="hidden sm:inline">Jogar</span>
          </Link>

          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center justify-center rounded-md p-2 text-text-muted hover:bg-red-950/30 hover:text-red-500 transition-colors disabled:opacity-50"
            title="Apagar Save"
          >
            {isPending ? (
              <Loader2 size={18} className="animate-spin text-red-500" />
            ) : (
              <Trash2 size={18} />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}
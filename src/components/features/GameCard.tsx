import Link from 'next/link';
import { Play } from 'lucide-react';
import { Database } from '@/types/database.types';
import { ConsoleBadge } from '@/components/ui/ConsoleBadge';

type Game = Database['public']['Tables']['games']['Row'];

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-background-tertiary bg-background-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary hover:shadow-glow">
      <div className="relative aspect-video w-full overflow-hidden bg-background-tertiary">
        <img
          src={game.cover_url}
          alt={`Capa do jogo ${game.title}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
          <Link
            href={`/play/${game.id}`}
            className="flex items-center gap-2 rounded-full bg-brand-primary px-6 py-2 font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-brand-primaryHover"
          >
            <Play size={16} fill="currentColor" />
            JOGAR
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between">
          <ConsoleBadge type={game.console_type} />
        </div>
        
        <h3 className="line-clamp-1 font-mono text-lg font-bold text-text-primary" title={game.title}>
          {game.title}
        </h3>
        
        <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
          {game.description || 'Sem descrição disponível.'}
        </p>
      </div>
    </div>
  );
}
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { GameEmulator } from '@/components/features/GameEmulator';
import { ConsoleBadge } from '@/components/ui/ConsoleBadge';
import { FavoriteButton } from '@/components/features/FavoriteButton';

interface PlayPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PlayPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: game } = await (supabase.from('games') as any).select('title').eq('id', id).single();
  
  return {
    title: game ?  `Jogando ${game.title} | Web Arcade` : 'Jogo não encontrado',
  };
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: game, error } = await (supabase.from('games') as any)
    .select('*')
    .eq('id', id)
    .single();

  if (error || !game) {
    notFound();
  }

  let isFavorite = false;
  if (user) {
    const { data: favData } = await (supabase.from('user_favorites') as any)
      .select('id')
      .eq('user_id', user.id)
      .eq('game_id', id)
      .single();
    isFavorite = !!favData;
  }

  const isGuest = !user;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background-primary">
      <div className="border-b border-background-tertiary bg-background-card px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <Link 
            href="/shelf" 
            className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-brand-primary transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
            Voltar
          </Link>
          
          <div className="flex items-center gap-4">
            {!isGuest && <FavoriteButton gameId={game.id} initialIsFavorite={isFavorite} />}
            
            <div className="flex items-center gap-3">
              <h1 className="font-mono text-lg font-bold text-text-primary hidden sm:block">
                {game.title}
              </h1>
              <ConsoleBadge type={game.console_type} />
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto flex flex-col items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-5xl">
          <GameEmulator game={game} isGuest={isGuest} />
          
          <div className="mt-6 flex items-start gap-4 rounded-lg bg-background-secondary p-4 border border-background-tertiary">
            <Info className="mt-1 h-5 w-5 text-brand-primary shrink-0" />
            <div>
              <h3 className="font-bold text-text-primary">Controles</h3>
              <p className="mt-1 text-sm text-text-secondary">
                Setas para mover.  
                <span className="mx-1 px-1 bg-background-tertiary rounded text-xs">Z</span>
                para A, 
                <span className="mx-1 px-1 bg-background-tertiary rounded text-xs">X</span>
                para B.  
                <span className="mx-1 px-1 bg-background-tertiary rounded text-xs">Enter</span>
                para Start.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
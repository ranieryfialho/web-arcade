import { Gamepad2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { GameCard } from '@/components/features/GameCard';

export const metadata = {
  title: 'The Shelf | Web Arcade',
  description: 'Explore nossa coleção de clássicos.',
};

export default async function ShelfPage() {
  const supabase = await createClient();

  const { data: games, error } = await supabase
    .from('games')
    .select('*')
    .order('title', { ascending: true });

  if (error) {
    console.error('Erro ao buscar jogos:', error);
    return (
      <div className="flex h-[50vh] w-full items-center justify-center text-accent-danger">
        <p>Erro ao carregar a biblioteca. Tente novamente mais tarde.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen px-4 py-8">
      <div className="mb-10 flex flex-col gap-4 border-b border-background-tertiary pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 font-mono text-4xl font-bold text-text-primary">
            <Gamepad2 className="text-brand-primary" size={40} />
            Biblioteca de Jogos
          </h1>
          <p className="mt-2 text-text-secondary">
            Sua coleção pessoal de memórias digitais. Escolha um cartucho e divirta-se.
          </p>
        </div>
        
        <div className="text-sm font-medium text-text-muted">
          {games?.length || 0} Jogos disponíveis
        </div>
      </div>

      {games && games.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-background-tertiary p-6 text-text-muted">
            <Gamepad2 size={48} />
          </div>
          <h3 className="text-xl font-bold text-text-primary">A estante está vazia</h3>
          <p className="mt-2 text-text-secondary">
            Nenhum jogo encontrado no banco de dados.
          </p>
        </div>
      )}
    </div>
  );
}
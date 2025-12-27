import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Gamepad2, Search } from 'lucide-react';
import { ConsoleBadge } from '@/components/ui/ConsoleBadge';

export const metadata = {
  title: 'Biblioteca de Jogos | Web Arcade',
};

export default async function ShelfPage() {
  const supabase = await createClient();

  const { data: games } = await supabase
    .from('games')
    .select('*')
    .order('title', { ascending: true });

  return (
    <div className="min-h-screen bg-background-primary px-4 py-8">
      <div className="container mx-auto space-y-8">
        
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-background-tertiary pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white shadow-glow">
              <Gamepad2 size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Biblioteca</h1>
              <p className="text-text-secondary">Explore nossa coleção de clássicos.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {games?.map((game) => (
            <Link 
              key={game.id} 
              href={`/play/${game.id}`}
              className="group relative overflow-hidden rounded-xl border border-background-tertiary bg-background-card transition-all hover:-translate-y-1 hover:border-brand-primary hover:shadow-glow"
            >
              <div className="aspect-video w-full bg-black relative">
                <img 
                  src={game.cover_url} 
                  alt={game.title} 
                  className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                />
                <div className="absolute bottom-2 right-2">
                  <ConsoleBadge type={game.console_type} />
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-text-primary truncate">{game.title}</h3>
                <p className="text-xs text-text-muted mt-1">Clique para jogar agora</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
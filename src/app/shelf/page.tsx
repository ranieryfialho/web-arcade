import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Gamepad2, Search, Play } from 'lucide-react';
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

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {games?.map((game) => (
            <Link 
              key={game.id} 
              href={`/play/${game.id}`}
              className="group relative overflow-hidden rounded-2xl border border-background-tertiary bg-background-card transition-all duration-300 hover:-translate-y-2 hover:border-brand-primary hover:shadow-2xl"
            >
              <div className="aspect-video w-full bg-black relative p-4 overflow-hidden">
                
                <div 
                  className="absolute inset-0 opacity-30 blur-xl scale-110 transition-opacity group-hover:opacity-50"
                  style={{ backgroundImage: `url(${game.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />

                <img 
                  src={game.cover_url} 
                  alt={game.title} 
                  className="relative h-full w-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-2xl z-10"
                />

                <div className="absolute bottom-3 right-3 z-20">
                  <ConsoleBadge type={game.console_type} />
                </div>
                
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-[2px]">
                   <div className="flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 font-bold text-white shadow-glow transform scale-90 group-hover:scale-100 transition-transform">
                      <Play size={20} fill="currentColor" /> Jogar
                   </div>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-xl font-bold text-text-primary truncate">{game.title}</h3>
                <p className="mt-1 text-sm text-text-secondary line-clamp-2 h-10">
                   {game.description || "Uma aventura clássica espera por você."}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
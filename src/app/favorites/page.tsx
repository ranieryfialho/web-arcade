import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Heart, Play, Ghost } from 'lucide-react';
import { ConsoleBadge } from '@/components/ui/ConsoleBadge'; 

export const metadata = {
  title: 'Meus Favoritos | Web Arcade',
};

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: favorites } = await (supabase.from('user_favorites') as any)
    .select('created_at, games(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-background-primary px-4 py-8">
      <div className="container mx-auto space-y-8">
        
        <div className="flex items-center gap-3 border-b border-background-tertiary pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
            <Heart size={24} className="fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Meus Favoritos</h1>
            <p className="text-text-secondary">Seus jogos preferidos, sempre à mão.</p>
          </div>
        </div>

        {(favorites as any) && (favorites as any).length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(favorites as any).map((fav: any) => (
              <Link 
                key={fav.games.id} 
                href={`/play/${fav.games.id}`}
                className="group relative overflow-hidden rounded-xl border border-background-tertiary bg-background-card transition-all hover:-translate-y-1 hover:border-brand-primary hover:shadow-glow"
              >
                <div className="aspect-video w-full bg-black relative">
                  {fav.games.cover_url ? (
                    <img 
                      src={fav.games.cover_url} 
                      alt={fav.games.title} 
                      className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-background-secondary text-brand-primary/20">
                      <Heart size={48} />
                    </div>
                  )}
                  
                  <div className="absolute bottom-2 right-2">
                    <span className="rounded bg-black/80 px-2 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/10">
                        {fav.games.console_type}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-text-primary truncate">{fav.games.title}</h3>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-text-muted">
                      Adicionado em {new Date(fav.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-brand-primary uppercase tracking-wide opacity-0 transition-opacity group-hover:opacity-100">
                      <Play size={12} fill="currentColor" /> Jogar
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center opacity-60">
            <Ghost size={64} className="text-text-muted" />
            <h2 className="text-xl font-bold text-text-primary">Tão vazio por aqui...</h2>
            <p className="text-sm text-text-secondary max-w-md">
              Você ainda não favoritou nenhum jogo. Entre em um jogo e clique no coração para salvá-lo aqui.
            </p>
            <Link 
              href="/shelf" 
              className="mt-4 rounded-md bg-brand-primary px-6 py-2 text-sm font-bold text-white hover:bg-brand-secondary"
            >
              Ir para a Biblioteca
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
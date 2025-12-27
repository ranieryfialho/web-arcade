import { notFound } from 'next/navigation';
import { ChevronLeft, Info } from 'lucide-react';
// Removemos o 'Link' do next/link e usamos a tag <a> padrão para forçar limpeza de memória
import { createClient } from '@/lib/supabase/server';
import { GameEmulator } from '@/components/features/GameEmulator';
import { ConsoleBadge } from '@/components/ui/ConsoleBadge';

interface PlayPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PlayPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: game } = await supabase.from('games').select('title').eq('id', id).single();
  
  return {
    title: game ? `Jogando ${game.title} | Web Arcade` : 'Jogo não encontrado',
  };
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Busca o jogo específico
  const { data: game, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !game) {
    notFound();
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background-primary">
      {/* Barra de Ferramentas */}
      <div className="border-b border-background-tertiary bg-background-card px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          
          {/* MUDANÇA AQUI: Usamos <a> em vez de <Link> */}
          {/* Isso força o navegador a recarregar a página ao sair, matando o áudio do emulador */}
          <a 
            href="/shelf" 
            className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-brand-primary transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
            Voltar para a Estante
          </a>
          
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-lg font-bold text-text-primary hidden sm:block">
              {game.title}
            </h1>
            <ConsoleBadge type={game.console_type} />
          </div>
        </div>
      </div>

      {/* Área do Emulador */}
      <main className="flex-1 container mx-auto flex flex-col items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-5xl">
          <GameEmulator game={game} />
          
          {/* Informações Extras */}
          <div className="mt-6 flex items-start gap-4 rounded-lg bg-background-secondary p-4 border border-background-tertiary">
            <Info className="mt-1 h-5 w-5 text-brand-primary shrink-0" />
            <div>
              <h3 className="font-bold text-text-primary">Controles</h3>
              <p className="mt-1 text-sm text-text-secondary">
                Use as setas do teclado para mover. 
                <span className="mx-1 inline-block rounded border border-background-tertiary bg-background-tertiary px-1 text-xs text-text-primary">Z</span> 
                <span className="mx-1 inline-block rounded border border-background-tertiary bg-background-tertiary px-1 text-xs text-text-primary">X</span> 
                <span className="mx-1 inline-block rounded border border-background-tertiary bg-background-tertiary px-1 text-xs text-text-primary">A</span> 
                <span className="mx-1 inline-block rounded border border-background-tertiary bg-background-tertiary px-1 text-xs text-text-primary">S</span> 
                são os botões de ação. 
                <span className="mx-1 inline-block rounded border border-background-tertiary bg-background-tertiary px-1 text-xs text-text-primary">Enter</span> é Start.
                Controles (Joysticks) são detectados automaticamente.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
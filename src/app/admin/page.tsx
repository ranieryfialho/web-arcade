import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UploadCloud, Gamepad2, Library, Calendar, Pencil } from 'lucide-react';
import { createGame } from './actions';
import { SubmitButton } from './SubmitButton';
import { DeleteGameButton } from './DeleteGameButton';
import { FileUpload } from './FileUpload';

export default async function AdminPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== 'ranieryfialho@gmail.com') {
    redirect('/');
  }

  const { data: games } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-background-primary px-4 py-8">
      <div className="container mx-auto">
        
        <div className="mb-8 flex items-center gap-4">
           <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-brand-primary">
              <UploadCloud size={28} />
           </div>
           <div>
              <h1 className="text-2xl font-bold text-text-primary">Painel Admin</h1>
              <p className="text-text-secondary">Gerencie sua biblioteca de jogos</p>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-background-tertiary bg-background-card p-6 shadow-xl">
              <h2 className="mb-6 text-lg font-bold text-text-primary flex items-center gap-2">
                <Gamepad2 size={20} className="text-brand-secondary" />
                Novo Jogo
              </h2>

              <form action={createGame} className="flex flex-col gap-4" encType="multipart/form-data">
                
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-text-muted">Nome do Jogo</label>
                  <input 
                    name="title" 
                    required 
                    placeholder="Ex: Super Mario World" 
                    className="w-full rounded-md border border-background-tertiary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-text-muted">Plataforma</label>
                  <select 
                    name="console_type" 
                    required 
                    defaultValue="" 
                    className="w-full rounded-md border border-background-tertiary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none"
                  >
                    <option value="" disabled>Selecione...</option>
                    <option value="SNES">Super Nintendo (SNES)</option>
                    <option value="GBA">Game Boy Advance (GBA)</option>
                    <option value="MEGA_DRIVE">Mega Drive / Genesis</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase text-text-muted mb-1 block">Capa</label>
                    <FileUpload 
                        name="cover_file" 
                        label="" 
                        iconType="image" 
                        accept="image/*" 
                        required={true} 
                    />
                  </div>
                   <div>
                    <label className="text-xs font-bold uppercase text-text-muted mb-1 block">ROM</label>
                    <FileUpload 
                        name="rom_file" 
                        label=""
                        iconType="rom"
                        required={true} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-text-muted">Descrição</label>
                  <textarea 
                    name="description" 
                    rows={3} 
                    placeholder="Sinopse..." 
                    className="w-full rounded-md border border-background-tertiary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none" 
                  />
                </div>

                <SubmitButton />
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
             <div className="flex items-center justify-between rounded-lg bg-background-secondary p-4 border border-background-tertiary">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Library size={20} className="text-brand-primary" />
                  Biblioteca Atual
                </h2>
                <span className="text-xs font-bold bg-background-tertiary px-2 py-1 rounded text-text-secondary">
                  {games?.length || 0} Jogos
                </span>
             </div>

             <div className="grid grid-cols-1 gap-4">
                {games?.map((game) => (
                  <div key={game.id} className="flex items-start gap-4 rounded-xl border border-background-tertiary bg-background-card p-4 transition-all hover:border-brand-primary/50 group">
                    
                    <div className="h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-black border border-background-tertiary shadow-sm">
                      <img 
                        src={game.cover_url} 
                        alt={game.title} 
                        className="h-full w-full object-cover transition-transform group-hover:scale-105" 
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-20">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           <h3 className="font-bold text-text-primary truncate">{game.title}</h3>
                           <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded border border-brand-primary/20">
                             {game.console_type}
                           </span>
                        </div>
                        <p className="text-sm text-text-secondary line-clamp-1">
                          {game.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                           <Calendar size={12} /> {new Date(game.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <Link 
                            href={`/admin/edit/${game.id}`} 
                            className="p-2 text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                            title="Editar Jogo"
                          >
                            <Pencil size={16} />
                          </Link>

                          <DeleteGameButton id={game.id} title={game.title} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {(!games || games.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-text-muted border-2 border-dashed border-background-tertiary rounded-xl">
                    <p>Nenhum jogo cadastrado.</p>
                  </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
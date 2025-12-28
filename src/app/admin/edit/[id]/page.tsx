import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Gamepad2, ArrowLeft } from 'lucide-react';
import { updateGame } from '../../actions';
import { SubmitButton } from '../../SubmitButton';
import { FileUpload } from '../../FileUpload';

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== 'ranieryfialho@gmail.com') {
    redirect('/');
  }

  const { data: game } = await supabase.from('games').select('*').eq('id', id).single();
  if (!game) redirect('/admin');

  return (
    <div className="min-h-screen bg-background-primary px-4 py-12">
      <div className="mx-auto max-w-2xl">
        
        <Link href="/admin" className="mb-6 flex items-center gap-2 text-sm text-text-secondary hover:text-brand-primary transition-colors">
          <ArrowLeft size={16} /> Voltar para o Painel
        </Link>

        <div className="rounded-2xl border border-background-tertiary bg-background-card p-8 shadow-2xl">
          <div className="mb-8 flex items-center gap-4 border-b border-background-tertiary pb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Pencil size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Editar Jogo</h1>
              <p className="text-text-secondary">Alterar informações de {game.title}</p>
            </div>
          </div>

          <form action={updateGame} className="flex flex-col gap-6" encType="multipart/form-data">
            
            <input type="hidden" name="id" value={game.id} />

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Nome do Jogo</label>
              <input name="title" defaultValue={game.title} required className="w-full rounded-lg border border-background-tertiary bg-background-primary px-4 py-3 text-text-primary focus:border-brand-primary focus:outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Plataforma</label>
              <div className="relative">
                <Gamepad2 className="absolute left-3 top-3.5 h-5 w-5 text-text-muted" />
                <select name="console_type" defaultValue={game.console_type} required className="w-full appearance-none rounded-lg border border-background-tertiary bg-background-primary py-3 pl-10 pr-4 text-text-primary focus:border-brand-primary focus:outline-none">
                  <option value="SNES">Super Nintendo (SNES)</option>
                  <option value="GBA">Game Boy Advance (GBA)</option>
                  <option value="MEGA_DRIVE">Mega Drive / Genesis</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FileUpload name="cover_file" label="Nova Capa" iconType="image" accept="image/*" required={false} />
              <FileUpload name="rom_file" label="Nova ROM" iconType="rom" required={false} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Descrição</label>
              <textarea name="description" defaultValue={game.description} rows={4} className="w-full rounded-lg border border-background-tertiary bg-background-primary px-4 py-3 text-text-primary focus:border-brand-primary focus:outline-none" />
            </div>

            <SubmitButton text="Salvar Alterações" loadingText="Salvando..." />
          </form>
        </div>
      </div>
    </div>
  );
}
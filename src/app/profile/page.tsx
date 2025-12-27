import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Trash2, Calendar, Gamepad2, Trophy, Save as DiskIcon } from 'lucide-react';
import { ProfileForm } from '@/components/features/ProfileForm';
import { AchievementCard } from '@/components/features/AchievementCard';
import { SaveRow } from '@/components/features/SaveRow';

export const metadata = {
  title: 'Meu Perfil | Web Arcade',
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: myAchievements } = await supabase
    .from('user_achievements')
    .select('unlocked_at, achievements(*)')
    .eq('user_id', user.id)
    .order('unlocked_at', { ascending: false });

  const { data: mySaves } = await supabase
    .from('user_saves')
    .select('id, last_played_at, games(id, title, console_type)')
    .eq('user_id', user.id)
    .order('last_played_at', { ascending: false });

  return (
    <div className="container mx-auto min-h-screen px-4 py-8 space-y-8">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 rounded-2xl border border-background-tertiary bg-background-card p-6 shadow-xl">
        <div className="flex flex-col items-center justify-center gap-4 border-b border-background-tertiary md:border-b-0 md:border-r pr-0 md:pr-6 pb-6 md:pb-0">
          <div className="h-32 w-32 rounded-full border-4 border-brand-primary overflow-hidden shadow-glow bg-black">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-brand-primary bg-background-secondary">
                {profile?.username?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary">{profile?.username || 'Jogador Sem Nome'}</h1>
            <p className="text-sm text-text-secondary">{user.email}</p>
          </div>
        </div>

        {/* Formulário */}
        <div className="col-span-1 md:col-span-2 pl-0 md:pl-2">
          <h2 className="mb-4 text-lg font-bold text-text-primary flex items-center gap-2">
            <Gamepad2 className="text-brand-secondary" />
            Editar Dados
          </h2>
          <ProfileForm 
            initialUsername={profile?.username} 
            initialAvatar={profile?.avatar_url} 
          />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-text-primary flex items-center gap-2 border-l-4 border-brand-primary pl-3">
          <Trophy className="text-yellow-500" />
          Minhas Conquistas ({myAchievements?.length || 0})
        </h2>
        
        {myAchievements && myAchievements.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {myAchievements.map((item: any) => (
              <AchievementCard 
                key={item.achievements.id} 
                achievement={item.achievements} 
                unlockedAt={item.unlocked_at} 
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-background-tertiary p-8 text-center text-text-muted">
            Você ainda não desbloqueou nenhuma conquista. Vá jogar!
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-text-primary flex items-center gap-2 border-l-4 border-brand-secondary pl-3">
          <DiskIcon className="text-brand-secondary" />
          Gerenciar Saves na Nuvem
        </h2>

        <div className="overflow-hidden rounded-lg border border-background-tertiary bg-background-card shadow-lg">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-background-secondary text-text-primary border-b border-background-tertiary">
              <tr>
                <th className="px-6 py-3 font-medium">Jogo</th>
                <th className="px-6 py-3 font-medium hidden md:table-cell">Plataforma</th>
                <th className="px-6 py-3 font-medium">Último Save</th>
                <th className="px-6 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {mySaves && mySaves.length > 0 ? (
                mySaves.map((save: any) => (
                  <SaveRow key={save.id} save={save} />
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-text-muted">
                    Nenhum save encontrado na nuvem.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
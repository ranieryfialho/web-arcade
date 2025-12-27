import { Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { AchievementCard } from '@/components/features/AchievementCard';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Conquistas | Web Arcade',
  description: 'Sua sala de troféus digital.',
};

export default async function AchievementsPage() {
  const supabase = await createClient();

  // 1. Verifica usuário
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 2. Busca todas as conquistas do sistema
  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*')
    .order('target_value', { ascending: true });

  // 3. Busca as conquistas que o usuário já desbloqueou
  const { data: myUnlocks } = await supabase
    .from('user_achievements')
    .select('achievement_id, unlocked_at')
    .eq('user_id', user.id);

  // Mapa auxiliar para busca rápida (ID -> Data)
  const unlockMap = new Map(
    myUnlocks?.map((u) => [u.achievement_id, u.unlocked_at])
  );

  return (
    <div className="container mx-auto min-h-screen px-4 py-8">
      {/* Header */}
      <div className="mb-10 border-b border-background-tertiary pb-6">
        <h1 className="flex items-center gap-3 font-mono text-4xl font-bold text-text-primary">
          <Trophy className="text-brand-secondary" size={40} />
          Sala de Troféus
        </h1>
        <p className="mt-2 text-text-secondary">
          Acompanhe seu progresso e exiba suas medalhas de jogador retro.
        </p>
      </div>

      {/* Grid de Conquistas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {allAchievements?.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            unlockedAt={unlockMap.get(achievement.id)}
          />
        ))}
      </div>

      {/* Estado Vazio (Se não houver conquistas cadastradas no sistema) */}
      {(!allAchievements || allAchievements.length === 0) && (
        <div className="text-center text-text-muted py-10">
          O sistema de conquistas está sendo calibrado...
        </div>
      )}
    </div>
  );
}
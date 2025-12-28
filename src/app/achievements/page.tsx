import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Trophy, Lock, Star, Calendar } from 'lucide-react';
import { FeaturedButton } from '@/components/features/FeaturedButton';

// Tipagem frouxa para evitar problemas com ícones dinâmicos
const iconMap: any = {
  'trophy': Trophy,
  'timer': Trophy,
  'watch': Trophy,
  'gamepad': Trophy,
  'heart': Trophy,
  'star': Star,
  'save': Trophy,
  'map': Trophy,
  'book': Trophy,
  'zap': Trophy,
  'battery': Trophy,
  'smartphone': Trophy,
  'disc': Trophy,
  'award': Trophy,
  'crown': Trophy,
  'battery-charging': Trophy,
  'shield': Trophy,
  'flag': Trophy,
  'repeat': Trophy,
  'compass': Trophy,
  'landmark': Trophy,
  'library': Trophy,
  'cpu': Trophy,
  'flame': Trophy,
  'rocket': Trophy,
  'swords': Trophy,
  'sun': Trophy,
  'box': Trophy,
  'gem': Trophy,
  'tv': Trophy,
  'skull': Trophy,
  'default': Trophy
};

export default async function AchievementsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Forçamos 'as any' na origem dos dados
  const { data: allAchievements } = await (supabase
    .from('achievements') as any)
    .select('*')
    .order('threshold', { ascending: true });

  const { data: userUnlocks } = await (supabase
    .from('user_achievements') as any)
    .select('achievement_id, unlocked_at, is_featured')
    .eq('user_id', user.id);

  // Criamos o Map
  const unlockedMap = new Map((userUnlocks as any)?.map((u: any) => [u.achievement_id, u]) || []);

  const totalCount = allAchievements?.length || 0;
  const unlockedCount = userUnlocks?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-background-primary px-4 py-8">
      <div className="container mx-auto max-w-5xl">
        
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary/20 text-brand-primary shadow-glow">
            <Trophy size={40} />
          </div>
          <h1 className="text-3xl font-bold text-text-primary">Sala de Troféus</h1>
          <p className="mt-2 text-text-secondary">Sua jornada lendária através dos jogos retro. </p>
          
          <div className="mt-6 w-full max-w-md">
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-text-primary">Progresso Total</span>
              <span className="text-brand-primary">{unlockedCount} / {totalCount}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-background-tertiary">
              <div 
                className="h-full bg-brand-primary transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <p className="mt-4 text-xs text-text-muted flex items-center gap-2">
            <Star size={14} className="text-yellow-500" />
            Clique na estrela para destacar até 3 conquistas no seu perfil
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allAchievements?.map((ach: any) => {
            // 👇 AQUI ESTAVA O PROBLEMA: Adicionamos 'as any' na recuperação do valor
            const unlock = unlockedMap.get(ach.id) as any;
            
            const isUnlocked = !!unlock;
            // Agora o TS sabe que 'unlock' é any e permite acessar .is_featured
            const isFeatured = unlock?.is_featured || false;
            
            const Icon = iconMap[ach.icon] || Trophy;

            return (
              <div
                key={ach.id}
                className={`group relative overflow-hidden rounded-xl border p-5 transition-all duration-300
                  ${isUnlocked 
                    ? 'border-brand-primary/30 bg-background-card hover:border-brand-primary hover:shadow-glow hover:-translate-y-1' 
                    : 'border-background-tertiary bg-background-secondary/50 opacity-60 grayscale'
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 transition-all
                    ${isUnlocked 
                      ? 'border-brand-primary bg-brand-primary/20 text-brand-primary group-hover:scale-110' 
                      :  'border-background-tertiary bg-background-tertiary text-text-muted'
                    }`}>
                    {isUnlocked ?  <Icon size={28} /> : <Lock size={24} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-bold text-base leading-tight ${isUnlocked ? 'text-text-primary' : 'text-text-muted'}`}>
                        {ach.title}
                      </h3>
                      {isUnlocked && (
                        <FeaturedButton 
                          achievementId={ach.id} 
                          initialIsFeatured={isFeatured} 
                        />
                      )}
                    </div>
                    
                    <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                      {ach.description}
                    </p>

                    {isUnlocked && unlock && (
                      <p className="mt-2 text-xs text-text-muted flex items-center gap-1">
                        <Calendar size={12} className="text-brand-primary" />
                        {new Date(unlock.unlocked_at).toLocaleDateString('pt-BR')}
                      </p>
                    )}

                    {!isUnlocked && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-text-muted">
                        <Lock size={12} />
                        <span>Bloqueado</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
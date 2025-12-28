import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Trophy, Lock, CheckCircle2, Crown, Timer, Gamepad2, Heart, Save, Map, Book, Zap, Battery, Smartphone, Disc, Award, Star } from 'lucide-react';

const iconMap: any = {
  'trophy': Trophy,
  'timer': Timer,
  'watch': Timer,
  'gamepad': Gamepad2,
  'heart': Heart,
  'star': Star,
  'save': Save,
  'map': Map,
  'book': Book,
  'zap': Zap,
  'battery': Battery,
  'smartphone': Smartphone,
  'disc': Disc,
  'award': Award,
  'crown': Crown,
  'battery-charging': Battery,
  'shield': CheckCircle2,
  'flag': CheckCircle2,
  'repeat': CheckCircle2,
  'default': Trophy
};

export default async function AchievementsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*')
    .order('threshold', { ascending: true });

  const { data: userUnlocks } = await supabase
    .from('user_achievements')
    .select('achievement_id, unlocked_at')
    .eq('user_id', user.id);

  const unlockedSet = new Set(userUnlocks?.map(u => u.achievement_id));

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
          <p className="mt-2 text-text-secondary">Sua jornada lendária através dos jogos retro.</p>
          
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
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allAchievements?.map((ach) => {
            const isUnlocked = unlockedSet.has(ach.id);
            const IconComponent = iconMap[ach.icon_slug] || iconMap['default'];

            return (
              <div 
                key={ach.id} 
                className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300
                  ${isUnlocked 
                    ? 'border-brand-primary/50 bg-brand-primary/5 shadow-glow-sm' 
                    : 'border-background-tertiary bg-background-card opacity-60 grayscale hover:opacity-100 hover:grayscale-0'
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg 
                    ${isUnlocked ? 'bg-brand-primary text-white' : 'bg-background-tertiary text-text-muted'}`}>
                    {isUnlocked ? <IconComponent size={24} /> : <Lock size={24} />}
                  </div>

                  <div>
                    <h3 className={`font-bold ${isUnlocked ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {ach.title}
                    </h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      {ach.description}
                    </p>
                    
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary bg-brand-secondary/10 px-2 py-1 rounded">
                        +{ach.xp_reward} XP
                      </span>
                      {isUnlocked && (
                        <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                          <CheckCircle2 size={10} /> Desbloqueado
                        </span>
                      )}
                    </div>
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
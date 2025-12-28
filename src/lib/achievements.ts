'use server'

import { createClient } from '@/lib/supabase/server';

export async function checkAndUnlockAchievements() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const totalMinutes = profile?.total_playtime_seconds ? Math.floor(profile.total_playtime_seconds / 60) : 0;

  const { count: gamesPlayedCount } = await supabase.from('game_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user.id); // Jogos únicos requer query distinta, mas contagem geral serve para exemplo
  
  const { count: favoritesCount } = await supabase.from('user_favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
  
  const { count: savesCount } = await supabase.from('user_saves').select('*', { count: 'exact', head: true }).eq('user_id', user.id);

  const { data: allAchievements } = await supabase.from('achievements').select('*');
  const { data: myUnlocks } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id);
  
  const unlockedIds = new Set(myUnlocks?.map(u => u.achievement_id));
  const newUnlocks: string[] = [];

  if (!allAchievements) return;

  for (const ach of allAchievements) {
    if (unlockedIds.has(ach.id)) continue;

    let passed = false;

    switch (ach.metric_type) {
      case 'TOTAL_TIME':
        if (totalMinutes >= ach.threshold) passed = true;
        break;
      case 'GAMES_PLAYED':
        if ((gamesPlayedCount || 0) >= ach.threshold) passed = true;
        break;
      case 'FAVORITES':
        if ((favoritesCount || 0) >= ach.threshold) passed = true;
        break;
      case 'SAVES_MADE':
        if ((savesCount || 0) >= ach.threshold) passed = true;
        break;
    }

    if (passed) {
      await supabase.from('user_achievements').insert({
        user_id: user.id,
        achievement_id: ach.id
      });
      newUnlocks.push(ach.title);
    }
  }

  return newUnlocks;
}
'use server'

import { createClient } from '@/lib/supabase/server';

export async function checkAndUnlockAchievements() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('total_playtime_seconds')
    .eq('id', user.id)
    .single();

  const totalMinutes = profile?.total_playtime_seconds 
    ? Math.floor(profile.total_playtime_seconds / 60) 
    : 0;

  const { data: uniqueGames } = await (supabase.from('game_sessions') as any)
    .select('game_id')
    .eq('user_id', user.id);

  const uniqueGameIds = new Set(uniqueGames?.map((s: any) => s.game_id) || []);
  const gamesPlayedCount = uniqueGameIds.size;

  const { count: favoritesCount } = await (supabase.from('user_favorites') as any)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: savesCount } = await (supabase.from('user_saves') as any)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { data: sessionsByPlatform } = await (supabase.from('game_sessions') as any)
    .select('game_id, console_type')
    .eq('user_id', user.id);

  const uniqueGamesBySnes = new Set(
    sessionsByPlatform?.filter((s: any) => s.console_type === 'SNES').map((s: any) => s.game_id) || []
  );
  const uniqueGamesByGba = new Set(
    sessionsByPlatform?.filter((s: any) => s.console_type === 'GBA').map((s: any) => s.game_id) || []
  );
  const uniqueGamesByMegaDrive = new Set(
    sessionsByPlatform?.filter((s: any) => s.console_type === 'MEGA_DRIVE').map((s: any) => s.game_id) || []
  );

  const { data: allAchievements } = await (supabase.from('achievements') as any)
    .select('*');

  const { data: myUnlocks } = await (supabase.from('user_achievements') as any)
    .select('achievement_id')
    .eq('user_id', user.id);

  const unlockedIds = new Set(myUnlocks?.map((u: any) => u.achievement_id) || []);
  const newUnlocks: string[] = [];

  if (!allAchievements) return [];

  for (const ach of allAchievements as any[]) {
    if (unlockedIds.has(ach.id)) continue;

    let passed = false;

    switch (ach.metric_type) {
      case 'TOTAL_TIME':
        if (totalMinutes >= ach.threshold) passed = true;
        break;

      case 'GAMES_PLAYED':
        if (gamesPlayedCount >= ach.threshold) passed = true;
        break;

      case 'FAVORITES':
        if ((favoritesCount || 0) >= ach.threshold) passed = true;
        break;

      case 'SAVES_MADE':
        if ((savesCount || 0) >= ach.threshold) passed = true;
        break;

      case 'PLATFORM_SNES':
        if (uniqueGamesBySnes.size >= ach.threshold) passed = true;
        break;

      case 'PLATFORM_GBA':
        if (uniqueGamesByGba.size >= ach.threshold) passed = true;
        break;

      case 'PLATFORM_MEGA_DRIVE':
        if (uniqueGamesByMegaDrive.size >= ach.threshold) passed = true;
        break;

      default:
        console.warn(`⚠️ Tipo de conquista desconhecido: ${ach.metric_type}`);
    }

    if (passed) {
      console.log(`🏆 Desbloqueando: ${ach.title}`);
      
      const { error } = await (supabase.from('user_achievements') as any)
        .insert({
          user_id: user.id,
          achievement_id: ach.id
        });

      if (!error) {
        newUnlocks.push(ach.title);
      } else {
        console.error(`❌ Erro ao desbloquear ${ach.title}:`, error);
      }
    }
  }

  return newUnlocks;
}
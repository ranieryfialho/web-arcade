'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { checkAndUnlockAchievements } from '@/lib/achievements'; 

export async function toggleFavorite(gameId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from('user_favorites')
    .select('*')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single();

  if (existing) {
    await supabase.from('user_favorites').delete().eq('id', existing.id);
  } else {
    await supabase.from('user_favorites').insert({ user_id: user.id, game_id: gameId });
  }

  await checkAndUnlockAchievements();

  revalidatePath('/shelf');
  revalidatePath('/favorites');
}
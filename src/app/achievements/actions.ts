'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleFeaturedAchievement(achievementId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Não autorizado" };

  const { data: current } = await supabase
    .from('user_achievements')
    .select('is_featured')
    .eq('user_id', user.id)
    .eq('achievement_id', achievementId)
    .single();

  if (!current) return { error: "Conquista não encontrada" };

  const newValue = !current.is_featured;

  if (newValue === true) {
    const { count } = await supabase
      .from('user_achievements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_featured', true);

    if ((count || 0) >= 3) {
      return { error: "Limite de 3 destaques atingido! Remova um antes de adicionar outro." };
    }
  }

  const { error } = await supabase
    .from('user_achievements')
    .update({ is_featured: newValue })
    .eq('user_id', user.id)
    .eq('achievement_id', achievementId);

  if (error) return { error: "Erro ao atualizar" };

  revalidatePath('/profile');
  revalidatePath('/achievements');
  return { success: true, isFeatured: newValue };
}
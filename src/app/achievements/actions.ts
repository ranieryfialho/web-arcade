'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleFeaturedAchievement(achievementId:  string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase. auth.getUser();

  if (!user) {
    console.error('❌ Usuário não autenticado');
    return { error: "Não autorizado" };
  }

  console.log(`🔄 Toggle featured para achievement: ${achievementId}`);

  // Buscar estado atual
  const { data: current, error:  fetchError } = await supabase
    .from('user_achievements')
    .select('is_featured')
    .eq('user_id', user.id)
    .eq('achievement_id', achievementId)
    .single();

  if (fetchError) {
    console.error('❌ Erro ao buscar conquista:', fetchError);
    return { error: "Conquista não encontrada" };
  }

  if (!current) {
    console.error('❌ Conquista não existe para este usuário');
    return { error: "Conquista não encontrada" };
  }

  const newValue = !current.is_featured;

  console.log(`📊 Estado atual: ${current.is_featured} → Novo: ${newValue}`);

  // Se está tentando ADICIONAR aos destaques
  if (newValue === true) {
    const { count, error:  countError } = await supabase
      .from('user_achievements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_featured', true);

    if (countError) {
      console.error('❌ Erro ao contar destaques:', countError);
    }

    console.log(`⭐ Conquistas em destaque atualmente: ${count || 0}`);

    if ((count || 0) >= 3) {
      console.warn('⚠️ Limite de 3 destaques atingido');
      return { error: "Limite de 3 destaques atingido!  Remova um antes de adicionar outro." };
    }
  }

  // Atualizar
  const { error: updateError } = await supabase
    . from('user_achievements')
    .update({ is_featured:  newValue })
    .eq('user_id', user.id)
    .eq('achievement_id', achievementId);

  if (updateError) {
    console.error('❌ Erro ao atualizar:', updateError);
    return { error: "Erro ao atualizar" };
  }

  console. log(`✅ Conquista atualizada: is_featured = ${newValue}`);

  // Revalidar páginas
  revalidatePath('/profile');
  revalidatePath('/achievements');
  
  return { success: true, isFeatured: newValue };
}
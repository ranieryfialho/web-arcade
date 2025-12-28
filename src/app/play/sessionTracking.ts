'use server'

import { createClient } from '@/lib/supabase/server';
import { checkAndUnlockAchievements } from '@/lib/achievements';

export async function trackGameSession(gameId: string, consoleType: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log('❌ Usuário não autenticado - sessão não rastreada');
    return [];
  }

  console.log(`🎮 Rastreando sessão: ${gameId} (${consoleType})`);

  const { error } = await (supabase.from('game_sessions') as any)
    .insert({
      user_id: user.id,
      game_id: gameId,
      console_type: consoleType,
    });

  if (error) {
    console.error('❌ Erro ao criar sessão:', error);
    return [];
  }

  const newUnlocks = await checkAndUnlockAchievements();
  
  console.log(`✅ Sessão criada. Conquistas desbloqueadas: ${newUnlocks.length}`);
  
  return newUnlocks;
}
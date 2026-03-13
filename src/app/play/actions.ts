'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkAndUnlockAchievements } from '@/lib/achievements'

// ✅ NOVA FUNÇÃO: substitui uploadSaveState
// O upload do arquivo agora é feito client-side (no GameEmulator.tsx)
// diretamente para o Supabase Storage, evitando o limite de payload da Vercel (~4.5MB)
// que causava erro 403 especificamente nos saves do SNES (arquivos maiores).
// Esta Server Action recebe apenas o path do arquivo já enviado e registra no banco.
export async function registerSave(gameId: string, filePath: string) {
  const supabase = await createClient()

  const { data: { session }, error: authError } = await supabase.auth.getSession()

  if (authError || !session) {
    console.error("❌ [registerSave] Falha de sessão:", authError?.message || "Sem sessão");
    return { error: 'Sessão expirada. Faça login novamente.' }
  }

  const user = session.user

  if (!gameId || !filePath) {
    return { error: 'Dados inválidos recebidos' }
  }

  const { data: existingSave } = await (supabase.from('user_saves') as any)
    .select('id')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  let dbError;

  if (existingSave) {
    const { error } = await (supabase.from('user_saves') as any)
      .update({
        save_file_url: filePath,
        last_played_at: new Date().toISOString()
      })
      .eq('id', existingSave.id)
    dbError = error
  } else {
    const { error } = await (supabase.from('user_saves') as any)
      .insert({
        user_id: user.id,
        game_id: gameId,
        save_file_url: filePath,
        last_played_at: new Date().toISOString()
      })
    dbError = error
  }

  if (dbError) {
    console.error('❌ [registerSave] Erro Banco:', dbError.message)
    return { error: 'Erro ao registrar no banco' }
  }

  const newUnlocks = await checkAndUnlockAchievements();

  revalidatePath('/shelf')
  return { success: true, newUnlocks: newUnlocks || [] }
}

export async function getLatestSave(gameId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return null

  const { data: saveRecord } = await (supabase.from('user_saves') as any)
    .select('save_file_url')
    .eq('user_id', session.user.id)
    .eq('game_id', gameId)
    .single()

  if (!saveRecord) return null

  const { data: signedUrl } = await supabase
    .storage
    .from('user-saves')
    .createSignedUrl(saveRecord.save_file_url, 3600)

  return signedUrl?.signedUrl
}

export async function incrementPlaytime(seconds: number) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return null
  const user = session.user

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('total_playtime_seconds')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  const newTotal = (profile.total_playtime_seconds || 0) + seconds

  await (supabase.from('profiles') as any)
    .update({ total_playtime_seconds: newTotal })
    .eq('id', user.id)

  const newUnlocks = await checkAndUnlockAchievements();
  
  if (newUnlocks && newUnlocks.length > 0) {
    return { title: newUnlocks[0] }
  }

  return null
}

export async function toggleFavorite(gameId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return [] 

  const { data: existing } = await (supabase.from('user_favorites') as any)
    .select('id')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  if (existing) {
    await (supabase.from('user_favorites') as any).delete().eq('id', existing.id)
  } else {
    await (supabase.from('user_favorites') as any).insert({ user_id: user.id, game_id: gameId })
  }

  const newUnlocks = await checkAndUnlockAchievements()

  revalidatePath('/shelf')
  revalidatePath('/favorites')
  revalidatePath('/profile')
  revalidatePath(`/play/${gameId}`)

  return newUnlocks || []
}
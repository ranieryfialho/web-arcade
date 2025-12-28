'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkAndUnlockAchievements } from '@/lib/achievements'

export async function uploadSaveState(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { session }, error:  authError } = await supabase. auth.getSession()
  
  if (authError || !session) {
    console.error("❌ [Server Action] Falha de sessão:", authError?. message || "Sem sessão");
    return { error: 'Sessão expirada.  Faça login novamente.' }
  }

  const user = session.user;
  const file = formData.get('file') as File
  const gameId = formData.get('gameId') as string
  
  if (!file || !gameId) {
    return { error: 'Dados inválidos recebidos' }
  }

  const filePath = `${user.id}/${gameId}. state`

  const { error: uploadError } = await supabase
    .storage
    .from('user-saves')
    .upload(filePath, file, {
      upsert: true,
      contentType: 'application/octet-stream'
    })

  if (uploadError) {
    console.error('❌ [Server Action] Erro Storage:', uploadError.message)
    return { error: 'Erro ao salvar arquivo na nuvem' }
  }

  const { data: existingSave } = await supabase
    . from('user_saves')
    .select('id')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  let dbError;
  
  if (existingSave) {
    const { error } = await supabase
      . from('user_saves')
      .update({
        save_file_url: filePath,
        last_played_at: new Date().toISOString()
      })
      .eq('id', existingSave.id)
    dbError = error
  } else {
    const { error } = await supabase
      .from('user_saves')
      .insert({
        user_id: user.id,
        game_id: gameId,
        save_file_url:  filePath,
        last_played_at: new Date().toISOString()
      })
    dbError = error
  }

  if (dbError) {
    console.error('❌ [Server Action] Erro Banco:', dbError.message)
    return { error: 'Erro ao registrar no banco' }
  }

  const newUnlocks = await checkAndUnlockAchievements();

  revalidatePath('/shelf')
  return { success: true, newUnlocks:  newUnlocks || [] }
}

export async function getLatestSave(gameId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return null

  const { data: saveRecord } = await supabase
    .from('user_saves')
    .select('save_file_url')
    .eq('user_id', session.user.id)
    .eq('game_id', gameId)
    .single()

  if (!saveRecord) return null

  const { data: signedUrl } = await supabase
    .storage
    .from('user-saves')
    .createSignedUrl(saveRecord. save_file_url, 3600)

  return signedUrl?. signedUrl
}

export async function incrementPlaytime(seconds: number) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return null
  const user = session.user

  const { data:  profile } = await supabase
    .from('profiles')
    .select('total_playtime_seconds')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  const newTotal = (profile.total_playtime_seconds || 0) + seconds

  await supabase
    .from('profiles')
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
  
  const { data: { user } } = await supabase. auth.getUser()
  if (!user) return [] 

  const { data: existing } = await supabase
    .from('user_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  if (existing) {
    await supabase. from('user_favorites').delete().eq('id', existing.id)
  } else {
    await supabase.from('user_favorites').insert({ user_id: user.id, game_id: gameId })
  }

  const newUnlocks = await checkAndUnlockAchievements()

  revalidatePath('/shelf')
  revalidatePath('/favorites')
  revalidatePath('/profile')
  revalidatePath(`/play/${gameId}`)

  return newUnlocks || []
}
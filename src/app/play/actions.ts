'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// --- FUNÇÃO 1: UPLOAD DE SAVE (SALVAR NA NUVEM) ---
export async function uploadSaveState(formData: FormData) {
  const supabase = await createClient()
  
  // Usamos getSession para performance e evitar bugs de validação em server actions
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  
  if (authError || !session) {
    console.error("❌ [Server Action] Falha de sessão:", authError?.message || "Sem sessão");
    return { error: 'Sessão expirada. Faça login novamente.' }
  }

  const user = session.user;
  const file = formData.get('file') as File
  const gameId = formData.get('gameId') as string
  
  if (!file || !gameId) {
    return { error: 'Dados inválidos recebidos' }
  }

  const filePath = `${user.id}/${gameId}.state`

  // 1. Upload para o Storage
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

  // 2. Atualizar ou Inserir no Banco de Dados
  // Primeiro verificamos se já existe um registro
  const { data: existingSave } = await supabase
    .from('user_saves')
    .select('id')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  let dbError;
  
  if (existingSave) {
    // Atualiza existente
    const { error } = await supabase
      .from('user_saves')
      .update({
        save_file_url: filePath,
        last_played_at: new Date().toISOString()
      })
      .eq('id', existingSave.id)
    dbError = error
  } else {
    // Cria novo
    const { error } = await supabase
      .from('user_saves')
      .insert({
        user_id: user.id,
        game_id: gameId,
        save_file_url: filePath,
        last_played_at: new Date().toISOString()
      })
    dbError = error
  }

  if (dbError) {
    console.error('❌ [Server Action] Erro Banco:', dbError.message)
    return { error: 'Erro ao registrar no banco' }
  }

  revalidatePath('/shelf')
  return { success: true }
}

// --- FUNÇÃO 2: DOWNLOAD DE SAVE (CARREGAR DA NUVEM) ---
export async function getLatestSave(gameId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return null

  // Busca o registro no banco
  const { data: saveRecord } = await supabase
    .from('user_saves')
    .select('save_file_url')
    .eq('user_id', session.user.id)
    .eq('game_id', gameId)
    .single()

  if (!saveRecord) return null

  // Gera uma URL assinada temporária (válida por 1 hora)
  const { data: signedUrl } = await supabase
    .storage
    .from('user-saves')
    .createSignedUrl(saveRecord.save_file_url, 3600)

  return signedUrl?.signedUrl
}

// --- FUNÇÃO 3: GAMIFICAÇÃO (HEARTBEAT & CONQUISTAS) ---
export async function incrementPlaytime(seconds: number) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return null
  const user = session.user

  // 1. Atualiza Stats (Contador de Tempo Total)
  const { data: stats } = await supabase
    .from('user_stats')
    .select('total_playtime_seconds')
    .eq('user_id', user.id)
    .single()

  if (!stats) return null

  const newTotal = (stats.total_playtime_seconds || 0) + seconds

  await supabase
    .from('user_stats')
    .update({ 
      total_playtime_seconds: newTotal,
      last_updated: new Date().toISOString()
    })
    .eq('user_id', user.id)

  // 2. Verifica Novos Desbloqueios (Lógica de Conquista)
  // Busca conquistas de tempo cujo alvo já foi atingido
  const { data: potentialUnlocks } = await supabase
    .from('achievements')
    .select('*')
    .eq('condition_type', 'total_playtime')
    .lte('target_value', newTotal)

  if (!potentialUnlocks || potentialUnlocks.length === 0) return null 

  // Filtra conquistas que o usuário JÁ possui
  const { data: existingUnlocks } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', user.id)
    .in('achievement_id', potentialUnlocks.map(a => a.id))

  const existingIds = new Set(existingUnlocks?.map(u => u.achievement_id))
  
  // Lista final apenas das conquistas inéditas
  const newUnlocks = potentialUnlocks.filter(a => !existingIds.has(a.id))

  if (newUnlocks.length > 0) {
    // 3. Insere as novas conquistas
    const inserts = newUnlocks.map(a => ({
      user_id: user.id,
      achievement_id: a.id,
      unlocked_at: new Date().toISOString()
    }))

    const { error } = await supabase.from('user_achievements').insert(inserts)

    if (error) {
      // Se der erro (ex: RLS bloqueando), loga e não retorna sucesso visual
      console.error("❌ Erro ao desbloquear conquista no banco:", error.message)
      return null 
    }

    // Atualiza o cache da página de conquistas para a próxima visita
    revalidatePath('/achievements')
    
    // Retorna a primeira conquista nova para exibir no Toast
    return newUnlocks[0] 
  }

  return null
}
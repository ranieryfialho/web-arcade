'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ==========================================
// 1. CRIAR NOVO JOGO
// ==========================================
export async function createGame(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== 'ranieryfialho@gmail.com') {
    return { error: 'Acesso negado. Apenas administradores.' }
  }

  const title = formData.get('title') as string
  const console_type = formData.get('console_type') as string
  const description = formData.get('description') as string

  // Agora recebe URLs prontas (upload feito no cliente)
  const cover_url = formData.get('cover_url') as string
  const rom_url = formData.get('rom_url') as string

  if (!title || !console_type || !cover_url || !rom_url) {
    return { error: 'Preencha todos os campos obrigatórios.' }
  }

  try {
    const { error: dbError } = await (supabase
      .from('games') as any)
      .insert({
        title,
        console_type,
        description,
        cover_url,
        rom_url,
      })

    if (dbError) throw new Error('Erro ao salvar no banco: ' + dbError.message)

  } catch (error: any) {
    console.error('Erro no createGame:', error)
    return { error: error.message }
  }

  revalidatePath('/shelf')
  revalidatePath('/admin')
  redirect('/admin')
}

// ==========================================
// 2. EXCLUIR JOGO
// ==========================================
export async function deleteGame(gameId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== 'ranieryfialho@gmail.com') {
    return { error: 'Acesso negado.' }
  }

  try {
    const { data: game } = await (supabase.from('games') as any)
      .select('*').eq('id', gameId).single()

    if (game) {
      const extractPath = (url: string) => {
        const parts = url.split('/games-assets/')
        return parts.length > 1 ? parts[1] : null
      }

      const coverPath = extractPath(game.cover_url)
      const romPath = extractPath(game.rom_url)

      if (coverPath) await supabase.storage.from('games-assets').remove([coverPath])
      if (romPath) await supabase.storage.from('games-assets').remove([romPath])
    }

    const { error } = await (supabase.from('games') as any)
      .delete().eq('id', gameId)

    if (error) throw error

  } catch (error: any) {
    console.error('Erro no deleteGame:', error)
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/shelf')
  return { success: true }
}

// ==========================================
// 3. ATUALIZAR JOGO
// ==========================================
export async function updateGame(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  console.log(`👤 Tentativa de Update por: ${user?.email}`)

  if (!user || user.email?.toLowerCase() !== 'ranieryfialho@gmail.com') {
    console.error('❌ Acesso negado: Email não corresponde ao admin.')
    return { error: 'Acesso negado.' }
  }

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const console_type = formData.get('console_type') as string
  const description = formData.get('description') as string

  // Recebe URLs prontas (upload feito no cliente)
  const cover_url = formData.get('cover_url') as string | null
  const rom_url = formData.get('rom_url') as string | null

  console.log(`🔄 Iniciando Update ID: ${id}`)
  console.log(`   Título: ${title}`)

  if (!id) {
    console.error('❌ Erro: ID do jogo não fornecido.')
    return { error: 'ID do jogo não fornecido.' }
  }

  try {
    const updateData: any = { title, console_type, description }

    if (cover_url) {
      updateData.cover_url = cover_url
      console.log('✅ Capa atualizada.')
    }

    if (rom_url) {
      updateData.rom_url = rom_url
      console.log('✅ ROM atualizada.')
    }

    console.log('📝 Executando update no banco...')

    const { error: dbError } = await (supabase.from('games') as any)
      .update(updateData).eq('id', id)

    if (dbError) {
      console.error('❌ Erro do Banco:', dbError.message)
      throw new Error('Erro banco: ' + dbError.message)
    }

    console.log('🎉 Jogo atualizado com sucesso!')

  } catch (error: any) {
    console.error('❌ ERRO FATAL no updateGame:', error)
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/shelf')
  redirect('/admin')
}
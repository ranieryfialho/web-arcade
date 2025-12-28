'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Usuário não autenticado' }

  const username = formData.get('username') as string
  const avatar_url = formData.get('avatar_url') as string

  const { error } = await (supabase.from('profiles') as any)
    .update({ 
      username, 
      avatar_url,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error('Erro ao atualizar perfil:', error)
    return { error: 'Erro ao salvar dados.' }
  }

  revalidatePath('/profile')
  return { success: true }
}

export async function deleteSave(saveId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Usuário não autenticado' }

  const { data: save } = await (supabase.from('user_saves') as any)
    .select('save_file_url')
    .eq('id', saveId)
    .eq('user_id', user.id)
    .single()

  if (save?.save_file_url) {
    await supabase.storage.from('user-saves').remove([save.save_file_url])
  }

  const { error } = await (supabase.from('user_saves') as any)
    .delete()
    .eq('id', saveId)
    .eq('user_id', user.id)

  if (error) return { error: 'Erro ao deletar save.' }

  revalidatePath('/profile')
  return { success: true }
}
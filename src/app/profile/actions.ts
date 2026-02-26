'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
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

export async function deleteAccount() {
  console.log('🚀 [deleteAccount] Função iniciada')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  console.log('👤 [deleteAccount] Usuário:', user?.id ?? 'NENHUM')

  if (!user) return { error: 'Usuário não autenticado' }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey)

  console.log('🗑️ [deleteAccount] Deletando game_sessions...')
  const { error: sessionsError } = await (supabaseAdmin.from('game_sessions') as any)
    .delete()
    .eq('user_id', user.id)
  if (sessionsError) {
    console.error('❌ [deleteAccount] Erro em game_sessions:', sessionsError)
    return { error: 'Erro ao limpar seus dados.' }
  }
  console.log('✅ [deleteAccount] game_sessions deletadas')

  console.log('🗑️ [deleteAccount] Deletando user_favorites...')
  const { error: favoritesError } = await (supabaseAdmin.from('user_favorites') as any)
    .delete()
    .eq('user_id', user.id)
  if (favoritesError) {
    console.error('❌ [deleteAccount] Erro em user_favorites:', favoritesError)
    return { error: 'Erro ao limpar seus dados.' }
  }
  console.log('✅ [deleteAccount] user_favorites deletados')

  console.log('🗑️ [deleteAccount] Deletando user_achievements...')
  const { error: achievementsError } = await (supabaseAdmin.from('user_achievements') as any)
    .delete()
    .eq('user_id', user.id)
  if (achievementsError) {
    console.error('❌ [deleteAccount] Erro em user_achievements:', achievementsError)
    return { error: 'Erro ao limpar seus dados.' }
  }
  console.log('✅ [deleteAccount] user_achievements deletadas')

  console.log('🗑️ [deleteAccount] Deletando user_saves...')
  const { error: savesError } = await (supabaseAdmin.from('user_saves') as any)
    .delete()
    .eq('user_id', user.id)
  if (savesError) {
    console.error('❌ [deleteAccount] Erro em user_saves:', savesError)
    return { error: 'Erro ao limpar seus dados.' }
  }
  console.log('✅ [deleteAccount] user_saves deletados')

  console.log('🗑️ [deleteAccount] Deletando user_stats...')
  const { error: statsError } = await (supabaseAdmin.from('user_stats') as any)
    .delete()
    .eq('user_id', user.id)
  if (statsError) {
    console.error('❌ [deleteAccount] Erro em user_stats:', statsError)
    return { error: 'Erro ao limpar seus dados.' }
  }
  console.log('✅ [deleteAccount] user_stats deletadas')

  console.log('🗑️ [deleteAccount] Deletando profiles...')
  const { error: profileError } = await (supabaseAdmin.from('profiles') as any)
    .delete()
    .eq('id', user.id)
  if (profileError) {
    console.error('❌ [deleteAccount] Erro em profiles:', profileError)
    return { error: 'Erro ao limpar seus dados.' }
  }
  console.log('✅ [deleteAccount] profiles deletado')

  console.log('🗑️ [deleteAccount] Deletando usuário de auth.users, ID:', user.id)
  const { error: adminError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
  if (adminError) {
    console.error('❌ [deleteAccount] Erro ao deletar auth.users:')
    console.error('   - message:', adminError.message)
    console.error('   - status:', adminError.status)
    console.error('   - objeto completo:', JSON.stringify(adminError, null, 2))
    return { error: 'Erro ao excluir credenciais de login.' }
  }
  console.log('✅ [deleteAccount] Usuário deletado de auth.users')

  // 8. Encerrar sessão
  await supabase.auth.signOut()

  console.log('🎉 [deleteAccount] Conta excluída com sucesso!')
  return { success: true }
}
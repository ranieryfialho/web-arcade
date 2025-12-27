'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFavorite(gameId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Faça login para favoritar.' }

  const { data: existing } = await supabase
    .from('user_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  if (existing) {
    await supabase.from('user_favorites').delete().eq('id', existing.id)
    revalidatePath('/favorites')
    revalidatePath(`/play/${gameId}`)
    return { isFavorite: false }
  } else {
    await supabase.from('user_favorites').insert({
      user_id: user.id,
      game_id: gameId
    })
    revalidatePath('/favorites')
    revalidatePath(`/play/${gameId}`)
    return { isFavorite: true }
  }
}
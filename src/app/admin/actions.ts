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
  const coverFile = formData.get('cover_file') as File
  const romFile = formData.get('rom_file') as File

  if (!title || !console_type || !coverFile || !romFile) {
    return { error: 'Preencha todos os campos obrigatórios.' }
  }

  try {
    const cleanCoverName = coverFile.name.replace(/\s+/g, '-').toLowerCase();
    const coverPath = `covers/${Date.now()}-${cleanCoverName}`
    
    const { error: coverError } = await supabase.storage
      .from('games-assets')
      .upload(coverPath, coverFile)

    if (coverError) throw new Error('Erro ao subir capa: ' + coverError.message)
    const { data: coverUrlData } = supabase.storage.from('games-assets').getPublicUrl(coverPath)

    const cleanRomName = romFile.name.replace(/\s+/g, '-').toLowerCase();
    const romPath = `roms/${Date.now()}-${cleanRomName}`
    
    const { error: romError } = await supabase.storage
      .from('games-assets')
      .upload(romPath, romFile)

    if (romError) throw new Error('Erro ao subir ROM: ' + romError.message)
    const { data: romUrlData } = supabase.storage.from('games-assets').getPublicUrl(romPath)

    const { error: dbError } = await supabase
      .from('games')
      .insert({
        title,
        console_type,
        description,
        cover_url: coverUrlData.publicUrl,
        rom_url: romUrlData.publicUrl
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
    const { data: game } = await supabase.from('games').select('*').eq('id', gameId).single();
    
    if (game) {
      const extractPath = (url: string) => {
        const parts = url.split('/games-assets/');
        return parts.length > 1 ? parts[1] : null;
      };

      const coverPath = extractPath(game.cover_url);
      const romPath = extractPath(game.rom_url);

      if (coverPath) await supabase.storage.from('games-assets').remove([coverPath]);
      if (romPath) await supabase.storage.from('games-assets').remove([romPath]);
    }

    const { error } = await supabase.from('games').delete().eq('id', gameId);
    if (error) throw error;

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

  console.log(`👤 Tentativa de Update por: ${user?.email}`);

  if (!user || user.email?.toLowerCase() !== 'ranieryfialho@gmail.com') {
    console.error('❌ Acesso negado: Email não corresponde ao admin.');
    return { error: 'Acesso negado.' }
  }

  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const console_type = formData.get('console_type') as string;
  const description = formData.get('description') as string;
  
  const coverFile = formData.get('cover_file') as File; 
  const romFile = formData.get('rom_file') as File;

  console.log(`🔄 Iniciando Update ID: ${id}`);
  console.log(`   Título: ${title}`);
  
  if (!id) {
    console.error('❌ Erro: ID do jogo não fornecido.');
    return { error: "ID do jogo não fornecido." };
  }

  try {
    const updateData: any = { title, console_type, description };

    if (coverFile && coverFile.size > 0) {
      console.log(`📸 Upload Capa: ${coverFile.name} (${coverFile.size} bytes)`);
      
      const cleanName = coverFile.name.replace(/\s+/g, '-').toLowerCase();
      const path = `covers/${Date.now()}-${cleanName}`;
      
      const { error: uploadError } = await supabase.storage.from('games-assets').upload(path, coverFile);
      if (uploadError) throw new Error("Erro upload capa: " + uploadError.message);
      
      const { data } = supabase.storage.from('games-assets').getPublicUrl(path);
      updateData.cover_url = data.publicUrl;
      console.log('✅ Capa atualizada.');
    }

    if (romFile && romFile.size > 0) {
      console.log(`💾 Upload ROM: ${romFile.name} (${romFile.size} bytes)`);
      
      const cleanName = romFile.name.replace(/\s+/g, '-').toLowerCase();
      const path = `roms/${Date.now()}-${cleanName}`;
      
      const { error: uploadError } = await supabase.storage.from('games-assets').upload(path, romFile);
      if (uploadError) throw new Error("Erro upload ROM: " + uploadError.message);

      const { data } = supabase.storage.from('games-assets').getPublicUrl(path);
      updateData.rom_url = data.publicUrl;
      console.log('✅ ROM atualizada.');
    }

    console.log('📝 Executando update no banco...');
    const { error: dbError } = await supabase.from('games').update(updateData).eq('id', id);
    
    if (dbError) {
      console.error('❌ Erro do Banco:', dbError.message);
      throw new Error("Erro banco: " + dbError.message);
    }
    
    console.log('🎉 Jogo atualizado com sucesso!');

  } catch (error: any) {
    console.error("❌ ERRO FATAL no updateGame:", error);
    return { error: error.message };
  }

  // 6. Revalidação e Redirecionamento
  revalidatePath('/admin');
  revalidatePath('/shelf');
  redirect('/admin');
}
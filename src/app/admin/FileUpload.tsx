'use client'

import { useState, ChangeEvent } from 'react'
import { Image as ImageIcon, FileCode, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface FileUploadProps {
  name: string
  label: string
  accept?: string
  required?: boolean
  iconType: 'image' | 'rom'
  // Callback chamado após upload bem-sucedido com a URL pública
  onUploadComplete?: (url: string) => void
}

export function FileUpload({
  name,
  label,
  accept,
  required,
  iconType,
  onUploadComplete,
}: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [publicUrl, setPublicUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setUploadError(null)
    setPublicUrl(null)

    if (iconType === 'image') {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }

    // Faz o upload direto do browser para o Supabase Storage
    setIsUploading(true)
    try {
      const supabase = createClient()

      const folder = iconType === 'image' ? 'covers' : 'roms'
      const cleanName = file.name.replace(/\s+/g, '-').toLowerCase()
      const path = `${folder}/${Date.now()}-${cleanName}`

      const { error: uploadError } = await supabase.storage
        .from('games-assets')
        .upload(path, file)

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      const { data } = supabase.storage
        .from('games-assets')
        .getPublicUrl(path)

      setPublicUrl(data.publicUrl)
      onUploadComplete?.(data.publicUrl)
    } catch (err: any) {
      console.error('Erro no upload:', err)
      setUploadError(err.message || 'Erro ao enviar arquivo.')
      setFileName(null)
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const Icon = iconType === 'image' ? ImageIcon : FileCode

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-text-secondary flex justify-between">
          {label}
          {!required && (
            <span className="text-xs text-text-muted lowercase font-normal">
              (Opcional)
            </span>
          )}
        </label>
      )}

      <label
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all text-center overflow-hidden group h-80
          ${isUploading
            ? 'border-brand-primary/50 bg-background-secondary/50 cursor-wait'
            : uploadError
            ? 'border-red-500/50 bg-red-950/10'
            : publicUrl
            ? 'border-brand-primary/50 bg-background-secondary/50'
            : 'border-background-tertiary bg-background-secondary/20 hover:border-brand-primary hover:bg-background-tertiary/40'
          }`}
      >
        {/* Preview de imagem */}
        {previewUrl && !isUploading && !uploadError && (
          <div className="relative h-full w-full p-2">
            <img
              src={previewUrl}
              alt="Preview"
              className="h-full w-full object-contain drop-shadow-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
              <div className="flex flex-col items-center text-white">
                <ImageIcon className="mb-2 h-8 w-8" />
                <span className="text-sm font-bold">Clique para trocar</span>
              </div>
            </div>
          </div>
        )}

        {/* Upload em progresso */}
        {isUploading && (
          <div className="flex flex-col items-center animate-in zoom-in-90 duration-200 p-6">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <span className="text-sm font-bold text-text-primary">
              Enviando para a nuvem...
            </span>
            <span className="mt-2 text-xs text-brand-primary">{fileName}</span>
          </div>
        )}

        {/* Erro no upload */}
        {uploadError && !isUploading && (
          <div className="flex flex-col items-center animate-in zoom-in-90 duration-200 p-6">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <AlertCircle className="h-8 w-8" />
            </div>
            <span className="text-sm font-bold text-red-400">Erro no envio</span>
            <span className="mt-2 text-xs text-red-500 px-4 text-center line-clamp-2">
              {uploadError}
            </span>
            <span className="mt-3 text-xs text-brand-primary">
              Clique para tentar novamente
            </span>
          </div>
        )}

        {/* Upload concluído (ROM sem preview) */}
        {publicUrl && !previewUrl && !isUploading && !uploadError && (
          <div className="flex flex-col items-center animate-in zoom-in-90 duration-200 p-6">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <span className="text-sm font-bold text-text-primary break-all line-clamp-2 px-4">
              {fileName}
            </span>
            <span className="mt-2 text-xs text-brand-primary">
              Arquivo enviado com sucesso!
            </span>
          </div>
        )}

        {/* Estado inicial (nenhum arquivo selecionado) */}
        {!fileName && !isUploading && !uploadError && (
          <div className="flex flex-col items-center p-6 text-text-muted group-hover:text-brand-primary transition-colors">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background-tertiary group-hover:bg-brand-primary/10 transition-colors">
              <Icon className="h-8 w-8" />
            </div>
            <span className="text-sm font-medium">
              {required ? 'Clique para selecionar' : 'Clique para alterar'}
            </span>
            <span className="mt-1 text-xs text-text-muted opacity-70">
              {iconType === 'image' ? 'JPG, PNG, WEBP' : '.SMC, .GBA, .ZIP, .MD'}
            </span>
          </div>
        )}

        {/* Input de arquivo — escondido */}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>

      {/* Input hidden que carrega a URL pública para o formulário */}
      <input type="hidden" name={name} value={publicUrl || ''} />

      {/* Validação visual para campos obrigatórios sem upload */}
      {required && !publicUrl && !isUploading && (
        <p className="text-xs text-text-muted">
          * Upload obrigatório
        </p>
      )}
    </div>
  )
}
'use client'

import { useState } from 'react'
import { User, Save as SaveIcon, Loader2 } from 'lucide-react'
import { updateProfile } from '@/app/profile/actions'

interface ProfileFormProps {
  initialUsername: string | null
  initialAvatar: string | null
}

export function ProfileForm({ initialUsername, initialAvatar }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage('')
    
    const result = await updateProfile(formData)
    
    if (result.error) {
      setMessage('❌ ' + result.error)
    } else {
      setMessage('✅ Perfil atualizado!')
    }
    
    setLoading(false)
    // Limpa mensagem após 3s
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">Seu Nickname</label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-5 w-5 text-text-muted" />
          <input 
            name="username"
            defaultValue={initialUsername || ''}
            placeholder="Como quer ser chamado?"
            className="w-full rounded-lg border border-background-tertiary bg-background-primary py-2 pl-10 pr-4 text-text-primary focus:border-brand-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">Avatar (URL da Imagem)</label>
        <input 
          name="avatar_url"
          defaultValue={initialAvatar || ''}
          placeholder="https://exemplo.com/minha-foto.jpg"
          className="w-full rounded-lg border border-background-tertiary bg-background-primary px-4 py-2 text-text-primary focus:border-brand-primary focus:outline-none text-xs font-mono"
        />
        <p className="text-[10px] text-text-muted">Cole o link de uma imagem da internet.</p>
      </div>

      <div className="flex items-center justify-between mt-2">
        <button 
          type="submit" 
          disabled={loading}
          className="flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:bg-brand-secondary disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SaveIcon size={16} />}
          Salvar Perfil
        </button>
        
        {message && (
          <span className={`text-sm font-medium animate-in fade-in ${message.includes('✅') ? 'text-accent-success' : 'text-accent-danger'}`}>
            {message}
          </span>
        )}
      </div>
    </form>
  )
}
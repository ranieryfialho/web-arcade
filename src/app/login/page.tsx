'use client'

import { useState } from 'react'
import { Gamepad2, Loader2, AlertCircle, X } from 'lucide-react'
import { login, signup } from './actions'
import { createClient } from '@/lib/supabase/client'

// Mapa de erros do Supabase para mensagens amigáveis em português
const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou senha incorretos. Verifique suas credenciais.',
  'Email not confirmed': 'Confirme seu e-mail antes de fazer login.',
  'User already registered': 'Este e-mail já está cadastrado. Tente fazer login.',
  'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
  'Unable to validate email address: invalid format': 'Formato de e-mail inválido.',
  'signup_disabled': 'Cadastro temporariamente desativado.',
}

function getErrorMessage(raw: string): string {
  return ERROR_MESSAGES[raw] ?? 'Ocorreu um erro inesperado. Tente novamente.'
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    const supabase = createClient()

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setErrorMessage(null) // Limpa erro anterior

    const formData = new FormData(event.currentTarget)

    const result = isLogin ? await login(formData) : await signup(formData)

    // Se retornou erro, exibe o feedback visual
    if (result?.error) {
      setErrorMessage(getErrorMessage(result.error))
      setIsLoading(false)
    }
    // Se não retornou nada (redirect aconteceu), não precisa fazer nada
  }

  const handleTabSwitch = (loginMode: boolean) => {
    setIsLogin(loginMode)
    setErrorMessage(null) // Limpa erro ao trocar de aba
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">

        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary text-white shadow-glow mb-4">
            <Gamepad2 size={28} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-text-primary font-mono">
            {isLogin ? 'Bem-vindo de volta' : 'Crie a sua Conta'}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {isLogin
              ? 'Insira as suas credenciais para continuar a sua jornada.'
              : 'Junte-se ao Web Arcade e comece a sua coleção.'}
          </p>
        </div>

        <div className="rounded-xl border border-background-tertiary bg-background-card p-8 shadow-lg backdrop-blur-sm">

          {/* Botão Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-md border border-background-tertiary bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-all mb-6"
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Entrar com Google
              </>
            )}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-background-tertiary" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background-card px-2 text-text-muted">ou</span>
            </div>
          </div>

          {/* Abas Login / Cadastro */}
          <div className="mb-6 flex rounded-lg border border-background-tertiary overflow-hidden">
            <button
              type="button"
              onClick={() => handleTabSwitch(true)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                isLogin
                  ? 'bg-brand-primary text-white'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch(false)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                !isLogin
                  ? 'bg-brand-primary text-white'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {/* Banner de erro — aparece apenas quando há erro */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span className="flex-1">{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-md border border-background-tertiary bg-background-secondary px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-md border border-background-tertiary bg-background-secondary px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-brand-primary px-4 py-2 text-sm font-bold text-white shadow-glow hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  {isLogin ? 'Entrando...' : 'Cadastrando...'}
                </>
              ) : (
                isLogin ? 'Entrar' : 'Criar Conta'
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
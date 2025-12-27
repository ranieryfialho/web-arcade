'use client'

import { useState } from 'react'
import { Gamepad2, Loader2 } from 'lucide-react'
import { login, signup } from './actions'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(event.currentTarget)
    
    if (isLogin) {
      await login(formData)
    } else {
      await signup(formData)
    }

    setIsLoading(false)
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        
        {/* Cabeçalho do Card */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary text-white shadow-glow mb-4">
            <Gamepad2 size={28} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-text-primary font-mono">
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua Conta'}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {isLogin 
              ? 'Insira suas credenciais para continuar sua jornada.' 
              : 'Junte-se ao Web Arcade e comece sua coleção.'}
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="rounded-xl border border-background-tertiary bg-background-card p-8 shadow-lg backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-2 block w-full rounded-md border border-background-tertiary bg-background-secondary px-3 py-2 text-text-primary placeholder-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="mt-2 block w-full rounded-md border border-background-tertiary bg-background-secondary px-3 py-2 text-text-primary placeholder-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-brand-primaryHover hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-background-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                isLogin ? 'Entrar' : 'Criar Conta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted">
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-medium text-brand-secondary hover:text-brand-secondaryHover transition-colors focus:outline-none"
              >
                {isLogin ? 'Cadastre-se' : 'Faça Login'}
              </button>
            </p>
          </div>
        </div>
        
      </div>
    </div>
  )
}
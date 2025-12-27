import Link from 'next/link';
import { Gamepad2, LogOut, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { signout } from '@/app/login/actions';

export default async function Navbar() {
  const supabase = await createClient();

  // 1. Busca usuário autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Busca dados do perfil (Avatar e Nick) se o usuário existir
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  // Define o nome de exibição (Nick > Email)
  const displayName = profile?.username || user?.email;
  // Define a inicial para o fallback do avatar
  const initial = displayName?.charAt(0).toUpperCase();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-background-tertiary bg-background-primary/80 backdrop-blur-md supports-[backdrop-filter]:bg-background-primary/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-primary text-white shadow-glow">
            <Gamepad2 size={20} />
          </div>
          <span className="font-sans text-xl font-bold tracking-tight text-text-primary">
            Web Arcade
          </span>
        </Link>

        {/* LINKS CENTRAIS */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            href="/shelf" 
            className="text-sm font-medium text-text-secondary hover:text-brand-primary transition-colors"
          >
            Biblioteca de Jogos
          </Link>
          <Link 
            href="/achievements" 
            className="text-sm font-medium text-text-secondary hover:text-brand-primary transition-colors"
          >
            Conquistas
          </Link>
        </div>

        {/* ÁREA DO USUÁRIO */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              
              {/* Link para o Perfil (Envolve Nome e Avatar) */}
              <Link 
                href="/profile"
                className="group flex items-center gap-3 rounded-full py-1 pl-3 pr-1 transition-colors hover:bg-background-tertiary/50"
                title="Ir para o Perfil"
              >
                <span className="hidden text-sm text-text-muted group-hover:text-text-primary sm:inline-block transition-colors">
                  {displayName}
                </span>
                
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-background-tertiary border border-brand-primary/50 flex items-center justify-center shadow-sm group-hover:border-brand-primary transition-colors">
                   {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt="Avatar" 
                        className="h-full w-full object-cover"
                      />
                   ) : (
                     <span className="text-xs font-bold text-brand-primary select-none">
                        {initial}
                     </span>
                   )}
                </div>
              </Link>

              {/* Botão de Logout */}
              <form action={signout}>
                <button 
                  type="submit"
                  className="flex items-center justify-center rounded-md p-2 text-text-muted transition-colors hover:bg-background-hover hover:text-accent-danger"
                  title="Sair da conta"
                >
                  <LogOut size={18} />
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-md bg-background-card border border-background-tertiary px-4 py-2 text-sm font-medium text-text-primary transition-all hover:bg-background-hover hover:border-brand-primary hover:text-brand-primary shadow-sm"
            >
              <User size={16} />
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
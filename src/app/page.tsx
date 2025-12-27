import Link from 'next/link';
import { Gamepad2, Cloud, Trophy, Zap, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    // Mantemos a trava de rolagem
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#030014] text-white selection:bg-purple-500/30">
      
      {/* Background Effects */}
      <div className="absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[120px]" />
      <div className="absolute -bottom-40 -right-20 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[100px]" />
      
      {/* Usei 'justify-evenly' aqui. 
         Ele espalha as seções (Hero e Cards) usando o espaço vazio disponível,
         sem precisar diminuir o tamanho dos seus botões ou cards.
      */}
      <div className="container relative z-10 mx-auto flex h-full flex-col items-center justify-evenly px-6 py-4">
        
        {/* --- HERO SECTION --- */}
        <section className="flex flex-col items-center text-center">
          
          <h1 className="max-w-5xl text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl animate-in zoom-in-95 duration-700 delay-100 leading-tight">
            Web <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">Arcade</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-gray-400 sm:text-xl animate-in slide-in-from-bottom-4 duration-700 delay-200">
            Sua coleção completa de clássicos, rodando instantaneamente no navegador com tecnologia de nuvem.
          </p>

          {/* BOTÕES GRANDES RESTAURADOS (px-8 py-4 text-lg) */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 animate-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link
              href="/shelf"
              className="group relative flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-105 hover:shadow-purple-500/40"
            >
              <Gamepad2 size={24} className="transition-transform group-hover:-rotate-12" />
              Começar Agora
            </Link>
            
            <Link
               href="/profile"
               className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-lg font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
               Meu Perfil
            </Link>
          </div>
        </section>

        {/* --- CARDS SECTION --- */}
        {/* CARDS GRANDES RESTAURADOS (p-8, gap-6, ícones grandes) */}
        <section className="grid w-full grid-cols-1 gap-6 md:grid-cols-3 animate-in slide-in-from-bottom-12 duration-1000 delay-500">
           
           <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all hover:-translate-y-2 hover:border-purple-500/30 hover:bg-white/10">
             <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
               <Cloud size={28} />
             </div>
             <h3 className="mb-3 text-2xl font-bold text-white">Cloud Saves</h3>
             <p className="text-gray-400 leading-relaxed">
               Seus jogos salvos automaticamente na nuvem segura.
             </p>
             <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl transition-all group-hover:bg-blue-500/30" />
           </div>

           <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all hover:-translate-y-2 hover:border-pink-500/30 hover:bg-white/10">
             <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-red-600 text-white shadow-lg">
               <Zap size={28} />
             </div>
             <h3 className="mb-3 text-2xl font-bold text-white">Zero Delay</h3>
             <p className="text-gray-400 leading-relaxed">
               Engine em WebAssembly. Sem instalações e sem complicação.
             </p>
             <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-pink-500/20 blur-2xl transition-all group-hover:bg-pink-500/30" />
           </div>

           <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all hover:-translate-y-2 hover:border-yellow-500/30 hover:bg-white/10">
             <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg">
               <Trophy size={28} />
             </div>
             <h3 className="mb-3 text-2xl font-bold text-white">Conquistas</h3>
             <p className="text-gray-400 leading-relaxed">
               Sistema de gamificação exclusivo. Desbloqueie troféus.
             </p>
             <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-yellow-500/20 blur-2xl transition-all group-hover:bg-yellow-500/30" />
           </div>
        </section>

      </div>
    </div>
  );
}
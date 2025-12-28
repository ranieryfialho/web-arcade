# 🕹️ Web Arcade

Plataforma de **Cloud Gaming Retrô** que permite jogar clássicos de SNES, GBA e Mega Drive diretamente no navegador, com sistema de salvamento na nuvem e conquistas (gamificação).

![Project Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Funcionalidades

- **🎮 Emulação Multi-Console:** Suporte para Super Nintendo (SNES), Game Boy Advance (GBA) e Mega Drive/Genesis via [EmulatorJS](https://emulatorjs.org/).
- **☁️ Cloud Saves:** Salve seu progresso e continue de onde parou em qualquer dispositivo. O save é sincronizado automaticamente com sua conta.
- **🏆 Sistema de Conquistas:** Desbloqueie troféus baseados em tempo de jogo, quantidade de jogos explorados e favoritos.
- **📱 Design Responsivo:** Interface otimizada para Desktop e Mobile.
- **🔐 Autenticação:** Sistema de login e cadastro seguro via Supabase Auth.
- **👤 Perfis de Usuário:** Personalização de avatar e visualização de estatísticas de jogo.
- **🛠️ Painel Admin:** Área restrita para upload de ROMs, capas e gerenciamento da biblioteca de jogos.

## 🚀 Tecnologias Utilizadas

- **Frontend:** [Next.js 15 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/) (Ícones)
- **Backend & Banco de Dados:** [Supabase](https://supabase.com/) (Auth, Postgres, Storage)
- **Emulação:** [EmulatorJS](https://github.com/ethanaobrien/emulatorjs) (via Iframe)

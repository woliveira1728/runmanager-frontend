# RunManager Web - Frontend

> **Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (ADS)**  
> **Universidade Luterana do Brasil (ULBRA)**  
> **Disciplina:** Projeto Tecnológico em Desenvolvimento de Sistemas  
> **Autor:** Wilson Dias de Oliveira  

---

## 📌 Visão Geral

O **RunManager Web** é a camada de interface da plataforma **RunManager**, projetada com foco em conformidade com as diretrizes de Interação Humano-Computador (IHC), alta usabilidade e responsividade para atletas, organizadores e administradores de corridas de rua.

A interface foi estruturada para suportar as necessidades operacionais na arena de prova, com destaque para a **validação ágil de presença e entrega de kits via leitura de QR Code em tempo real**, inscrições com seleção de lotes e acompanhamento de resultados oficiais.

---

## 🚀 Tecnologias e Ferramentas

- **Framework Web:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React Server Components)
- **Biblioteca de UI:** [React 19](https://react.dev/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Tema Claro / Escuro (OS-Based):** [next-themes](https://github.com/pacocoursey/next-themes) integrado com `@custom-variant dark` (suporte dual a classe `.dark` e `[data-theme="dark"]`)
- **Gerenciamento de Estado & Cache Assíncrono:** [TanStack Query v5](https://tanstack.com/query) (React Query com DevTools)
- **Tabelas & Rankings:** [TanStack Table v8](https://tanstack.com/table) (ordenação, paginação e filtragem headless)
- **Ícones & Design:** [Lucide React](https://lucide.dev/)
- **Cliente HTTP:** [Axios](https://axios-http.com/)
- **QR Code & Validação:** `qrcode.react` e suporte a leitura de credenciais

---

## ⚙️ Pré-requisitos

- **Node.js** >= 20.x (Recomendado v22+)
- **npm** >= 10.x
- Backend **RunManager API** em execução na porta 3001 (para integração de dados)

---

## 🛠️ Passo a Passo para Execução Local

### 1. Clonar o Repositório e Instalar Dependências
```bash
git clone git@github.com:woliveira1728/runmanager-frontend.git
cd runmanager-frontend
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

Conteúdo padrão do `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

A interface web estará disponível em: [http://localhost:3000](http://localhost:3000)

### 4. Compilar para Produção
```bash
npm run build
npm run start
```

---

## 🌓 Controle de Tema (Claro, Escuro e Sistema)

A interface conta com o componente `ThemeToggle` no cabeçalho com 3 modos de seleção:
- ☀️ **Claro**: Força o tema claro.
- 🌙 **Escuro**: Força o tema escuro.
- 💻 **Sistema (Padrão)**: Sincroniza em tempo real com as preferências do Sistema Operacional do usuário via `prefers-color-scheme`.

---

## 📁 Estrutura de Pastas

```text
runmanager-frontend/
├── public/                 # Recursos estáticos e imagens
├── src/
│   ├── app/                # Rotas e layouts do Next.js (App Router)
│   │   ├── favicon.ico
│   │   ├── globals.css     # Diretivas do Tailwind CSS v4 e variantes de tema
│   │   ├── layout.tsx      # Layout raiz com ThemeProvider, QueryProvider e fontes
│   │   └── page.tsx        # Página inicial com health check em tempo real
│   ├── components/         # Componentes reutilizáveis
│   │   └── theme-toggle.tsx # Controle segmentado de tema (Claro / Escuro / Sistema)
│   ├── lib/                # Configurações de API e utilitários
│   │   └── api.ts          # Cliente Axios tipado conectado ao RunManager Backend
│   └── providers/          # Provedores de contexto globais
│       ├── query-provider.tsx # Provider do TanStack Query com DevTools
│       └── theme-provider.tsx # Provider do next-themes com suporte dual
├── .env.example            # Modelo de variáveis de ambiente
├── eslint.config.mjs       # Configuração de padronização de código ESLint
├── next.config.ts          # Configurações do Next.js
├── package.json            # Dependências e scripts do projeto
└── tsconfig.json           # Configurações do TypeScript
```

# RunManager Web - Frontend

> **Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (ADS)**  
> **Universidade Luterana do Brasil (ULBRA)**  
> **Disciplina:** Projeto Tecnológico em Desenvolvimento de Sistemas  
> **Autor:** Wilson Dias de Oliveira  

---

## 📌 Visão Geral

O **RunManager Web** é a aplicação cliente da plataforma **RunManager**, desenvolvida em **Next.js 16 (App Router)** e **React 19** para oferecer interfaces responsivas destinadas a atletas, organizadores de corridas de rua e administradores do sistema.

### 🔗 Repositórios Relacionados
- **Frontend Web (este repositório):** `https://github.com/woliveira1728/runmanager-frontend`
- **Backend API (NestJS + Prisma):** `https://github.com/woliveira1728/runmanager-backend`

---

## 🔑 Credenciais de Teste para Avaliação

Utilize os usuários abaixo na tela de login (`/login`) para validar os fluxos de cada perfil de acesso (RBAC):

| Perfil (Role) | E-mail de Acesso | Senha | O que testar na Interface |
| :--- | :--- | :--- | :--- |
| **Atleta (`ATHLETE`)** | `atleta@runmanager.com` | `senha123` | Visualizar o bilhete de inscrição (#101) com QR Code vetorial, editar perfil esportivo/LGPD (UC03), inscrever-se em provas abertas (UC05) e consultar o tempo oficial homologado (UC07). |
| **Organizador (`ORGANIZER`)** | `organizador@runmanager.com` | `senha123` | Cadastrar e publicar eventos com múltiplas modalidades (UC04), confirmar/cancelar pagamentos na lista de inscritos (UC05), realizar check-in na arena via câmera/QR Code com alerta sonoro (UC06) e importar planilha CSV de tempos (UC07). |
| **Administrador (`ADMIN`)** | `admin@runmanager.com` | `senha123` | Acesso geral de governança sobre todos os eventos, credenciamentos e resultados. |

- **Código Hash QR Code de Teste para o Check-in na Arena (UC06):** `RM-DEMO2026MANAUS01`

---

## 🚀 Tecnologias Utilizadas

- **Framework Web:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Biblioteca de Interface:** [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Estilização e Temas:** [Tailwind CSS v4](https://tailwindcss.com/) e [next-themes](https://github.com/pacocoursey/next-themes) (modos Claro, Escuro e Sistema)
- **Estado Assíncrono e Cache:** [TanStack Query v5](https://tanstack.com/query)
- **Geração e Leitura de QR Code:** `qrcode.react` (renderização SVG do bilhete do atleta) e `html5-qrcode` (leitura ótica pela câmera ou imagem no console de check-in do organizador)
- **Feedback Sonoro na Arena:** **Web Audio API** nativa (sinais diferenciados de confirmação e bloqueio no check-in)
- **Cliente HTTP:** [Axios](https://axios-http.com/) com interceptadores JWT e renovação/expiração automática de sessão

---

## ⚙️ Configuração das Variáveis de Ambiente (`.env.example`)

Por segurança, os arquivos `.env` e `.env.local` estão listados no `.gitignore`. Copie o arquivo `.env.example` para `.env.local` e configure a variável abaixo:

| Variável | Descrição | Valor em Desenvolvimento | Valor em Produção (Vercel) |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | URL base da API REST do RunManager Backend | `http://localhost:3001/api` | URL pública do backend + `/api` |

---

## 🛠️ Passo a Passo para Execução Local

### 1. Clonar o Repositório e Instalar Dependências
```bash
git clone https://github.com/woliveira1728/runmanager-frontend.git
cd runmanager-frontend
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
cp .env.example .env.local
```

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse em: `http://localhost:3000`

### 4. Validar Linter e Build de Produção
```bash
npm run lint
npm run build
npm run start
```

---

## 📁 Estrutura de Pastas do Código-Fonte

```text
runmanager-frontend/
├── public/                                  # Ativos estáticos
├── src/
│   ├── app/                                 # Rotas do App Router (Next.js 16)
│   │   ├── dashboard/
│   │   │   └── page.tsx                     # Painel multiperfil (Atleta, Organizador e Admin - UC03 a UC07)
│   │   ├── login/
│   │   │   └── page.tsx                     # Autenticação JWT com RBAC (UC01)
│   │   ├── register/
│   │   │   └── page.tsx                     # Autocadastro Atleta/Organizador com validação de CPF e LGPD (UC02)
│   │   ├── globals.css                      # Configuração do Tailwind CSS v4
│   │   ├── layout.tsx                       # Layout raiz com AuthProvider, QueryProvider e ThemeProvider
│   │   └── page.tsx                         # Vitrine pública de corridas com inscrições abertas e Health Check
│   ├── components/
│   │   ├── event-registrations-modal.tsx    # Lista de inscritos, homologação de pagamento (UC05) e status de kit
│   │   ├── event-results-modal.tsx          # Importação CSV e digitação de tempos oficiais com Exceções 7A/7B (UC07)
│   │   ├── qr-scanner-modal.tsx             # Leitor de QR Code por câmera ou imagem via html5-qrcode (UC06)
│   │   ├── registration-modal.tsx           # Modal de inscrição do atleta com seleção de modalidade e lote (UC05)
│   │   └── theme-toggle.tsx                 # Seletor de tema Claro / Escuro / Sistema
│   ├── contexts/
│   │   └── auth-context.tsx                 # Contexto global de sessão JWT e sincronização de usuário
│   ├── lib/
│   │   └── api.ts                           # Cliente HTTP Axios, interceptadores e contratos TypeScript
│   └── providers/
│       ├── query-provider.tsx               # Configuração do TanStack Query v5
│       └── theme-provider.tsx               # Configuração do next-themes
├── .env.example                             # Modelo documentado de variáveis de ambiente
├── .gitignore                               # Exclusão de .env*, .next e node_modules
└── package.json                             # Dependências e scripts da aplicação
```

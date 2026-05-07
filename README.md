# Orbitune Music Platform

Plataforma musical ficticia inspirada em Melon e Spotify para roleplay no Instagram.

## Estrutura

- `apps/frontend`: React + Vite + Tailwind CSS.
- `apps/backend`: Node.js + Express + Supabase + node-cron.
- `supabase`: schema, RLS e seed do banco.

## Ordem real de setup

1. Criar projeto no Supabase.
2. Rodar os SQLs em `supabase/001_schema_rls.sql` e `supabase/002_seed.sql`.
3. Copiar variaveis `.env.example` para `.env`.
4. Rodar backend.
5. Rodar frontend.
6. Subir para GitHub.
7. Conectar Vercel ao frontend e Railway/Render ao backend.

## Comandos locais

```bash
npm install
npm run dev
```

## Backend entregue na Etapa 2

Rotas principais:

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/plays`
- `GET /api/plays/songs/:songId/stats`
- `GET /api/charts/hourly`
- `GET /api/charts/daily`
- `GET /api/charts/weekly`
- `POST /api/charts/:type/refresh`
- `GET /api/admin`
- `GET/POST/PATCH /api/admin/artists`
- `GET/POST/PATCH /api/admin/songs`
- `GET/PATCH /api/admin/settings`

Rotas admin aceitam `Authorization: Bearer <token>` de usuario com role `admin` ou o header:

```txt
x-admin-password: sua_senha
```

## Observacao

Login com GitHub no Supabase serve so para entrar na conta do Supabase. Ele nao cria um repositorio automaticamente. Para deploy, este projeto precisa virar um repo no GitHub.

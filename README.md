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

## Observacao

Login com GitHub no Supabase serve so para entrar na conta do Supabase. Ele nao cria um repositorio automaticamente. Para deploy, este projeto precisa virar um repo no GitHub.

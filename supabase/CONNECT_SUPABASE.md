# Como conectar o Supabase no Orbitune

## 1. Rodar o banco

No painel do Supabase:

1. Abra seu projeto.
2. Va em **SQL Editor**.
3. Clique em **New query**.
4. Copie e cole o conteudo inteiro de `001_schema_rls.sql`.
5. Clique em **Run**.
6. Depois crie outra query.
7. Copie e cole o conteudo inteiro de `002_seed.sql`.
8. Clique em **Run**.

Observacao: o arquivo `000_full_setup.sql` existe como referencia, mas o painel do Supabase geralmente nao executa `\i`. Por isso, no painel web, use os dois arquivos separados.

## 2. Pegar as keys do Supabase

No Supabase, procure:

```txt
Project Settings -> API Keys
```

ou:

```txt
Connect -> App Frameworks -> React / Vite
```

Voce precisa destes valores:

```txt
Project URL
Publishable key ou anon public key
Service role key
```

Importante:

- `Project URL`: pode ir no frontend e backend.
- `Publishable key` / `anon public key`: pode ir no frontend e backend.
- `Service role key`: so pode ficar no backend. Nunca coloque no Vercel frontend.

## 3. Criar os arquivos .env locais

Copie:

```txt
.env.example
```

para:

```txt
.env
```

Na raiz do projeto, preencha assim:

```env
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_ANON_KEY=SUA_PUBLISHABLE_OU_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY
ADMIN_PASSWORD=uma_senha_so_sua
PORT=4000
FRONTEND_URL=http://localhost:5173

VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_PUBLISHABLE_OU_ANON_KEY
VITE_API_URL=http://localhost:4000
```

Depois copie tambem:

```txt
apps/backend/.env.example
```

para:

```txt
apps/backend/.env
```

E preencha:

```env
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_ANON_KEY=SUA_PUBLISHABLE_OU_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY
ADMIN_PASSWORD=uma_senha_so_sua
PORT=4000
FRONTEND_URL=http://localhost:5173
```

Por fim copie:

```txt
apps/frontend/.env.example
```

para:

```txt
apps/frontend/.env
```

E preencha:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_PUBLISHABLE_OU_ANON_KEY
VITE_API_URL=http://localhost:4000
```

## 4. Reiniciar tudo

Depois de criar os `.env`, reinicie backend e frontend:

```bash
npm run dev
```

Se o backend estiver conectado, esta rota deve dizer `configured`:

```txt
http://localhost:4000/api/health
```

Resposta esperada:

```json
{
  "ok": true,
  "service": "orbitune-backend",
  "supabase": "configured"
}
```

## 5. Testar dados do banco

Depois do seed, estas rotas devem vir do Supabase:

```txt
http://localhost:4000/api/artists
http://localhost:4000/api/charts/hourly
```

Quando a resposta vier com:

```json
"source": "supabase"
```

esta tudo conectado.

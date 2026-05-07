# Supabase

Rode estes arquivos no SQL Editor do Supabase:

1. `001_schema_rls.sql`
2. `002_seed.sql`
3. `003_add_deluxe_release_type.sql` (opcional, para deluxe real)
4. `004_professional_play_and_chart_metrics.sql`

O schema cria tabelas, RLS, settings de inflacao e funcoes de chart.

O painel web do Supabase nao aceita includes como `\i outro_arquivo.sql`.
Por isso, rode os dois arquivos separados.

Para conectar o projeto ao Supabase depois de rodar o SQL, siga:

```txt
CONNECT_SUPABASE.md
```

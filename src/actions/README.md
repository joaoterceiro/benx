# src/actions

Server Actions (mutations) do domínio. Regras:

- `"use server"` no topo de cada arquivo.
- Validar entrada com zod antes de tocar o banco.
- Escrita via Drizzle; upload de mídia via `@/lib/storage` (guardar a chave, nunca URL crua).
- Invalidar o cache de listagens/busca no write com `cacheInvalidate` (`@/lib/cache`).
- Acesso a dados só aqui e em `@/db/queries`. O client nunca fala com o banco.

As actions de empreendimento entram na Fase 2.

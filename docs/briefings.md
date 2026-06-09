# Briefings dos Agentes — Benx Clone (stack self-hosted)

Cole o bloco correspondente como primeira mensagem na sessao Claude Code de cada worktree.
Todos leem o CLAUDE.md raiz antes de comecar.

---

## AGENTE 1 — Mapeamento (Fase 0, bloqueante)

Voce esta no worktree `benx-mapeamento`. Sua entrega libera Dados, DS, UI e Busca.

Tarefas:
1. Mapear todas as rotas/paginas do site Benx atual (sitemap completo).
2. Inventariar os Custom Post Types do JetEngine: imoveis, empreendimentos, relacoes, campos meta.
3. Documentar a logica dos plugins custom: property search (parametros, filtros) e construction progress widget.
4. Capturar tokens visuais (paleta, tipografia, espacamentos) do CSS computado.
5. Listar todos os assets (imagens, plantas, videos) com URLs de origem, para o Agente Dados migrar pro MinIO.

Entregue em `docs/inventario.md`, `docs/cpts.md`, `docs/design-tokens.md`, `docs/assets.md`. NAO escreva codigo de app.

---

## AGENTE 2 — Infra (Fase 0, paralelo com Mapeamento)

Voce esta no worktree `benx-infra`. Sobe a fundacao que Dados e UI vao usar.

Tarefas:
1. Validar e ajustar o `docker-compose.yml` (Postgres 16, Redis 7, MinIO). Garantir healthchecks e criacao automatica do bucket `benx-midia`.
2. Criar `.env.example` com o contrato de variaveis do CLAUDE.md.
3. Implementar `src/lib/storage.ts`: client S3 (AWS SDK v3 ou minio) apontando pro MinIO. Funcoes `uploadMidia`, `getUrl`, `deleteMidia`.
4. Implementar `src/lib/cache.ts`: client Redis (ioredis). Helpers `cacheGet`, `cacheSet` (com TTL), `cacheInvalidate` por prefixo.
5. Implementar `src/lib/db.ts`: conexao Drizzle com o Postgres (pool pg).
6. `drizzle.config.ts` apontando pro DATABASE_URL.
7. Documentar em `docs/infra.md`: como subir (`docker compose up -d`), portas, console do MinIO (9001), como rodar migrations.

Entrega o esqueleto de conexao. NAO modela tabelas (isso e do Agente Dados), mas deixa `src/lib/db.ts` pronto pra ele importar.

---

## AGENTE 3 — Dados (Fase 1)

Voce esta no worktree `benx-dados`. Fonte da verdade do dominio.

Depende de: `docs/cpts.md` (Mapeamento) e `src/lib/db.ts` + `src/lib/storage.ts` (Infra).

Tarefas:
1. Modelar o schema Drizzle em `src/db/schema.ts` a partir dos CPTs: empreendimentos, imoveis, midias, relacoes. Usar uuid como id.
2. Derivar tipos do dominio em `src/types/index.ts` via `InferSelectModel`. Contrato para UI e Busca.
3. Migrations com drizzle-kit (`src/db/migrate.ts`), versionadas em `drizzle/`.
4. Queries base em `src/db/queries.ts`: listar empreendimentos, por slug, imoveis por empreendimento, filtros. Cachear listagens com `cacheGet/cacheSet` do `src/lib/cache.ts`.
5. Server Actions em `src/actions/` para escrita, invalidando cache no write.
6. Script de migracao WP/JetEngine -> Postgres, subindo as midias pro MinIO via `uploadMidia`.
7. Seed de exemplo para destravar os outros agentes.

Prioridade: publicar `src/types/index.ts` cedo, mesmo provisorio, para destravar Fase 2.

---

## AGENTE 4 — Design System (Fase 1, paralelo com Dados)

Voce esta no worktree `benx-design`.

Depende de: `docs/design-tokens.md` (Mapeamento).

Tarefas:
1. Configurar Tailwind com os tokens do Benx (cores, fontes, escala).
2. Instalar/configurar shadcn/ui.
3. Primitivos em `src/components/ui/`: Button, Input, Select, Card, Badge.
4. Blocks em `src/components/blocks/`: Hero, CardImovel, CardEmpreendimento, GaleriaMidia, ProgressoObra, FiltroBar.
5. Fidelidade visual ao Benx, AA de acessibilidade.

Nao consome dados reais. Props tipadas de `@/types` (mock se preciso). Visualizar em rota `/_ds` ou Storybook.

---

## AGENTE 5 — UI/Paginas (Fase 2)

Voce esta no worktree `benx-ui`. Depende de DS + tipos do Agente Dados.

Tarefas:
1. Rotas em `src/app/` conforme `docs/inventario.md`: home, listagem de empreendimentos, `[slug]` de empreendimento, pagina de imovel, institucional, contato.
2. Consumir SOMENTE componentes de `@/components`.
3. Buscar dados via `src/db/queries.ts` em Server Components; mutacoes via `src/actions/`.
4. Imagens via URLs do MinIO (next/image com remotePatterns do S3_ENDPOINT).
5. SEO: metadata por rota, OG, sitemap. Responsividade completa.

Faltou componente? Pede ao Agente DS via PR. Nao cria componente base aqui.

---

## AGENTE 6 — Busca/Filtros (Fase 2, paralelo com UI)

Voce esta no worktree `benx-busca`. Replica a property search do Benx.

Depende de: tipos (Dados) + FiltroBar (DS) + cache (Infra).

Tarefas:
1. `src/features/search/`: estado dos filtros (bairro, tipo, dormitorios, faixa de preco, status de obra).
2. Query de busca com filtros combinados sobre o Postgres (server-side, paginada), cacheada no Redis por combinacao de filtros.
3. URL sincronizada com os filtros (searchParams) para links compartilhaveis.
4. Replicar a logica exata do plugin custom documentada em `docs/`.

Entrega feature isolada que a UI pluga na rota de listagem.

---

## AGENTE 7 — Integracao (Fase 3, continuo)

Trabalha na `main`. Sem worktree de feature.

Tarefas:
1. Revisar e mergear PRs, garantindo o contrato de tipos e as regras do CLAUDE.md.
2. Resolver conflitos de integracao.
3. CI: typecheck, lint, build, testes. Subir os servicos do compose no pipeline para testes de integracao.
4. Deploy: build Next + docker-compose em prod (Postgres+Redis+MinIO com volumes persistentes).
5. Smoke tests end-to-end nas rotas principais.

Criterio de merge: passa no typecheck, respeita CLAUDE.md, nao duplica tipos nem componentes, acesso a dados so no servidor.

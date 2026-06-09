# TASKS.md — Backlog por fase

Estado: `[ ]` a fazer, `[~]` em andamento, `[x]` feito, `[!]` bloqueado.
Validar (typecheck + build) ao fim de cada passo antes do próximo.

## Fase 0 — Consolidação (bloqueante)

- [x] Ler todos os artefatos da seção 4 do kickoff
- [x] `docs/ARCHITECTURE.md`: camadas, pastas, modelo de dados, fluxo, escopo por vertente
- [x] `docs/ERRORS.md`: inconsistências entre artefatos + resoluções propostas
- [x] `docs/TASKS.md`: este backlog
- [x] Aprovação do usuário das resoluções do ERRORS.md (slugs de vertente, planta vs imovel, src/)

## Fase 1 — Scaffolding e infraestrutura

Ordem do kickoff seção 5. Só iniciar após aprovar a Fase 0.

1. [x] Inicializar Next.js 15 (App Router, TS estrito, ESLint, Tailwind); tsconfig com paths (`@/*`)
2. [x] Tailwind + shadcn/ui + tokens Premium Web (cores, raios, sombras, easing) e SF Pro via `globals.css`
3. [x] Drizzle + Postgres: `src/lib/db.ts`, `src/db/schema.ts` (portado), `drizzle.config.ts`, 1ª migration rodada contra o compose
   - [x] Conferir contra cpts.md: todos os campos do empreendimento (57 colunas: O Projeto/créditos, áreas, certificações, pontos, obra detalhada, visibilidade)
4. [x] Infra Docker Compose no ar (Postgres, Redis, MinIO + bucket); `.env.example` + `.env` com o contrato
5. [x] Clientes de infra: `src/lib/cache.ts` (Redis) e `src/lib/storage.ts` (MinIO: upload, getUrl, deleteMidia, bucket idempotente)
6. [x] Config de ecossistema: `src/lib/ecossistema` (value, slug, label, cor, ordem) + helpers de escopo; seed de `linhas_produto`
7. [x] Esqueleto de camadas e pastas + tipos do domínio em `src/types/index.ts` (InferSelectModel) + `src/db/queries.ts` escopado
8. [x] Shell do admin: sidebar/layout portados para `(admin)/admin/layout.tsx` + rotas vazias (dashboard, empreendimentos, plantas, midias, leads) + portal público e rotas `(public)/[vertente]/[slug]`
9. [x] Healthcheck: `api/health` validando Postgres + Redis + MinIO (200 ok) + proxy `api/cep/[cep]` com cache

Critério de pronto (5.3): ATINGIDO. dev/build sobe, conecta nos 3 serviços (health 200),
migrations criam o schema completo (8 tabelas), shell navega entre rotas vazias,
ARCHITECTURE.md reflete o construído.

## Fases seguintes (visão, não executar agora)

- [x] Fase 2 — Domínio de empreendimentos: CRUD via Server Actions (criar/atualizar/excluir), cadastro de 7 abas portado, upload single MinIO, validação zod, resolve-or-create de cidade/bairro
- [x] Fase 2 — Busca e listagem (admin + público) escopadas por vertente, com cache Redis (filtros AND, paginação 12/página, isolamento por ecossistema validado)
- [x] Fase 3 — Plantas (N:N) com manager no cadastro, lista admin e render público
- [x] Fase 3 — Galerias de mídia (fachada/áreas/obra): upload múltiplo no MinIO, biblioteca admin, render público
- [x] Fase 3 — Leads: tabela + enum (migration 0001), captação pública, funil no admin com mudança de status
  - nota: admin forçado a `dynamic = "force-dynamic"` no layout (páginas data-driven não podem ser pré-renderizadas estáticas)
- [ ] Fase 4 — Site público: portal de vertentes + página de produto
- [x] Fase 5 — Autenticação e papéis no admin: login por credenciais (scrypt), sessões em banco + cookie httpOnly, middleware + guarda no layout, papéis admin/editor (exclusão só admin), mutations autenticadas, logout. Ver SECURITY.md
- [ ] Fase 6 — Deploy no Easypanel

## Refino do cadastro (fiel ao protótipo)

- [x] Cadastro portado 1:1 de `cadastro-empreendimento (1).jsx`: 7 abas, preview ao vivo do card, anel de progresso, save state (Não salvo/Salvo), tabs com badges/checks/erros, combobox de cidade/bairro (autocomplete + criar), sliders de obra, switches, uploads single/múltiplo com drag-and-drop e proporção, toast de sucesso. CSS `.bx-*` em `src/components/admin/cadastro.css`.
- [x] Integração real: uploads vão ao MinIO na seleção (guardam a chave); uma action `salvarEmpreendimento` persiste empreendimento + JSONB + plantas (substitui o conjunto) + galerias fachada/obra. Colunas novas `obra_documentacao` e `redirecionar_para` (migration 0003); `areas_comuns` virou JSONB de objeto (nome/descrição/imagem).
- nota: galerias/plantas usam estratégia replace-all no save; objetos removidos do MinIO podem ficar órfãos (limpeza de storage fica como melhoria futura).
- [x] Núcleo de persistência extraído para `src/lib/empreendimento-service.ts` (puro, sem cookies/cache); a Server Action virou casca fina (auth + invalidação). Permite teste de integração real.
- [x] Teste de integração `src/db/test-cadastro.ts` (`npx tsx`): 27/27 passaram contra Postgres+MinIO — criar (taxonomias resolve-or-create, JSONB, plantas, galerias, previsão mês→data, colunas novas), storage round-trip (URL assinada GET 200), editar com replace (plantas 2→1, fachada 2→0, obra 1→2) e cleanup.

## Documentação a manter

- [x] ARCHITECTURE.md  [x] ERRORS.md  [x] TASKS.md
- [ ] PRD.md  [ ] DESIGN_SYSTEM.md  [ ] API.md  [ ] SECURITY.md  [ ] GLOSSARY.md
- [~] CLAUDE.md (já existe; atualizar contrato de tipos após publicar `src/types/index.ts`, ver ERRORS.md item 2)

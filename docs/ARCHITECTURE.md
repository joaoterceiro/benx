# ARCHITECTURE.md — Benx Clone

Documento guia da arquitetura. Reflete a fundação a ser construída na Fase 1.
Português do Brasil, sem travessões no meio de frases.

## 1. Visão geral

Clone do site da incorporadora Benx (hoje WordPress + JetEngine + Elementor) para
stack moderna self-hosted. Dois lados sobre a mesma fundação:

- **Admin**: cadastro e gestão de empreendimentos, plantas, mídias e leads.
- **Público**: portal de vertentes, listagem com busca e página de cada empreendimento.

Stack: Next.js 15 (App Router) + TypeScript estrito, PostgreSQL + Drizzle, Redis (cache),
MinIO (mídia S3-compatible), Docker Compose em dev, Tailwind + shadcn/ui, fonte SF Pro,
estética Premium Web. Proibido Supabase ou qualquer BaaS.

## 2. Camadas

| Camada | Responsabilidade | Onde mora |
|---|---|---|
| Apresentação | RSC por padrão, client components só com interação. Grupos de rota `(public)` e `(admin)` | `src/app/` |
| Componentes | Design System (primitivos + blocks). Páginas não estilizam do zero | `src/components/` |
| Aplicação (escrita) | Server Actions, validação zod, invalidação de cache no write | `src/actions/` |
| Aplicação (leitura) | Queries tipadas, escopadas por vertente, com cache | `src/db/queries.ts` |
| Domínio (tipos) | Tipos derivados do schema via `InferSelectModel`, sem definição paralela | `src/types/` |
| Dados | Schema Drizzle (fonte única) + conexão Postgres | `src/db/schema.ts`, `src/lib/db.ts` |
| Cache | Redis (CEP, listagens, busca). Helpers get/set/invalidate | `src/lib/cache.ts` |
| Storage | MinIO. Guarda a chave, resolve URL na leitura | `src/lib/storage.ts` |
| Ecossistema | Config única das vertentes + helpers de escopo | `src/lib/ecossistema/` |

## 3. Estrutura de pastas (alvo)

Adotada a convenção `src/` (CLAUDE.md, briefings e scripts convergem nela; ver ERRORS.md item 1).

```
benx/
  src/
    app/
      (public)/
        page.tsx                 # portal: seletor de vertente
        [vertente]/
          page.tsx               # listagem escopada + busca
          [slug]/page.tsx        # página do empreendimento
      (admin)/
        admin/
          layout.tsx             # shell (sidebar) portado dos protótipos
          dashboard/page.tsx
          empreendimentos/
            page.tsx             # listagem
            novo/page.tsx        # cadastro (criar)
            [id]/page.tsx        # cadastro (editar)
          plantas/page.tsx
          midias/page.tsx
          leads/page.tsx
      api/
        cep/[cep]/route.ts       # proxy ViaCEP com cache Redis
        health/route.ts          # healthcheck Postgres+Redis+MinIO
      layout.tsx                 # root: fontes SF Pro, tokens
    components/
      ui/                        # primitivos shadcn (Button, Input, Select, Card, Badge)
      blocks/                    # Hero, CardEmpreendimento, GaleriaMidia, ProgressoObra, FiltroBar
    lib/
      db.ts                      # conexão Drizzle (pool pg)
      cache.ts                   # Redis (ioredis)
      storage.ts                 # client MinIO (S3 v3): uploadMidia, getUrl, deleteMidia
      ecossistema/index.ts       # config das vertentes + helpers de escopo
    db/
      schema.ts                  # Drizzle, fonte única (portado de db-schema.ts)
      queries.ts                 # leituras escopadas por vertente
      migrate.ts                 # runner de migrations
      seed.ts                    # seed de exemplo
    actions/                     # Server Actions (mutations)
    types/index.ts               # tipos do domínio (InferSelectModel)
  drizzle/                       # migrations geradas
  docs/
  docker-compose.yml
  drizzle.config.ts
  .env.example
```

## 4. Modelo de dados (resumo)

Fonte: `db-schema.ts` + `docs/cpts.md`. Id sempre `uuid`.

**Enums**
- `status_obra`: lancamento, em_construcao, pronto_para_morar, entregue (normalizado do WP).
- `tipo_habitacao`: his, hmp, his_e_hmp.
- `tipo_midia`: imagem, video, planta, fachada, area_comum, obra.

**Taxonomias (lookup, dimensões de filtro da busca)**
- `cidades` (nome, estado/UF, slug), `bairros`, `categorias`, `linhas_produto`.

**`empreendimentos` (entidade central)**
- Identificação: slug, nome, subtitulo, tipoHabitacao, statusObra.
- Localização: enderecoParcial/Completo, cep, enderecoVendas, standDeVendas, linkUber/Maps/Waze.
- Mídia destaque: imagemPrincipal, logotipo, urlVideoPrincipal, thumbnailVideo, urlTourVirtual, vistasDoAndar (chaves no MinIO ou URLs externas de vídeo).
- Obra multi-etapa: obraFundacao, obraAlvenaria, obraAcabamento, obraTotal (0-100), obraAtualizadaEm.
- Visibilidade (switchers): visivel, exibirObras, exibirPlantas, exibirLocalizacao, modoBreveLancamento.
- Repetíveis em JSONB: diferenciais, areasComuns, certificacoes, detalhesLocalizacao, tagsCard.
- FKs taxonomia: cidadeId, bairroId, categoriaId, linhaProdutoId.
- Timestamps: criadoEm, atualizadoEm.

**`plantas`** (unidade/tipologia): slug, nome, metragem, dormitorios, suites, vagas, imagemPlanta (chave MinIO), recursos (JSONB).

**`empreendimento_planta`**: junção N:N (PK composta, onDelete cascade). Unifica as relações JetEngine `empreendimentos<->plantas` e `vivabenx<->plantas_vivabenx`.

**`midias`**: empreendimentoId, chave (path no bucket benx-midia), alt, tipo, ordem. Nunca guarda URL crua.

Relations Drizzle definidas para joins tipados (cidade, bairro, categoria, linhaProduto, midias, plantas).

## 5. Regra de ecossistema (decisão de escopo)

Cada vertente é um mundo isolado. É o filtro de PRIMEIRO nível, aplicado antes de qualquer outro.

- Vertentes confirmadas: Benx Únicos (alto padrão, `#7A5C1E`), Benx (médio, `#0A4DCC`),
  VivaBenx (econômico HIS/HMP, `#2E9E54`). Há indício de uma 4ª, não confirmada.
- **Config única** em `src/lib/ecossistema`: slug, label, cor, ordem. Extensível sem refatoração
  ampla (acrescentar a 4ª = uma entrada). A tabela `linhas_produto` é semeada a partir desta config.
- Rotas públicas: `/{vertente}/{slug}` (ex.: `/vivabenx/viva-campinas`).
- Toda query de empreendimento recebe `where linhaProduto = <vertente ativa>` por padrão.
  A query sem vertente (admin "todas") é a exceção, não a regra.
- Taxonomias (cidades/bairros sugeridos) divergem por ecossistema: só aparecem as que têm
  empreendimento naquela linha.
- Cadastro: `linhaProduto` é obrigatório; rota pública e listagem derivam dele.

## 6. Fluxo de dados

**Leitura (público)**
1. Request em `/[vertente]/[slug]` (ou listagem).
2. RSC chama query em `src/db/queries.ts` com escopo de vertente.
3. Query tenta Redis (`cacheGet`); miss vai ao Postgres via Drizzle e popula o cache (`cacheSet` com TTL).
4. Chaves de mídia são resolvidas em URL pelo `storage.getUrl` na leitura.
5. Render respeitando os switchers de visibilidade.

**Escrita (admin)**
1. Form client component chama Server Action em `src/actions/`.
2. Action valida entrada com zod.
3. Upload de arquivos vai ao MinIO (`uploadMidia`), guardando a chave no banco.
4. Drizzle persiste; cache de listagens/busca é invalidado (`cacheInvalidate` por prefixo).

**CEP**: `api/cep/[cep]` faz proxy ViaCEP com cache Redis.

## 7. Infra (Docker Compose)

`docker-compose.yml` já fornecido: Postgres 16, Redis 7, MinIO + serviço `minio-init`
que cria o bucket `benx-midia` e libera download. Healthchecks nos três serviços.

Contrato de variáveis (`.env.example`):
```
DATABASE_URL=postgres://benx:benx@localhost:5432/benx
REDIS_URL=redis://localhost:6379
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=benx-midia
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_REGION=us-east-1
```

Console MinIO em :9001. Healthcheck da app em `api/health` valida conexão com os três.

## 8. Convenções inegociáveis

1. Tipos do domínio derivam do schema (InferSelectModel). Importar de `@/types`. Nada de tipo solto.
2. Schema Drizzle é fonte única. Migrations via drizzle-kit, versionadas em `drizzle/`.
3. Acesso a dados só no servidor (Server Actions e queries). Client nunca fala com o banco.
4. Mídia sempre via MinIO por chave. URL resolvida na leitura.
5. Redis para cache de listagens e busca. Invalidar no write.
6. Componentes consomem o Design System. Páginas não estilizam do zero.
7. Vertentes numa config só. Sem cravar a lista em vários arquivos.
8. Sem travessões no meio de frases, em texto e comentários.

## 9. Critério de pronto da fundação (Fase 1)

Projeto sobe em dev, conecta nos três serviços do compose, migrations criam o schema completo,
shell do admin navega entre rotas vazias, `api/health` passa, e este documento reflete o construído.
Nenhuma feature de domínio precisa funcionar ainda.

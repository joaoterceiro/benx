# Benx Clone — Contexto do Projeto

Clone do site Benx (atualmente WordPress/JetEngine/Elementor) para stack moderna self-hosted.
Trabalho conduzido por múltiplos agentes Claude Code em paralelo via git worktrees.

## Stack

- **Frontend/Backend**: Next.js 15 (App Router) + TypeScript (strict). Full-stack: Server Actions + Route Handlers. Sem API separada.
- **Estilo**: Tailwind CSS + shadcn/ui
- **Banco**: PostgreSQL (self-hosted, container)
- **ORM**: Drizzle ORM + drizzle-kit (migrations)
- **Cache/Sessão/Fila**: Redis (self-hosted, container)
- **Storage de mídia**: MinIO (S3-compatible, container) para fotos, plantas, vídeos
- **Orquestração**: Docker Compose (dev e prod)

Nada de Supabase. Acesso ao banco é Drizzle direto contra o Postgres do compose.

## Regras inegociáveis

1. **Contrato de tipos primeiro.** Domínio em `src/types/`, derivado do schema Drizzle (`InferSelectModel`). Ninguém cria tipo solto. Importar de `@/types`.
2. **Sem em dash** em texto/UI. Usar vírgula, dois pontos ou parênteses.
3. **Componentes consomem o Design System.** Páginas não estilizam do zero. Tudo de `@/components`.
4. **Schema Drizzle é a fonte única** (`src/db/schema.ts`). Migrations via drizzle-kit, versionadas.
5. **Acesso a dados só no servidor.** Server Actions em `src/actions/` e queries em `src/db/queries.ts`. Client nunca fala direto com o banco.
6. **Mídia sempre via MinIO.** Upload e leitura passam pelo client S3 em `src/lib/storage.ts`. Nada de path local.
7. **Redis para cache de listagens e busca.** Invalidar no write. Helper em `src/lib/cache.ts`.
8. **PRs pequenos**, revisados pelo Agente Integração.
9. **Não tocar no diretório de outro agente.** Divisão por domínio.

## Convenções

- Português (pt-BR) em conteúdo; inglês em código.
- Componentes PascalCase; hooks `useX`; Server Actions `verbX`.
- Imports absolutos via `@/`.
- Variáveis de ambiente em `.env` (nunca commitar). `.env.example` versionado.
- Acessibilidade AA mínima nos componentes base.

## Variáveis de ambiente (contrato)

```
DATABASE_URL=postgres://benx:benx@localhost:5432/benx
REDIS_URL=redis://localhost:6379
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=benx-midia
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_REGION=us-east-1
```

## Contrato de domínio (fonte para todos os agentes)

```ts
// src/types/index.ts — derivado do schema Drizzle pelo Agente Dados
export type Empreendimento = {
  id: string;
  slug: string;
  nome: string;
  status: "lancamento" | "obras" | "pronto";
  progressoObra: number; // 0-100
  bairro: string;
  cidade: string;
  descricao: string;
  galeria: Midia[];
  imoveis: Imovel[];
};

export type Imovel = {
  id: string;
  empreendimentoId: string;
  tipo: "apartamento" | "casa" | "comercial";
  area: number;
  dormitorios: number;
  vagas: number;
  precoBase: number | null;
  planta: Midia | null;
};

export type Midia = { id: string; url: string; alt: string; tipo: "imagem" | "video" | "planta" };
```

## Sequenciamento (não e tudo paralelo)

```
Fase 0  Agente Mapeamento (scraping + inventario)
        Agente Infra (sobe docker-compose: Postgres+Redis+MinIO)   <- paralelo com Mapeamento
Fase 1  Agente Dados (schema Drizzle + migrations + tipos)  ||  Agente Design System
Fase 2  Agente UI/Paginas  ||  Agente Busca/Filtros   (dependem de Fase 1)
Fase 3  Agente Integracao (merge + CI + deploy)
```

## Estrutura de pastas

```
src/
  app/              # rotas Next (Agente UI)
  actions/          # Server Actions (Agente Dados/UI)
  components/
    ui/             # primitivos shadcn (Agente DS)
    blocks/         # secoes compostas (Agente DS)
  db/
    schema.ts       # Drizzle, fonte da verdade (Agente Dados)
    queries.ts      # (Agente Dados)
    migrate.ts
  features/
    search/         # busca e filtros (Agente Busca)
  types/            # contratos (Agente Dados)
  lib/
    storage.ts      # client MinIO/S3 (Agente Infra/Dados)
    cache.ts        # helpers Redis (Agente Infra/Dados)
docker-compose.yml  # Postgres + Redis + MinIO (Agente Infra)
drizzle.config.ts
```

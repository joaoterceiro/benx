# ERRORS.md — Inconsistências entre artefatos e resoluções propostas

Registro das divergências encontradas na Fase 0 entre `kickoff-claude-code.md`,
`CLAUDE.md`, `db-schema.ts`, `docs/cpts.md`, `docs/busca-spec.md` e `docs/briefings.md`.
Cada item traz a resolução proposta. Aguardando OK antes de codar.

## 1. Estrutura de pastas: com ou sem `src/`

- **Conflito**: `kickoff-claude-code.md` seção 5.1 usa caminhos sem prefixo (`app/`, `lib/db/`,
  `lib/actions/`). Já `CLAUDE.md` e `docs/briefings.md` usam `src/` em tudo
  (`src/db/schema.ts`, `src/lib/db.ts`, `src/types/index.ts`, `src/actions/`, `src/components/`).
- **Resolução proposta**: adotar `src/`. É a convenção da maioria dos artefatos autoritativos
  (CLAUDE.md regras inegociáveis citam explicitamente `src/db/schema.ts`, `src/lib/cache.ts`, etc.).
  ARCHITECTURE.md já reflete isso.

## 2. Contrato de tipos do CLAUDE.md diverge do schema real

O bloco "Contrato de domínio" do `CLAUDE.md` é mais antigo/simplificado que `db-schema.ts` + `cpts.md`:

- **status**: CLAUDE.md usa `"lancamento" | "obras" | "pronto"`. O schema usa o enum
  `status_obra` com 4 valores: `lancamento | em_construcao | pronto_para_morar | entregue`.
  → **Resolução**: o enum de 4 valores do schema vence (normalização oficial do WP em cpts.md).
- **progressoObra: number**: CLAUDE.md tem um único campo. O schema tem obra multi-etapa
  (fundacao/alvenaria/acabamento/total). → **Resolução**: manter os 4 percentuais do schema;
  `obraTotal` é o equivalente ao "progresso" único quando uma só barra for necessária na UI.
- **Imovel vs Planta**: CLAUDE.md e briefings falam em `imoveis` com `tipo`
  (apartamento/casa/comercial) e `precoBase`. O schema e o cpts.md modelam `plantas`
  (tipologias: metragem, dormitorios, suites, vagas, recursos), sem preço nem enum de tipo.
  → **Resolução**: a entidade é **planta/tipologia**, conforme schema e cpts.md (o domínio Benx
  não comercializa preço por unidade no site). Tratar "imovel" do CLAUDE.md como sinônimo legado
  de "planta". Não criar campo de preço sem confirmação.
- **Midia.url**: CLAUDE.md expõe `url`; as regras mandam guardar `chave` (MinIO) e nunca URL crua.
  → **Resolução**: no banco a coluna é `chave`; o tipo de leitura resolve `url` via `storage.getUrl`.
  O contrato exposto à UI pode ter `url` (resolvida), mas a persistência é por chave.

**Ação**: ao publicar `src/types/index.ts`, derivar do schema (InferSelectModel) e tratar o bloco
do CLAUDE.md como referência histórica, não como contrato vigente. Sugiro atualizar o CLAUDE.md
depois que os tipos reais estiverem publicados.

## 3. Vertente: config (kickoff) vs tabela lookup (schema)

- **Conflito aparente**: kickoff manda modelar vertentes como **config única e extensível**
  (slug, label, cor, ordem), não enum cravado. O `db-schema.ts` modela `linhas_produto` como
  **tabela de lookup** com FK em empreendimentos.
- **Resolução proposta**: não é contradição, são duas camadas. A **config em
  `src/lib/ecossistema`** é a fonte única de verdade (slug, label, cor, ordem) e a tabela
  `linhas_produto` é **semeada a partir dela** (seed/migration idempotente). Helpers de escopo e
  identidade visual leem da config; o banco mantém a FK para integridade e filtro.

## 4. Slug da vertente: `benx_unicos` vs `/unicos`

- **Conflito**: o valor da linha é `benx_unicos` (protótipos e vocabulário), mas `busca-spec.md`
  dá exemplo de rota `/unicos`. O kickoff usa `/{vertente}/{slug}` com exemplo `/vivabenx`.
- **Resolução proposta**: na config de ecossistema separar `value` (chave interna, ex.
  `benx_unicos`) de `slug` de rota (ex. `unicos`). A rota pública usa o `slug`. Confirmar os 3
  slugs de rota desejados: sugiro `unicos`, `benx`, `vivabenx`.

## 5. Quarta vertente pendente

- **Fato**: cpts.md e kickoff registram que o cliente mencionou uma 4ª vertente, ainda não confirmada.
- **Resolução proposta**: nada a cravar. A modelagem por config já é extensível; acrescentar a 4ª
  será uma entrada na config + um seed. Sem enum fechado de vertente em código.

## 6. Modelo de execução: solo (kickoff) vs time de 7 agentes (briefings)

- **Conflito**: `kickoff-claude-code.md` fala de um engenheiro único entregando a fundação.
  `docs/briefings.md` + `scripts/setup-worktrees.sh` descrevem 7 agentes em worktrees paralelos.
  O próprio LEIA-ME marca briefings como "opcional".
- **Resolução proposta**: seguir o fluxo solo do kickoff para a fundação (Fases 0 e 1), mantendo
  a divisão de pastas por domínio compatível com os worktrees, caso o time de agentes seja
  acionado depois. Sem bloqueio.

## 7. `categorias`: confirmar vocabulário

- **Observação**: o schema tem a lookup `categorias` (FK `categoriaId`) e o protótipo de cadastro
  usa TIPO residencial/comercial além de categoria. cpts.md cita `categoria_empreendimento` e
  `tipo-empreendimento_vivabenx` como taxonomias.
- **Resolução proposta**: manter `categorias` como lookup genérica de tipo/categoria do
  empreendimento, semeada com os valores reais do cpts.md na fase de seed. Confirmar a lista exata
  de categorias na Fase de Dados.

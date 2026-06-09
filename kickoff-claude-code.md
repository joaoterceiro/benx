# Kickoff Claude Code: Projeto Benx (clone)

Você é o engenheiro responsável por iniciar do zero o projeto Benx, a partir de uma base de decisões e artefatos que já existe. Leia este documento inteiro antes de escrever qualquer linha. Sua primeira frente de atuação é a **arquitetura e o scaffolding do sistema**, não features. Não pule para telas ou regras de negócio antes da fundação estar de pé e validada.

Idioma do projeto: português do Brasil. Em textos e comentários, não use travessões no meio de frases.

---

## 1. O que é o projeto

Clone do site da incorporadora Benx (hoje em WordPress + JetEngine + Elementor) para uma stack moderna, self-hosted, mais rápida e manutenível. O sistema tem dois lados:

- **Painel administrativo**: onde a equipe cadastra e gere empreendimentos, plantas, mídias e leads.
- **Site público**: portal das vertentes, listagem com busca e a página de cada empreendimento.

O foco imediato desta fase é montar a fundação que serve aos dois lados.

---

## 2. Stack e decisões não negociáveis

- **Next.js 15 (App Router) + TypeScript** em modo estrito. Full-stack via **Server Actions**, sem API REST separada (exceto rotas internas pontuais, ex.: proxy de CEP).
- **PostgreSQL** self-hosted + **Drizzle ORM** (schema, migrations, queries tipadas).
- **Redis** para cache (CEP, resultados de busca, dados quentes).
- **MinIO** (S3-compatible) para armazenamento de mídia.
- **Docker Compose** para orquestrar Postgres, Redis e MinIO em desenvolvimento.
- **Tailwind CSS + shadcn/ui** para UI. Tipografia **SF Pro** (arquivos `@font-face` já fornecidos). Estética **Premium Web** (referências Linear, Vercel, Stripe): tokens já definidos nos artefatos de UI.
- Deploy alvo: VPS via Easypanel.

Proibido: **não usar Supabase** nem qualquer BaaS. Banco, auth e storage são self-hosted.

---

## 3. Regras de negócio centrais (leia com atenção)

### 3.1 Entidade central é o EMPREENDIMENTO

O empreendimento é o núcleo do domínio, não o "imóvel". A ele se ligam:

- **Plantas** (unidades), relação N:N (uma planta pode aparecer em mais de um contexto).
- **Áreas comuns** (repeater: nome, descrição, imagem).
- **Certificações** (repeater: nome, selo).
- **Pontos de interesse** próximos (repeater: nome, distância).
- **Galerias** (fachada, obra) e mídias single (imagem principal, logotipo).
- **Status de obra** multi-etapa (fundação, alvenaria, acabamento, total, documentação, data).

### 3.2 Ecossistema de vertentes (regra de primeiro nível)

Cada vertente da Benx é um mundo isolado. Vertentes confirmadas:

| Vertente | Perfil | Cor |
|---|---|---|
| Benx Únicos | alto padrão | `#7A5C1E` |
| Benx | médio | `#0A4DCC` |
| VivaBenx | econômico (HIS/HMP) | `#2E9E54` |

A vertente é o filtro de primeiro nível em todo o sistema: ao entrar numa vertente, só se enxerga o que pertence a ela. As rotas públicas seguem o padrão `/{vertente}/{slug}` (ex.: `/vivabenx/viva-campinas`). Modele a vertente como atributo de primeira classe do empreendimento e como escopo padrão das queries. Trate a configuração das vertentes (slug, label, cor, ordem) como fonte única de verdade num módulo só.

Observação em aberto: há indício de uma quarta vertente ainda não confirmada. Modele a lista de vertentes de forma extensível (config, não enum cravado em vários lugares), para acrescentar uma quarta sem refatoração ampla.

---

## 4. Material já existente (leia antes de começar)

Estes artefatos já foram produzidos e estão na base do projeto. Use-os como verdade, não reinvente:

- `db-schema.ts`: schema Drizzle inicial (empreendimentos, plantas, taxonomias, relações). Ponto de partida do banco.
- `docs/cpts.md`: engenharia reversa dos custom post types do JetEngine, com todos os campos reais do empreendimento e suas relações.
- `docs/busca-spec.md`: especificação da busca de empreendimentos, incluindo a regra de ecossistema e o comportamento dos filtros (AND, paginação 12/página).
- `docs/snippets-inventario.md`: inventário dos snippets do site atual.
- `sf-pro-fonts.css`: `@font-face` da SF Pro para o projeto Next.
- `docker-compose.yml`: Postgres 16 + Redis 7 + MinIO + init do bucket `benx-midia`.
- Artefatos de UI (React), que definem a identidade visual, os tokens e os componentes do admin. Servem de referência de design e de fonte para portar componentes:
  - `admin-app.jsx`: aplicação administrativa unificada (shell com sidebar navegando entre Dashboard, Empreendimentos, cadastro, Mídias, Leads). Mostra o fluxo completo: listagem leva ao cadastro e volta.
  - `cadastro-empreendimento.jsx`: formulário completo de cadastro (7 abas, todos os campos, uploads com proporção, busca de CEP via ViaCEP, preview ao vivo).
  - `listagem-admin-empreendimentos.jsx` e `admin-painel.jsx`: versões anteriores das telas, úteis como referência.

Os artefatos de UI são protótipos num arquivo só. No projeto real eles devem ser quebrados em componentes e rotas (ver estrutura de pastas).

---

## 5. Sua missão nesta fase: arquitetura e fundação

Não construa features de domínio ainda. Entregue a fundação sobre a qual tudo será construído, validada e rodando. Trabalhe em passos pequenos e valide cada um (typecheck e build) antes de seguir.

### Fase 0: consolidação (antes de codar)

1. Leia todos os artefatos da seção 4.
2. Produza/atualize o `ARCHITECTURE.md` com: visão de camadas, estrutura de pastas, modelo de dados resumido, fluxo de dados (request, server action, db, cache, storage), e a decisão de escopo por vertente. Esse documento guia o resto.
3. Levante dúvidas ou inconsistências entre os artefatos antes de prosseguir. Se algo do schema conflitar com `docs/cpts.md`, registre em `ERRORS.md` e proponha a resolução.

### Fase 1: scaffolding e infraestrutura

Entregáveis concretos, nesta ordem:

1. **Inicializar o Next.js 15** (App Router, TypeScript estrito, ESLint, Tailwind). Configurar `tsconfig` com paths (`@/lib`, `@/components`, etc.).
2. **Tailwind + shadcn/ui + tokens**: portar os tokens de design dos artefatos (cores, raios, sombras, easing) para a configuração do Tailwind e variáveis CSS globais. Registrar a SF Pro via `sf-pro-fonts.css`.
3. **Drizzle + Postgres**: configurar o cliente de banco, portar e refinar `db-schema.ts`, gerar a primeira migration e rodá-la contra o Postgres do compose. Conferir contra `docs/cpts.md` que todos os campos do empreendimento existem (incluindo O Projeto e créditos, áreas, certificações, pontos de interesse, status de obra detalhado, redirecionamento).
4. **Infra via Docker Compose**: subir Postgres, Redis e MinIO com o `docker-compose.yml` existente. Documentar variáveis de ambiente em `.env.example`.
5. **Clientes de infra**: módulo de conexão Redis (cache) e módulo de cliente MinIO (upload, URL assinada, criação de bucket idempotente).
6. **Configuração de ecossistema**: módulo único que define as vertentes (slug, label, cor, ordem) e helpers de escopo. Tudo que precisar de vertente importa daqui.
7. **Esqueleto das camadas e pastas** (ver 5.1), com tipos compartilhados do domínio derivados do schema Drizzle (inferência de tipos, sem duplicar).
8. **Shell do admin**: portar o app shell (sidebar + layout) dos artefatos para `layout.tsx` do grupo de rotas administrativas, com as rotas vazias (placeholders) de Dashboard, Empreendimentos, Mídias e Leads. Sem lógica de domínio ainda, só a casca navegável.
9. **Healthcheck**: uma rota simples que confirma conexão com Postgres, Redis e MinIO, para validar a fundação.

### 5.1 Estrutura de pastas alvo

```
benx/
  app/
    (public)/                # site público
      [vertente]/
        [slug]/page.tsx      # página do empreendimento
    (admin)/
      admin/
        layout.tsx           # shell (sidebar) portado dos artefatos
        dashboard/page.tsx
        empreendimentos/
          page.tsx           # listagem
          novo/page.tsx      # cadastro (criar)
          [id]/page.tsx      # cadastro (editar)
        midias/page.tsx
        leads/page.tsx
    api/
      cep/[cep]/route.ts     # proxy ViaCEP com cache Redis
    layout.tsx               # root: fontes, tokens
  components/                # componentes reutilizáveis (ui, forms, cards)
  lib/
    db/
      schema.ts              # Drizzle (portado de db-schema.ts)
      client.ts              # conexão
      queries/               # queries de leitura, escopadas por vertente
    actions/                 # Server Actions (mutations)
    storage/                 # cliente MinIO
    cache/                   # cliente Redis
    ecossistema/             # config das vertentes + helpers
    types/                   # tipos do domínio inferidos do schema
  drizzle/                   # migrations geradas
  docs/                      # documentação do projeto (seção 6)
  docker-compose.yml
  .env.example
```

### 5.2 Convenções

- Tipos do domínio derivam do schema Drizzle por inferência. Não manter definições paralelas.
- Toda leitura de empreendimentos recebe a vertente como escopo. A query sem vertente é a exceção (admin "todas"), não a regra.
- Server Actions para mutations, com validação de entrada (zod). Componentes de servidor por padrão, cliente só quando há interação.
- Mídia nunca guarda URL crua no banco: guarda a chave no MinIO e a URL é resolvida na leitura.
- CEP e busca passam por cache Redis.

### 5.3 Critério de pronto desta fase

A fase está concluída quando: o projeto sobe em dev, conecta nos três serviços do compose, as migrations criam o schema completo, o shell do admin navega entre as rotas vazias, o healthcheck passa, e `ARCHITECTURE.md` reflete o que foi construído. Nenhuma feature de domínio precisa funcionar ainda.

---

## 6. Documentação do projeto

Mantenha o sistema de documentação em `docs/`, criando e atualizando conforme avança:

- `CLAUDE.md`: contexto raiz, regras, contrato de tipos, comandos.
- `PRD.md`: objetivo, escopo, fases.
- `ARCHITECTURE.md`: camadas, pastas, modelo de dados, fluxo de dados, escopo por vertente.
- `DESIGN_SYSTEM.md`: tokens, tipografia, componentes.
- `TASKS.md`: backlog e estado das tarefas por fase.
- `ERRORS.md`: inconsistências encontradas e decisões de resolução.
- `API.md`: server actions e rotas internas (contratos).
- `SECURITY.md`: auth, upload, validação, segredos.
- `GLOSSARY.md`: termos do domínio (vertente, empreendimento, planta, etc.).

Comece atualizando `ARCHITECTURE.md` e `TASKS.md` na Fase 0.

---

## 7. Fases seguintes (visão, não execute agora)

Apenas para você entender o destino e arquitetar pensando nele:

1. Domínio de empreendimentos: CRUD completo via Server Actions, ligado ao cadastro portado, com upload pro MinIO.
2. Busca e listagem (admin e público) escopadas por vertente, com cache.
3. Plantas, mídias e leads.
4. Site público: portal de vertentes e página de produto.
5. Autenticação e papéis no admin.
6. Deploy no Easypanel.

---

## 8. Regras de qualidade e o que evitar

- TypeScript estrito, sem `any` solto. Erros de tipo travam o avanço.
- Valide (typecheck + build) ao fim de cada passo antes do próximo.
- Não use Supabase nem BaaS.
- Não guarde URL de mídia crua no banco.
- Não cravar a lista de vertentes em vários arquivos: uma config só.
- Português nos textos e comentários, sem travessões no meio de frases.
- Não construa features de domínio antes da fundação validada.

---

## 9. Como começar agora

1. Confirme que leu os artefatos da seção 4 e resuma em 3 a 5 linhas o seu entendimento da arquitetura e da regra de ecossistema.
2. Escreva `ARCHITECTURE.md` e `TASKS.md` (Fase 0).
3. Comece a Fase 1 pelo passo 1 (inicializar o Next.js) e siga em ordem, validando cada passo.
4. Pare e me reporte ao concluir a Fase 1 (critério de pronto da seção 5.3), antes de tocar em qualquer feature de domínio.

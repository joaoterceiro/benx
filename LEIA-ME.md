# Artefatos do projeto Benx

Extraia o conteúdo deste pacote dentro da pasta do projeto (ex.: `benx/`) e
mande o Claude Code seguir com a **opção 1** ("Vou trazer os artefatos").

## O que vai na raiz
- `CLAUDE.md`: contexto raiz (o Claude Code lê automaticamente).
- `kickoff-claude-code.md`: o prompt de início. Comece por ele.
- `db-schema.ts`: schema Drizzle inicial.
- `docker-compose.yml`: Postgres + Redis + MinIO.
- `sf-pro-fonts.css`: fontes SF Pro.

## docs/
Engenharia reversa e specs: `cpts.md` (campos reais do empreendimento),
`busca-spec.md` (busca + regra de ecossistema), `snippets-inventario.md`,
`briefings.md` (time de agentes, opcional).

## ui-prototipos/
Telas React de referência. A principal é `admin-app.jsx` (painel unificado:
listagem, cadastro, dashboard, mídias, leads). No projeto real elas serão
quebradas em componentes e rotas, conforme o kickoff.

## scripts/
`setup-worktrees.sh` (time de agentes em git worktrees) e `diagnose-wp.sh`.

## Ordem sugerida
1. Extrair tudo na pasta do projeto.
2. Apontar o Claude Code para a pasta e abrir o `kickoff-claude-code.md`.
3. Escolher a opção 1. Ele lê os artefatos e inicia a Fase 0 (arquitetura).

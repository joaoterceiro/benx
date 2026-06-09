#!/usr/bin/env bash
set -euo pipefail

# Setup dos worktrees para o time de agentes do Benx Clone (stack self-hosted).
# Rode a partir da raiz do repo git principal (ja com 'main' inicializado e CLAUDE.md commitado).
#
# Cada worktree = um diretorio isolado + uma branch propria.
# Voce abre uma instancia do Claude Code dentro de cada um.

BASE=".."   # onde os worktrees irmaos vao morar (ao lado do repo principal)

create() {
  local name="$1" branch="$2"
  if git show-ref --quiet "refs/heads/$branch"; then
    git worktree add "$BASE/benx-$name" "$branch"
  else
    git worktree add -b "$branch" "$BASE/benx-$name" main
  fi
  echo "  -> benx-$name  (branch: $branch)"
}

echo "Criando worktrees dos agentes..."

# Fase 0 (paralelo entre si)
create mapeamento  feature/mapeamento
create infra       feature/infra

# Fase 1 (paralelo)
create dados        feature/dados
create design       feature/design-system

# Fase 2 (paralelo, dependem da Fase 1)
create ui           feature/ui-paginas
create busca        feature/busca

echo ""
echo "Pronto. Abra o Claude Code em cada pasta:"
git worktree list
echo ""
echo "O Agente Integracao trabalha direto na 'main', revisando e mergeando os PRs."

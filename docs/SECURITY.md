# SECURITY.md — Benx Clone

Notas de segurança da fundação. Atualizar conforme o projeto evolui.

## Autenticação (Fase 5)

- **Self-hosted, sem BaaS.** Credenciais próprias em `usuarios` (Postgres).
- **Senha**: hash com `scrypt` (`node:crypto`) no formato `salt:derivedKey`, comparação
  com `timingSafeEqual`. Sem dependências externas. Código em `src/lib/senha.ts`.
- **Sessão**: token aleatório de 32 bytes (`randomBytes`) guardado na tabela `sessoes`
  com expiração (7 dias). O token é o segredo, vive em cookie **httpOnly**,
  `sameSite=lax`, `secure` em produção, `path=/`. Não há JWT no cliente.
- **Login que não vaza existência de e-mail**: a verificação de senha roda mesmo sem
  usuário encontrado, e a mensagem de erro é genérica ("Credenciais inválidas").

## Guarda de acesso

- **Middleware** (`src/middleware.ts`, matcher `/admin/:path*`): checagem leve de UX,
  redireciona para `/login` se o cookie de sessão estiver ausente. Roda no runtime Edge,
  por isso importa apenas o nome do cookie de um módulo neutro (`src/lib/session-cookie.ts`),
  nunca `pg`/`node:crypto`.
- **Guarda real**: o layout do admin (`(admin)/admin/layout.tsx`) chama `getSessao()`,
  que valida o token no banco e a expiração; sem sessão válida, `redirect("/login")`.
- **Server Actions**: toda mutation verifica `getSessao()` no início e retorna
  "Não autenticado" se faltar sessão. O cliente nunca acessa o banco diretamente.

## Papéis

- Enum `papel`: `admin` | `editor`.
- **Exclusão de empreendimento** exige papel `admin` (`excluirEmpreendimento`).
- Demais mutations exigem apenas sessão autenticada (admin ou editor).

## Pendências / próximos passos

- Rate limiting no login (ex.: por IP/e-mail) e proteção contra brute force.
- Rotação/expiração de sessão por inatividade e logout de todas as sessões.
- CSRF: Server Actions do Next já mitigam via origem; revisar ao expor rotas custom.
- Gestão de usuários no admin (criar/editar/remover, trocar senha).
- Segredos por ambiente (`.env` fora do versionamento; já no `.gitignore`).
- Sanitização/validação de uploads (tipo/efetivo, tamanho máximo) além do MIME.

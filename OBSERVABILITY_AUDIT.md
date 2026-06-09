# Auditoria de Observabilidade

**Data:** 2026-06-05
**Escopo:** ~70 arquivos de aplicação em `src/` (actions, lib, app/api, app, components). Ignorados scripts de `src/db/*` (seed/import/migrate/wp-*).
**Stack detectada:** Node + TypeScript, Next.js 15 (App Router, Server Actions + Route Handlers), Drizzle ORM / PostgreSQL (`pg` Pool), Redis (`ioredis`), MinIO (`@aws-sdk/client-s3`), Zod.
**Logger atual:** nenhum logger estruturado. 1 `console.error` solto em `empreendimento-service.ts`. Todo o resto engole o erro.

## Sumário executivo

- **Severidade geral:** Crítica
- **Total de findings:** 60+ catches que descartam o erro, 0 logs estruturados, 0 contexto de request.
  - **Críticos** (falha silenciosa em auth / captação de lead / operações privilegiadas): 4
  - **Altos** (try/catch de I/O sem log estruturado): 11
  - **Médios** (cache/config/health silenciosos + ausência total de contexto): 6

Não há `requestId`/`correlationId` em lugar nenhum; nenhum log carrega `userId` ou `action`; não há handlers globais de `unhandledRejection`/`uncaughtException`; não há `instrumentation.ts`.

---

## Findings

### [CRÍTICO] F-001 — Captação de lead engolida silenciosamente
**Arquivo:** `src/actions/leads.ts:33`
**Categoria:** Falha silenciosa (perda de dado de negócio)
```ts
try { await db.insert(leads).values({...}); return { ok: true }; }
catch { return { ok: false, erro: "Falha ao enviar. Tente novamente." }; }
```
**Por quê:** um lead é contato comercial. Se o insert falha (constraint, banco fora), o erro some sem rastro: lead perdido, invisível em produção. Sem `err`, sem `action`, sem stack.
**Correção:** `logger.error({ err, action: 'criar_lead', origem, empreendimentoId }, 'falha ao gravar lead')` (sem logar email/telefone em claro).

### [CRÍTICO] F-002 — Login sem log de auditoria nem tratamento de erro
**Arquivo:** `src/actions/auth.ts:11` (`entrar`)
**Categoria:** Falha silenciosa + ausência de contexto (segurança)
**Por quê:** não há `try/catch` ao redor de `db.query`/`verificarSenha`; erro de banco vira exceção não logada (cliente recebe erro genérico). Pior: **nenhum log de tentativa de login** (sucesso/falha). Sem isso não há trilha de auditoria nem detecção de brute force.
**Correção:** logar `warn` em credencial inválida (`{ action:'login_falha', email: maskEmail(email) }`) e `info` em sucesso (`{ action:'login_ok', userId }`); `try/catch` com `logger.error` repropagando.

### [CRÍTICO] F-003 — Erros de sessão (logout / limpeza de expirada) engolidos
**Arquivo:** `src/lib/auth.ts:43` (`destruirSessao`), `src/lib/auth.ts:64` (`getSessao`)
**Categoria:** Falha silenciosa (auth)
```ts
try { await db.delete(sessoes).where(eq(sessoes.token, token)); } catch { /* ignora */ }
```
**Por quê:** falha ao revogar sessão no logout deixa token válido no banco (risco de segurança) sem nenhum sinal. Idem na limpeza de sessão expirada.
**Correção:** `logger.warn({ err, action:'sessao_delete' }, 'falha ao remover sessão')`. Nunca logar o `token`.

### [CRÍTICO] F-004 — Operações privilegiadas de usuário sem log nem trilha
**Arquivo:** `src/actions/usuarios.ts:55, 70, 84, 102, 122`
**Categoria:** Falha silenciosa + ausência de contexto (segurança)
```ts
try { await db.insert(usuarios).values({...senhaHash...}); ... }
catch { return { ok: false, erro: "Falha ao criar usuário" }; }
```
**Por quê:** criar usuário, alterar papel, redefinir senha de terceiro, remover usuário: tudo retorna erro genérico sem log. Não há **audit trail** de quem promoveu/rebaixou/excluiu quem. Falhas invisíveis.
**Correção:** `logger.info` no sucesso (`{ action:'usuario_criar', actorId: sessao.id, alvoId, papel }`) e `logger.error({ err, action, actorId })` no catch. **Nunca** logar `senha`/`senhaHash`.

### [ALTO] F-005 — Storage MinIO sem log
**Arquivo:** `src/lib/storage.ts:60` (`ensureBucket`) e `uploadMidia`/`deleteMidia`/`getUrl` (sem try/catch)
**Categoria:** try/catch sem log / I/O sem instrumentação
**Por quê:** `ensureBucket` trata qualquer falha do `HeadBucket` como "bucket não existe" e tenta criar, mascarando erro de credencial/rede. Upload/delete/sign propagam erro sem `action`/`chave`/`durationMs`.
**Correção:** logar `error` com `{ err, action:'s3_upload'|'s3_delete', chave, durationMs }`; em `ensureBucket`, logar o motivo real.

### [ALTO] F-006 — `console.error` não estruturado no serviço de persistência
**Arquivo:** `src/lib/empreendimento-service.ts:274`
```ts
} catch (err) { console.error("[persistirEmpreendimento] erro:", err instanceof Error ? err.message : err);
```
**Por quê:** único log do código de app é `console.*` (não vai para coletor estruturado), perde stack e contexto (`userId`, `slug`, `action`).
**Correção:** `logger.error({ err, action:'persistir_empreendimento', slug }, 'falha ao persistir')`.

### [ALTO] F-007 — Route handler de busca sem log
**Arquivo:** `src/app/api/busca/route.ts:19` → retorna `500 {erro:true}` sem registrar a causa.
**Correção:** `logger.error({ err, action:'api_busca', query }, 'busca falhou')`.

### [ALTO] F-008 — Proxy CEP sem log
**Arquivo:** `src/app/api/cep/[cep]/route.ts:27` → `502` sem log da falha do `fetch` ViaCEP.
**Correção:** `logger.warn({ err, action:'api_cep', cep }, 'viacep indisponível')`.

### [ALTO] F-009 — Server Actions descartando o erro (padrão repetido)
**Categoria:** Falha silenciosa + try/catch sem log. Todos seguem `catch { return {ok:false, erro:"..."} }`, jogando fora `err`/stack:
- `src/actions/empreendimentos.ts:59, 105, 120, 137, 162`
- `src/actions/plantas.ts:81, 109, 123, 150`
- `src/actions/jornal.ts:89, 109, 121, 140`
- `src/actions/midias.ts:74, 92, 98`
- `src/actions/slider.ts:52, 63, 85`
- `src/actions/menu.ts:62, 88, 100`
- `src/actions/footer.ts:23, 67`
- `src/actions/splash.ts:33, 76`
- `src/actions/configuracoes.ts:36`
- `src/actions/busca.ts:34`
**Correção:** em cada catch, `logger.error({ err, action:'<verbo>_<entidade>', ...ids, actorId })` antes do `return`.

### [MÉDIO] F-010 — Cache Redis 100% silencioso
**Arquivo:** `src/lib/cache.ts:17, 30, 44`
**Por quê:** `cacheGet/Set/Invalidate` engolem tudo. Best-effort é correto, mas uma queda do Redis fica invisível (degradação de performance sem alarme).
**Correção:** `logger.warn({ err, action:'cache_get'|'cache_set', key })` (idealmente amostrado para não floodar).

### [MÉDIO] F-011 — Leitores de config mascarando erro real como "tabela ausente"
**Arquivo:** `src/lib/config.ts:21`, `src/lib/busca-config.ts:34`, `src/lib/footer-config.ts:70,79`, `src/lib/menu.ts:67,88`, `src/lib/splash.ts:60,67`
**Por quê:** o catch retorna defaults assumindo "primeiro boot". Mas qualquer erro de banco/JSON inválido vira default silencioso, mascarando incidente real.
**Correção:** `logger.warn({ err, action:'ler_config', chave }, 'usando defaults')`.

### [MÉDIO] F-012 — Health check sem diagnóstico
**Arquivo:** `src/app/api/health/route.ts:21, 28, 35`
**Por quê:** marca `erro` por dependência mas descarta o motivo, justo o que se precisa quando está "degradado".
**Correção:** `logger.error({ err, dep:'postgres'|'redis'|'minio' }, 'healthcheck dep down')`.

### [MÉDIO] F-013 — DB ausente no layout/sitemap sem log
**Arquivo:** `src/app/layout.tsx:54`, `src/app/sitemap.ts:43, 51` — aceitável, mas logar `warn` ajuda no boot.

### [MÉDIO] F-014 — Ausência total de contexto de request
Nenhum log carrega `requestId`/`correlationId`, `userId` ou `action`. `src/middleware.ts` não gera id de correlação. Sem isso é impossível amarrar logs de uma mesma requisição em produção.

### [MÉDIO] F-015 — Sem handlers globais nem instrumentação
Não há `instrumentation.ts` nem `process.on('unhandledRejection'|'uncaughtException')`. Erros fora de try/catch (ex.: rejeições não tratadas) somem.

---

## Plano de implementação proposto

1. Adicionar `pino` + `pino-pretty` (dev).
2. `src/lib/logger.ts` — instância Pino, 6 níveis (`trace/debug/info/warn/error/fatal`), JSON em prod / pretty em dev, serializer de erro, `redact` ligado.
3. `src/lib/redaction-paths.ts` — paths sensíveis (senha, senhaHash, token, authorization, cpf, email, telefone, cookie, secret...).
4. `src/lib/mask.ts` — `maskEmail`, `maskCpf`, `maskPhone`, `maskCard`.
5. `src/lib/log-context.ts` — `requestId` via header `x-request-id` (lido de `next/headers`) + `ctxLogger()` que injeta `{ requestId, userId }`.
6. `src/middleware.ts` — gerar `x-request-id` (UUID) e propagar no request/response.
7. `src/instrumentation.ts` — `unhandledRejection`/`uncaughtException` → `logger.fatal`.
8. Reescrever os try/catch **Críticos** (F-001 a F-004) e **Altos** (F-005 a F-009).
9. Trocar o `console.error` (F-006) por `logger`.
10. Findings **Médios** (F-010 a F-013).
11. `src/lib/logger.test.ts` — garante que senha/token/email nunca aparecem no output.
12. `tsc --noEmit` + testes.

**Estimativa:** ~6 arquivos novos, ~22 arquivos modificados.

---

Posso prosseguir com a implementação? Vou trabalhar **arquivo por arquivo**, mostrar o diff de cada um e esperar sua aprovação antes de salvar. Pode começar?

# Auditoria SEO e Performance — Benx (produção: benx-newsite.imagenou.com)

Medições em produção + leitura do código. Prioridade: P0 (crítico) > P1 (alto) > P2 (médio).

## Achado que domina tudo (P0): SITE_URL = localhost em produção
A mesma causa do problema das credenciais (toggle "Criar arquivo .env" desligado no
EasyPanel) faz `NEXT_PUBLIC_SITE_URL`/`SITE_URL` cair no default `http://localhost:3000`.
Consequências de SEO graves:
- `robots.txt` → `Host: http://localhost:3000` e `Sitemap: http://localhost:3000/sitemap.xml`
- `sitemap.xml` → todas as `<loc>` apontam para `localhost`
- `metadataBase` = localhost → **OpenGraph e canonical** com URLs erradas
- Resultado: buscadores indexam URLs inválidas; compartilhamento social quebra.

**Correção:** definir `SITE_URL=https://benx-newsite.imagenou.com` de forma efetiva.
Como o env do painel não aplica, a forma robusta é mudar o default no compose
(`NEXT_PUBLIC_SITE_URL`/`SITE_URL`) ou ligar o `.env`. É a correção de maior impacto.

## Performance

### P0 — Tudo dinâmico, zero cache de HTML
- Header em todas as páginas: `Cache-Control: private, no-cache, no-store` → nenhuma
  página é cacheada no browser/CDN. TTFB medido: `/` ~550ms, `/benx` ~395ms (re-render
  a cada request, consultando Postgres/Redis).
- Causa: `export const dynamic = "force-dynamic"` no `(public)/layout.tsx` (coloquei
  para o build não pré-renderizar sem banco). Isso **anulou o ISR** que existia nas páginas.
- **Correção:** remover o force-dynamic do layout e voltar ao ISR por página
  (`revalidate`), tornando os reads do layout (config/menu/legal) resilientes a banco
  ausente no build (try/catch já existe na busca; replicar em config/menu/legal).
  Ganho: TTFB ~0 (servido do cache), menos carga no Postgres.

### P1 — Sem compressão HTTP
- Resposta HTML sai **sem `content-encoding`** (br/gzip). HTML de `/benx` = 44KB sem comprimir.
- **Correção:** habilitar gzip/brotli no proxy (Traefik do EasyPanel) ou `compress: true`
  no Next (já é default, mas o proxy pode estar removendo). Ganho: -70% no HTML.

### P1 — 62 `<img>` crus, 0 `next/image`; slides 2500px
- Sem AVIF/WebP automático, sem `srcset`, sem `width/height` (risco de CLS), imagens
  superdimensionadas (slides do hero têm 2500px de largura servidos em card/hero).
- **Correção:** migrar imagens locais (`/public`, slides) para `next/image` (gera
  AVIF/WebP + srcset + dimensões). Para mídia do MinIO (URLs assinadas), pelo menos
  redimensionar no upload e manter `loading="lazy"` + `width/height`. Pré-carregar
  (`fetchpriority=high`) só a 1ª imagem do hero (LCP).

### P2 — Bom já feito
- Fonte = stack de sistema (sem download de web font). ✓
- `next.config` cacheia assets estáticos versionados 1 ano. ✓
- Imagens já recomprimidas no `/public`. ✓

## SEO técnico

### P0 — (ver acima) URLs canônicas/OG/sitemap em localhost.

### P1 — Sem dados estruturados (JSON-LD) — 0 no projeto
Imobiliária ganha muito com schema.org:
- `Organization` (logo, nome, sameAs) no layout.
- `Residence`/`Product`/`Offer` nas páginas de empreendimento.
- `Article` + `BreadcrumbList` no Benx Journal.
- `BreadcrumbList` nas vertentes/produtos.

### P1 — Canonical ausente (0 alternates) e metadados rasos
- Nenhuma página declara `alternates.canonical`. Adicionar canonical por rota.
- Só 2 `generateMetadata` e 2 `openGraph`: a maioria das institucionais usa só o
  template de título, sem `description`/OG próprios → adicionar `description` única e
  `openGraph` (com imagem) por página.

### P1 — Sitemap incompleto (14 URLs)
- Deveria listar ~85 (71 empreendimentos + posts do jornal + estáticas). Hoje sai 14
  (parte do DB pode estar limitada/falhando + URLs localhost). Corrigir SITE_URL e
  garantir o loop de empreendimentos/posts no `sitemap.ts`.

### P2 — Higiene
- `alt` em todas as imagens (boa parte já tem; varrer os 62 `<img>`).
- Hierarquia de headings (um `<h1>` por página).
- `robots`/`Disallow` já cobre /admin, /login, /api. ✓

## Plano priorizado (ordem de execução)
1. **P0** Corrigir `SITE_URL` em produção (compose default ou `.env`). Resolve sitemap,
   robots, OG, canonical, metadataBase de uma vez.
2. **P0** Reverter `force-dynamic` do layout → ISR + reads resilientes. TTFB e cache.
3. **P1** Compressão no proxy.
4. **P1** JSON-LD (Organization + Article + Residence) e canonical por rota.
5. **P1** `next/image` nos slides/hero + dimensões; sitemap completo.
6. **P2** Varredura de `alt`, headings, OG por página institucional.

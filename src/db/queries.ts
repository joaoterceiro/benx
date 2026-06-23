import "server-only";
import { eq, and, or, ilike, sql, asc, desc, inArray, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  empreendimentos,
  linhasProduto,
  cidades,
  bairros,
  categorias,
  plantas,
  empreendimentoPlanta,
  midias,
  postsJornal,
  heroSlides,
} from "@/db/schema";
import { cacheGet, cacheSet } from "@/lib/cache";
import { getUrl } from "@/lib/storage";
import { vertentePorValue, listarVertentes, type VertenteValue } from "@/lib/ecossistema";
import { lerStripConfig, lerPromoIds, type StripConfig } from "@/lib/strip-config";
import { statusObraLabel, tipoHabitacaoLabel } from "@/lib/labels";
import { seloUrlPorTipo } from "@/lib/selo";
import type {
  Empreendimento,
  EmpreendimentoComRelacoes,
  Cidade,
  Categoria,
  Planta,
} from "@/types";

const PAGINA = 12; // paginação padrão da busca (busca-spec.md)

// ── Taxonomias ───────────────────────────────────────────────────────────
export async function listarCategorias(): Promise<Categoria[]> {
  return db.select().from(categorias).orderBy(categorias.nome);
}

export async function listarCidades(): Promise<Cidade[]> {
  return db.select().from(cidades).orderBy(cidades.nome);
}

export async function linhaIdPorValue(value: string): Promise<string | null> {
  const linha = await db.query.linhasProduto.findFirst({
    where: eq(linhasProduto.slug, value),
  });
  return linha?.id ?? null;
}

// ── Plantas (N:N) ──────────────────────────────────────────────────────────
export async function plantasDoEmpreendimento(empId: string): Promise<Planta[]> {
  const rows = await db.query.empreendimentoPlanta.findMany({
    where: eq(empreendimentoPlanta.empreendimentoId, empId),
    with: { planta: true },
  });
  return rows.map((r) => r.planta);
}

export async function listarPlantas(): Promise<Planta[]> {
  return db.select().from(plantas).orderBy(plantas.nome);
}

// Plantas para o admin: com thumbnail e empreendimentos vinculados.
export interface PlantaAdmin {
  id: string;
  nome: string;
  metragem: string | null;
  dormitorios: string | null;
  suites: string | null;
  vagas: string | null;
  imagemUrl: string | null;
  empreendimentos: string[];
}
export async function listarPlantasAdmin(): Promise<PlantaAdmin[]> {
  const rows = await db.query.plantas.findMany({
    orderBy: [plantas.nome],
    with: { empreendimentos: { with: { empreendimento: { columns: { nome: true } } } } },
  });
  return Promise.all(
    rows.map(async (p) => ({
      id: p.id,
      nome: p.nome,
      metragem: p.metragem != null ? String(p.metragem) : null,
      dormitorios: p.dormitorios != null ? String(p.dormitorios) : null,
      suites: p.suites != null ? String(p.suites) : null,
      vagas: p.vagas != null ? String(p.vagas) : null,
      imagemUrl: p.imagemPlanta ? await getUrl(p.imagemPlanta) : null,
      empreendimentos: (p.empreendimentos ?? []).map((e) => e.empreendimento?.nome ?? "").filter(Boolean),
    }))
  );
}

// ── Mídias ─────────────────────────────────────────────────────────────────
export interface MidiaResolvida {
  id: string;
  tipo: string;
  alt: string;
  chave: string;
  url: string;
}

// Mídias de um empreendimento, com URL assinada resolvida, ordenadas.
export async function midiasDoEmpreendimento(empId: string): Promise<MidiaResolvida[]> {
  const rows = await db
    .select()
    .from(midias)
    .where(eq(midias.empreendimentoId, empId))
    .orderBy(midias.tipo, midias.ordem);
  return Promise.all(
    rows.map(async (m) => ({
      id: m.id,
      tipo: m.tipo,
      alt: m.alt ?? "",
      chave: m.chave,
      url: await getUrl(m.chave),
    }))
  );
}

// Biblioteca de mídias (admin): últimas mídias com nome do empreendimento.
export async function listarBibliotecaMidias(limite = 60) {
  const rows = await db.query.midias.findMany({
    with: { empreendimento: { columns: { nome: true } } },
    orderBy: [desc(midias.id)],
    limit: limite,
  });
  return Promise.all(
    rows.map(async (m) => ({
      id: m.id,
      tipo: m.tipo,
      alt: m.alt ?? "",
      empreendimentoId: m.empreendimentoId ?? "",
      empreendimento: m.empreendimento?.nome ?? "—",
      url: await getUrl(m.chave),
    }))
  );
}
export type BibliotecaMidia = Awaited<ReturnType<typeof listarBibliotecaMidias>>[number];

// ── Admin ─────────────────────────────────────────────────────────────────
// Lista para o admin. A vertente é opcional aqui ("todas" é a exceção do admin).
export async function listarEmpreendimentosAdmin(
  vertente?: VertenteValue
): Promise<EmpreendimentoComRelacoes[]> {
  const linhaId = vertente ? await linhaIdPorValue(vertente) : null;
  if (vertente && !linhaId) return [];

  return db.query.empreendimentos.findMany({
    where: linhaId ? eq(empreendimentos.linhaProdutoId, linhaId) : undefined,
    with: { cidade: true, bairro: true, categoria: true, linhaProduto: true, midias: true },
    orderBy: [desc(empreendimentos.atualizadoEm)],
  });
}

export async function empreendimentoPorId(
  id: string
): Promise<EmpreendimentoComRelacoes | null> {
  const row = await db.query.empreendimentos.findFirst({
    where: eq(empreendimentos.id, id),
    with: { cidade: true, bairro: true, categoria: true, linhaProduto: true, midias: true },
  });
  return row ?? null;
}

// ── Público (escopado por vertente) ────────────────────────────────────────
export interface FiltrosBusca {
  cidadeSlug?: string;
  bairroSlug?: string;
  status?: Empreendimento["statusObra"];
  pagina?: number;
}

export interface ResultadoBusca {
  itens: EmpreendimentoComRelacoes[];
  total: number;
  pagina: number;
  porPagina: number;
}

// Busca escopada na vertente. Filtros são opcionais e combinam com AND.
// Resultado cacheado no Redis (invalidar no write).
export async function buscarEmpreendimentos(
  vertente: VertenteValue,
  filtros: FiltrosBusca = {}
): Promise<ResultadoBusca> {
  const pagina = Math.max(1, filtros.pagina ?? 1);
  const chave = `busca:${vertente}:${filtros.cidadeSlug ?? ""}:${filtros.bairroSlug ?? ""}:${filtros.status ?? ""}:p${pagina}`;
  const cacheado = await cacheGet<ResultadoBusca>(chave);
  if (cacheado) return cacheado;

  const linhaId = await linhaIdPorValue(vertente);
  if (!linhaId) {
    return { itens: [], total: 0, pagina, porPagina: PAGINA };
  }

  // vertente é o filtro de PRIMEIRO nível, sempre aplicado
  const condicoes = [
    eq(empreendimentos.linhaProdutoId, linhaId),
    eq(empreendimentos.visivel, true),
  ];
  if (filtros.status) condicoes.push(eq(empreendimentos.statusObra, filtros.status));
  if (filtros.bairroSlug) {
    const bai = await db.query.bairros.findFirst({ where: eq(bairros.slug, filtros.bairroSlug) });
    if (bai) condicoes.push(eq(empreendimentos.bairroId, bai.id));
    else return { itens: [], total: 0, pagina, porPagina: PAGINA };
  }
  if (filtros.cidadeSlug) {
    const cid = await db.query.cidades.findFirst({
      where: eq(cidades.slug, filtros.cidadeSlug),
    });
    if (cid) condicoes.push(eq(empreendimentos.cidadeId, cid.id));
    else return { itens: [], total: 0, pagina, porPagina: PAGINA };
  }
  const where = and(...condicoes);

  const [{ total }] = await db
    .select({ total: sql<number>`cast(count(*) as int)` })
    .from(empreendimentos)
    .where(where);

  const itens = await db.query.empreendimentos.findMany({
    where,
    with: { cidade: true, bairro: true, categoria: true, linhaProduto: true, midias: true },
    orderBy: [desc(empreendimentos.criadoEm)],
    limit: PAGINA,
    offset: (pagina - 1) * PAGINA,
  });

  const resultado: ResultadoBusca = { itens, total, pagina, porPagina: PAGINA };
  await cacheSet(chave, resultado, 300);
  return resultado;
}

// Valores de status_obra presentes nos empreendimentos visíveis da vertente.
// Permite que valores cadastrados pelo admin apareçam no filtro público.
export async function listarStatusObra(vertente: VertenteValue): Promise<string[]> {
  const linhaId = await linhaIdPorValue(vertente);
  if (!linhaId) return [];
  const rows = await db
    .selectDistinct({ status: empreendimentos.statusObra })
    .from(empreendimentos)
    .where(
      and(
        eq(empreendimentos.linhaProdutoId, linhaId),
        eq(empreendimentos.visivel, true)
      )
    );
  return rows.map((r) => r.status).filter((s): s is string => !!s);
}

// Lista enxuta (slug + nome) para seletores no admin (ex.: relacionados).
export async function listarEmpreendimentosResumo(): Promise<{ slug: string; nome: string }[]> {
  return db
    .select({ slug: empreendimentos.slug, nome: empreendimentos.nome })
    .from(empreendimentos)
    .orderBy(empreendimentos.nome);
}

// Empreendimentos relacionados (por slug), preservando a ordem e só os visíveis.
export async function empreendimentosPorSlugs(
  slugs: string[]
): Promise<EmpreendimentoComRelacoes[]> {
  if (!slugs.length) return [];
  const rows = await db.query.empreendimentos.findMany({
    where: and(inArray(empreendimentos.slug, slugs), eq(empreendimentos.visivel, true)),
    with: { cidade: true, bairro: true, categoria: true, linhaProduto: true, midias: true },
  });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  return slugs.map((s) => bySlug.get(s)).filter((r): r is EmpreendimentoComRelacoes => !!r);
}

export async function empreendimentoPublicoPorSlug(
  vertente: VertenteValue,
  slug: string
): Promise<EmpreendimentoComRelacoes | null> {
  const linhaId = await linhaIdPorValue(vertente);
  if (!linhaId) return null;

  const row = await db.query.empreendimentos.findFirst({
    where: and(
      eq(empreendimentos.slug, slug),
      eq(empreendimentos.linhaProdutoId, linhaId),
      eq(empreendimentos.visivel, true)
    ),
    with: { cidade: true, bairro: true, categoria: true, linhaProduto: true, midias: true },
  });
  return row ?? null;
}

// ── Benx Jornal ─────────────────────────────────────────────────────────────
import type { PostJornal } from "@/types";

export type PostResolvido = Omit<PostJornal, "imagem"> & { imagemUrl: string | null };

async function resolverPost(p: PostJornal): Promise<PostResolvido> {
  const { imagem, ...resto } = p;
  return { ...resto, imagemUrl: imagem ? await getUrl(imagem) : null };
}

// Admin: todos os posts (rascunhos inclusos), mais recentes primeiro.
export async function listarPostsAdmin(): Promise<PostJornal[]> {
  return db.select().from(postsJornal).orderBy(desc(postsJornal.dataPublicacao));
}

export async function postPorId(id: string): Promise<PostJornal | null> {
  const row = await db.query.postsJornal.findFirst({ where: eq(postsJornal.id, id) });
  return row ?? null;
}

// Público: categorias distintas entre publicados.
export async function categoriasJornal(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ c: postsJornal.categoria })
    .from(postsJornal)
    .where(eq(postsJornal.publicado, true));
  return rows.map((r) => r.c).filter((c): c is string => !!c).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

// Público: lista de publicados (destaque primeiro, depois por data), opcional por categoria.
export async function listarPostsPublicos(categoria?: string): Promise<PostResolvido[]> {
  const cond = [eq(postsJornal.publicado, true)];
  if (categoria) cond.push(eq(postsJornal.categoria, categoria));
  const rows = await db
    .select()
    .from(postsJornal)
    .where(and(...cond))
    .orderBy(desc(postsJornal.destaque), desc(postsJornal.dataPublicacao));
  return Promise.all(rows.map(resolverPost));
}

export async function postPublicadoPorSlug(slug: string): Promise<PostResolvido | null> {
  const row = await db.query.postsJornal.findFirst({
    where: and(eq(postsJornal.slug, slug), eq(postsJornal.publicado, true)),
  });
  return row ? resolverPost(row) : null;
}

// Relacionados: mesma categoria, exceto o atual.
export async function postsRelacionados(slug: string, categoria: string, limite = 3): Promise<PostResolvido[]> {
  const rows = await db
    .select()
    .from(postsJornal)
    .where(and(eq(postsJornal.publicado, true), eq(postsJornal.categoria, categoria)))
    .orderBy(desc(postsJornal.dataPublicacao))
    .limit(limite + 1);
  return Promise.all(rows.filter((r) => r.slug !== slug).slice(0, limite).map(resolverPost));
}

// ── Home da vertente ────────────────────────────────────────────────────────
export interface CardVertente {
  slug: string;
  nome: string;
  statusObra: string;
  bairro: string;
  cidade: string;
  imagemUrl: string | null;
  logotipoUrl: string | null;
  seloUrl: string | null;
}

export interface EmpOrdenacao { id: string; nome: string; ordemHome: number; statusObra: string }
// Empreendimentos visíveis agrupados por vertente, para a tela de destaques no admin.
export async function empreendimentosOrdenacao(): Promise<
  { value: VertenteValue; label: string; slug: string; items: EmpOrdenacao[] }[]
> {
  return Promise.all(
    listarVertentes().map(async (v) => {
      const linhaId = await linhaIdPorValue(v.value);
      const rows = linhaId
        ? await db.query.empreendimentos.findMany({
            where: and(eq(empreendimentos.linhaProdutoId, linhaId), eq(empreendimentos.visivel, true)),
            orderBy: [asc(empreendimentos.nome)],
            columns: { id: true, nome: true, ordemHome: true, statusObra: true },
          })
        : [];
      return { value: v.value, label: v.label, slug: v.slug, items: rows };
    })
  );
}

// Monta o ORDER BY da faixa conforme o modo configurado no admin:
//  - fixados (ordem_home>0) primeiro, na ordem definida (exceto modo "so_tags");
//  - depois pela sequência de tags (status), se o modo usar tags;
//  - desempate aleatório ou por mais recentes.
function orderByStrip(cfg: StripConfig): SQL {
  const usaFixados = cfg.modo !== "so_tags";
  const usaTags = cfg.modo !== "fixados_aleatorio";
  const aleatorio = cfg.modo === "fixados_aleatorio" || cfg.modo === "fixados_tags_aleatorio";
  const partes: SQL[] = [];
  if (usaFixados) {
    partes.push(sql`(${empreendimentos.ordemHome} = 0)`);
    partes.push(sql`${empreendimentos.ordemHome}`);
  }
  if (usaTags) {
    const casos = cfg.tags.map((t, i) => sql`WHEN ${t} THEN ${i}`);
    partes.push(sql`CASE ${empreendimentos.statusObra} ${sql.join(casos, sql` `)} ELSE 999 END`);
  }
  partes.push(aleatorio ? sql`random()` : sql`${empreendimentos.criadoEm} DESC`);
  return sql.join(partes, sql`, `);
}

export async function cardsVertente(value: VertenteValue): Promise<CardVertente[]> {
  const linhaId = await linhaIdPorValue(value);
  if (!linhaId) return [];
  const cfg = await lerStripConfig(value);
  const rows = await db.query.empreendimentos.findMany({
    where: and(eq(empreendimentos.linhaProdutoId, linhaId), eq(empreendimentos.visivel, true)),
    with: { cidade: true, bairro: true },
    orderBy: orderByStrip(cfg),
  });
  return Promise.all(
    rows.map(async (e) => ({
      slug: e.slug,
      nome: e.nome,
      statusObra: e.statusObra,
      bairro: e.bairro?.nome ?? "",
      cidade: e.cidade?.nome ?? "",
      imagemUrl: e.imagemPrincipal ? await getUrl(e.imagemPrincipal) : null,
      logotipoUrl: e.logotipo ? await getUrl(e.logotipo) : null,
      seloUrl: value === "vivabenx" ? seloUrlPorTipo(e.tipoHabitacao) : null,
    }))
  );
}

// Cards da faixa "Conheça nossa linha <value>" (cross-promo nas outras homes).
// Usa a seleção/ordem dedicada (home_promo_<value>) se houver; senão, cai na
// faixa normal da linha (cardsVertente).
export async function cardsPromo(value: VertenteValue): Promise<CardVertente[]> {
  const ids = await lerPromoIds(value);
  if (ids.length === 0) return cardsVertente(value);
  const linhaId = await linhaIdPorValue(value);
  if (!linhaId) return [];
  const rows = await db.query.empreendimentos.findMany({
    where: and(
      eq(empreendimentos.linhaProdutoId, linhaId),
      eq(empreendimentos.visivel, true),
      inArray(empreendimentos.id, ids),
    ),
    with: { cidade: true, bairro: true },
  });
  const byId = new Map(rows.map((e) => [e.id, e]));
  const ordenados = ids.map((id) => byId.get(id)).filter(Boolean) as typeof rows;
  return Promise.all(
    ordenados.map(async (e) => ({
      slug: e.slug,
      nome: e.nome,
      statusObra: e.statusObra,
      bairro: e.bairro?.nome ?? "",
      cidade: e.cidade?.nome ?? "",
      imagemUrl: e.imagemPrincipal ? await getUrl(e.imagemPrincipal) : null,
      logotipoUrl: e.logotipo ? await getUrl(e.logotipo) : null,
      seloUrl: value === "vivabenx" ? seloUrlPorTipo(e.tipoHabitacao) : null,
    }))
  );
}

// Bairros distintos usados por empreendimentos visíveis da vertente.
export async function bairrosDaVertente(value: VertenteValue): Promise<{ slug: string; nome: string }[]> {
  const linhaId = await linhaIdPorValue(value);
  if (!linhaId) return [];
  const rows = await db
    .selectDistinct({ slug: bairros.slug, nome: bairros.nome })
    .from(empreendimentos)
    .innerJoin(bairros, eq(empreendimentos.bairroId, bairros.id))
    .where(and(eq(empreendimentos.linhaProdutoId, linhaId), eq(empreendimentos.visivel, true)))
    .orderBy(bairros.nome);
  return rows;
}

// Todos os bairros com empreendimentos visíveis (cross-vertente) — catálogo geral.
export async function listarBairros(): Promise<{ slug: string; nome: string }[]> {
  return db
    .selectDistinct({ slug: bairros.slug, nome: bairros.nome })
    .from(empreendimentos)
    .innerJoin(bairros, eq(empreendimentos.bairroId, bairros.id))
    .where(eq(empreendimentos.visivel, true))
    .orderBy(bairros.nome);
}

// ── Hero slides (topo das homes) ────────────────────────────────────────────
export interface HeroSlideResolvido {
  id: string;
  titulo: string;
  imagemUrl: string | null;
  videoUrl: string | null;
  link: string | null;
  botaoTexto: string;
  tags: string[];
  duracao: number; // segundos
  seloUrl: string | null; // selo de habitação (só Viva Benx), resolvido pelo empreendimento do slide
}

// Opções de empreendimento para autocomplete no cadastro de slide.
export interface OpcaoSlideEmpreendimento {
  nome: string;
  link: string;             // /{vertenteSlug}/{slug}
  vertente: string;         // value (para marcar "Exibir em")
  imagem: string | null;    // chave MinIO (persistida no slide)
  imagemUrl: string | null; // URL assinada (prévia)
  tags: string[];           // [status, bairro]
}

export async function empreendimentosParaSlide(): Promise<OpcaoSlideEmpreendimento[]> {
  const rows = await db.query.empreendimentos.findMany({
    where: eq(empreendimentos.visivel, true),
    with: { cidade: true, bairro: true, linhaProduto: true },
    orderBy: [desc(empreendimentos.criadoEm)],
  });
  return Promise.all(
    rows.map(async (e) => {
      const v = vertentePorValue(e.linhaProduto?.slug ?? "");
      return {
        nome: e.nome,
        link: v ? `/${v.slug}/${e.slug}` : "",
        vertente: e.linhaProduto?.slug ?? "",
        imagem: e.imagemPrincipal ?? null,
        imagemUrl: e.imagemPrincipal ? await getUrl(e.imagemPrincipal) : null,
        tags: [statusObraLabel(e.statusObra), e.bairro?.nome ?? ""].filter(Boolean),
      };
    })
  );
}

export interface SlideAdmin {
  id: string;
  titulo: string;
  imagem: string | null;
  imagemPreview: string | null;
  videoUrl: string | null;
  link: string | null;
  botaoTexto: string;
  tags: string[];
  locais: string[];
  ordem: number;
  duracao: number;
  ativo: boolean;
}

export async function listarSlidesAdmin(): Promise<SlideAdmin[]> {
  const rows = await db.select().from(heroSlides).orderBy(asc(heroSlides.ordem), asc(heroSlides.criadoEm));
  return Promise.all(
    rows.map(async (s) => ({
      id: s.id,
      titulo: s.titulo,
      imagem: s.imagem,
      imagemPreview: s.imagem ? (s.imagem.startsWith("/") || /^https?:\/\//.test(s.imagem) ? s.imagem : await getUrl(s.imagem)) : null,
      videoUrl: s.videoUrl,
      link: s.link,
      botaoTexto: s.botaoTexto || "Conheça",
      tags: s.tags ?? [],
      locais: s.locais ?? [],
      ordem: s.ordem,
      duracao: s.duracao && s.duracao > 0 ? s.duracao : 6,
      ativo: s.ativo,
    }))
  );
}

export async function slidesDaVertente(local: string): Promise<HeroSlideResolvido[]> {
  const todos = await db
    .select()
    .from(heroSlides)
    .where(eq(heroSlides.ativo, true))
    .orderBy(asc(heroSlides.ordem), asc(heroSlides.criadoEm));
  const rows = todos.filter((s) => (s.locais ?? []).includes(local));

  // Mapas nome -> tags / selo do empreendimento, para enriquecer o slide pelo título.
  const tagsPorNome = new Map<string, string[]>();
  const seloPorNome = new Map<string, string | null>();
  const ehViva = local === "vivabenx";
  const linhaId = await linhaIdPorValue(local);
  if (linhaId) {
    const emps = await db.query.empreendimentos.findMany({
      where: and(eq(empreendimentos.linhaProdutoId, linhaId), eq(empreendimentos.visivel, true)),
      with: { bairro: true },
    });
    for (const e of emps) {
      const tags = [statusObraLabel(e.statusObra), e.bairro?.nome ?? ""].filter(Boolean);
      tagsPorNome.set(e.nome.trim().toLowerCase(), tags);
      if (ehViva) seloPorNome.set(e.nome.trim().toLowerCase(), seloUrlPorTipo(e.tipoHabitacao));
    }
  }

  return Promise.all(
    rows.map(async (s) => ({
      id: s.id,
      titulo: s.titulo,
      imagemUrl: s.imagem ? (s.imagem.startsWith("/") || /^https?:\/\//.test(s.imagem) ? s.imagem : await getUrl(s.imagem)) : null,
      videoUrl: s.videoUrl ? (s.videoUrl.startsWith("/") || /^https?:\/\//.test(s.videoUrl) ? s.videoUrl : await getUrl(s.videoUrl)) : null,
      link: s.link,
      botaoTexto: s.botaoTexto || "Conheça",
      tags: (s.tags && s.tags.length) ? s.tags : (tagsPorNome.get(s.titulo.trim().toLowerCase()) ?? []),
      duracao: s.duracao && s.duracao > 0 ? s.duracao : 6,
      seloUrl: ehViva ? (seloPorNome.get(s.titulo.trim().toLowerCase()) ?? null) : null,
    }))
  );
}

// Todos os slides ativos (catálogo geral /empreendimentos), usando as tags do
// próprio slide.
export async function todosSlides(): Promise<HeroSlideResolvido[]> {
  const rows = await db
    .select()
    .from(heroSlides)
    .where(eq(heroSlides.ativo, true))
    .orderBy(asc(heroSlides.ordem), asc(heroSlides.criadoEm));
  return Promise.all(
    rows.map(async (s) => ({
      id: s.id,
      titulo: s.titulo,
      imagemUrl: s.imagem ? (s.imagem.startsWith("/") || /^https?:\/\//.test(s.imagem) ? s.imagem : await getUrl(s.imagem)) : null,
      videoUrl: s.videoUrl ? (s.videoUrl.startsWith("/") || /^https?:\/\//.test(s.videoUrl) ? s.videoUrl : await getUrl(s.videoUrl)) : null,
      link: s.link,
      botaoTexto: s.botaoTexto || "Conheça",
      tags: s.tags ?? [],
      duracao: s.duracao && s.duracao > 0 ? s.duracao : 6,
      seloUrl: null,
    }))
  );
}

// ── Estatísticas da dashboard ──────────────────────────────────────────────
export interface DashboardRecente {
  id: string;
  nome: string;
  slug: string;
  vertenteValue: string;
  statusObra: string;
  visivel: boolean;
  atualizadoEm: Date;
}
export interface DashboardStats {
  totalEmpreendimentos: number;
  visiveis: number;
  ocultos: number;
  totalPlantas: number;
  totalMidias: number;
  totalCidades: number;
  porVertente: { value: string; total: number }[];
  porStatus: { status: string; total: number }[];
  recentes: DashboardRecente[];
}

export async function estatisticasDashboard(): Promise<DashboardStats> {
  const [
    [{ total }],
    [{ vis }],
    [{ plantasN }],
    [{ midiasN }],
    [{ cidadesN }],
    porVertenteRows,
    porStatusRows,
    recentesRows,
  ] = await Promise.all([
    db.select({ total: sql<number>`cast(count(*) as int)` }).from(empreendimentos),
    db.select({ vis: sql<number>`cast(count(*) as int)` }).from(empreendimentos).where(eq(empreendimentos.visivel, true)),
    db.select({ plantasN: sql<number>`cast(count(*) as int)` }).from(plantas),
    db.select({ midiasN: sql<number>`cast(count(*) as int)` }).from(midias),
    db.select({ cidadesN: sql<number>`cast(count(*) as int)` }).from(cidades),
    db
      .select({ value: linhasProduto.slug, total: sql<number>`cast(count(*) as int)` })
      .from(empreendimentos)
      .innerJoin(linhasProduto, eq(empreendimentos.linhaProdutoId, linhasProduto.id))
      .groupBy(linhasProduto.slug),
    db
      .select({ status: empreendimentos.statusObra, total: sql<number>`cast(count(*) as int)` })
      .from(empreendimentos)
      .groupBy(empreendimentos.statusObra)
      .orderBy(desc(sql`count(*)`)),
    db.query.empreendimentos.findMany({
      with: { linhaProduto: true },
      orderBy: [desc(empreendimentos.atualizadoEm)],
      limit: 6,
    }),
  ]);

  return {
    totalEmpreendimentos: total,
    visiveis: vis,
    ocultos: total - vis,
    totalPlantas: plantasN,
    totalMidias: midiasN,
    totalCidades: cidadesN,
    porVertente: porVertenteRows,
    porStatus: porStatusRows.filter((r) => r.status),
    recentes: recentesRows.map((r) => ({
      id: r.id,
      nome: r.nome,
      slug: r.slug,
      vertenteValue: r.linhaProduto?.slug ?? "",
      statusObra: r.statusObra,
      visivel: r.visivel,
      atualizadoEm: r.atualizadoEm,
    })),
  };
}

// ── Busca global (modal Glass) ─────────────────────────────────────────────
export interface BuscaFacet { slug: string; nome: string; count?: number }
export interface BuscaBairro { slug: string; nome: string; cidadeSlug: string }
export interface BuscaItem {
  id: string;
  nome: string;
  url: string;
  img: string | null;
  cidade: string;
  uf: string;
  bairro: string;
  tipo: string;
  status: string;
  seloUrl: string | null;
}
export interface BuscaFiltros {
  q?: string;
  tipo?: string;       // tipo_habitacao (valor cru)
  categoria?: string;  // slug da categoria
  cidade?: string;     // slug da cidade
  bairro?: string;     // slug do bairro
  status?: string;     // status_obra (valor cru)
}
export interface DadosBusca {
  tipos: BuscaFacet[];
  categorias: BuscaFacet[];
  cidades: BuscaFacet[];
  bairros: BuscaBairro[];
  status: BuscaFacet[];
  recentes: BuscaItem[];
}

// Monta a URL pública de um empreendimento a partir da vertente (linha de produto).
function urlPublica(linhaSlug: string | null | undefined, slug: string): string {
  const v = vertentePorValue(linhaSlug ?? "");
  return v ? `/${v.slug}/${slug}` : "#";
}

type EmpComRel = EmpreendimentoComRelacoes;
async function paraItem(e: EmpComRel): Promise<BuscaItem> {
  return {
    id: e.id,
    nome: e.nome,
    url: urlPublica(e.linhaProduto?.slug, e.slug),
    img: e.imagemPrincipal ? await getUrl(e.imagemPrincipal) : null,
    cidade: e.cidade?.nome ?? "",
    uf: e.cidade?.estado ?? "",
    bairro: e.bairro?.nome ?? "",
    tipo: tipoHabitacaoLabel(e.tipoHabitacao),
    status: statusObraLabel(e.statusObra),
    seloUrl: e.linhaProduto?.slug === "vivabenx" ? seloUrlPorTipo(e.tipoHabitacao) : null,
  };
}

// Facetas + sugestões iniciais (todas as vertentes visíveis).
export async function dadosBusca(recentesLimit = 6): Promise<DadosBusca> {
  const vis = eq(empreendimentos.visivel, true);

  const [tiposRows, statusRows, cidadesRows, categoriasRows, bairrosRows, recentesRows] =
    await Promise.all([
      db.selectDistinct({ v: empreendimentos.tipoHabitacao }).from(empreendimentos).where(vis),
      db.selectDistinct({ v: empreendimentos.statusObra }).from(empreendimentos).where(vis),
      db
        .select({ slug: cidades.slug, nome: cidades.nome, count: sql<number>`cast(count(*) as int)` })
        .from(empreendimentos)
        .innerJoin(cidades, eq(empreendimentos.cidadeId, cidades.id))
        .where(vis)
        .groupBy(cidades.slug, cidades.nome)
        .orderBy(desc(sql`count(*)`)),
      db
        .selectDistinct({ slug: categorias.slug, nome: categorias.nome })
        .from(empreendimentos)
        .innerJoin(categorias, eq(empreendimentos.categoriaId, categorias.id))
        .where(vis)
        .orderBy(categorias.nome),
      db
        .selectDistinct({ slug: bairros.slug, nome: bairros.nome, cidadeSlug: cidades.slug })
        .from(empreendimentos)
        .innerJoin(bairros, eq(empreendimentos.bairroId, bairros.id))
        .innerJoin(cidades, eq(empreendimentos.cidadeId, cidades.id))
        .where(vis)
        .orderBy(bairros.nome),
      db.query.empreendimentos.findMany({
        where: vis,
        with: { cidade: true, bairro: true, categoria: true, linhaProduto: true, midias: true },
        orderBy: [desc(empreendimentos.criadoEm)],
        limit: Math.max(1, recentesLimit),
      }),
    ]);

  return {
    tipos: tiposRows
      .map((r) => r.v)
      .filter((v): v is string => !!v)
      .map((v) => ({ slug: v, nome: tipoHabitacaoLabel(v) })),
    status: statusRows
      .map((r) => r.v)
      .filter((v): v is string => !!v)
      .map((v) => ({ slug: v, nome: statusObraLabel(v) })),
    cidades: cidadesRows,
    categorias: categoriasRows,
    bairros: bairrosRows,
    recentes: await Promise.all(recentesRows.map(paraItem)),
  };
}

// Resultados ao vivo. Limite generoso (dataset pequeno).
export async function buscarGlass(f: BuscaFiltros): Promise<{ items: BuscaItem[]; total: number }> {
  const cond = [eq(empreendimentos.visivel, true)];

  const q = (f.q ?? "").trim();
  if (q) {
    const like = `%${q}%`;
    cond.push(or(ilike(empreendimentos.nome, like), ilike(empreendimentos.subtitulo, like))!);
  }
  if (f.tipo) cond.push(eq(empreendimentos.tipoHabitacao, f.tipo));
  if (f.status) cond.push(eq(empreendimentos.statusObra, f.status));

  if (f.categoria) {
    const c = await db.query.categorias.findFirst({ where: eq(categorias.slug, f.categoria) });
    if (!c) return { items: [], total: 0 };
    cond.push(eq(empreendimentos.categoriaId, c.id));
  }
  if (f.cidade) {
    const c = await db.query.cidades.findFirst({ where: eq(cidades.slug, f.cidade) });
    if (!c) return { items: [], total: 0 };
    cond.push(eq(empreendimentos.cidadeId, c.id));
  }
  if (f.bairro) {
    const b = await db.query.bairros.findFirst({ where: eq(bairros.slug, f.bairro) });
    if (!b) return { items: [], total: 0 };
    cond.push(eq(empreendimentos.bairroId, b.id));
  }

  const where = and(...cond);
  const [{ total }] = await db
    .select({ total: sql<number>`cast(count(*) as int)` })
    .from(empreendimentos)
    .where(where);

  const rows = await db.query.empreendimentos.findMany({
    where,
    with: { cidade: true, bairro: true, categoria: true, linhaProduto: true, midias: true },
    orderBy: [desc(empreendimentos.criadoEm)],
    limit: 24,
  });

  return { items: await Promise.all(rows.map(paraItem)), total };
}

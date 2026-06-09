import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { logError } from "@/lib/log-context";
import {
  empreendimentos,
  cidades,
  bairros,
  categorias,
  linhasProduto,
  plantas,
  empreendimentoPlanta,
  midias,
} from "@/db/schema";
import { slugify } from "@/lib/utils";
import { humanizar } from "@/lib/labels";
import {
  empreendimentoInputSchema,
  type EmpreendimentoInput,
  type EmpreendimentoParsed,
} from "@/lib/validation/empreendimento";

// Resultado padrão das operações de domínio.
export type ResultadoSalvar =
  | { ok: true; id: string; slug: string }
  | { ok: false; erro: string; campos?: Record<string, string> };

export interface PlantaPayload {
  nome: string;
  metragem?: string;
  dormitorios?: string | number;
  suites?: string | number;
  vagas?: string | number;
  recursos: string[];
  imagem: string | null; // chave MinIO
}
export interface SalvarPayload extends EmpreendimentoInput {
  plantas: PlantaPayload[];
  galeriaFachada: string[]; // chaves MinIO
  galeriaObra: string[];
}

// ── Helpers de taxonomia (resolve-or-create) ────────────────────────────
async function resolverLinhaId(value: string): Promise<string | null> {
  const linha = await db.query.linhasProduto.findFirst({ where: eq(linhasProduto.slug, value) });
  return linha?.id ?? null;
}
async function resolverCidadeId(nome?: string, uf?: string): Promise<string | null> {
  if (!nome) return null;
  const slug = slugify(nome);
  const achada = await db.query.cidades.findFirst({ where: eq(cidades.slug, slug) });
  if (achada) return achada.id;
  const [nova] = await db
    .insert(cidades)
    .values({ nome, estado: (uf ?? "").toUpperCase(), slug })
    .returning({ id: cidades.id });
  return nova.id;
}
async function resolverBairroId(nome?: string, cidadeId?: string | null): Promise<string | null> {
  if (!nome) return null;
  const slug = slugify(nome);
  const achado = await db.query.bairros.findFirst({ where: eq(bairros.slug, slug) });
  if (achado) return achado.id;
  const [novo] = await db
    .insert(bairros)
    .values({ nome, slug, cidadeId: cidadeId ?? null })
    .returning({ id: bairros.id });
  return novo.id;
}
async function resolverCategoriaId(slug?: string): Promise<string | null> {
  if (!slug) return null;
  const cat = await db.query.categorias.findFirst({ where: eq(categorias.slug, slug) });
  if (cat) return cat.id;
  // Categoria nova cadastrada pelo admin direto no formulário: cria on the fly.
  const [novo] = await db
    .insert(categorias)
    .values({ nome: humanizar(slug), slug })
    .onConflictDoNothing({ target: categorias.slug })
    .returning({ id: categorias.id });
  if (novo) return novo.id;
  const existente = await db.query.categorias.findFirst({ where: eq(categorias.slug, slug) });
  return existente?.id ?? null;
}

function toInt(v: unknown): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

async function slugPlantaUnico(base: string): Promise<string> {
  let slug =
    (base || "planta")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "planta";
  const existe = await db.query.plantas.findFirst({ where: eq(plantas.slug, slug) });
  if (existe) slug = `${slug}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return slug;
}

// Monta o objeto de colunas a partir do input já validado.
async function montarValores(p: EmpreendimentoParsed) {
  const linhaProdutoId = await resolverLinhaId(p.linhaProduto);
  const cidadeId = await resolverCidadeId(p.cidadeNome, p.cidadeUf);
  const bairroId = await resolverBairroId(p.bairroNome, cidadeId);
  const categoriaId = await resolverCategoriaId(p.categoriaSlug);

  return {
    nome: p.nome,
    slug: p.slug,
    subtitulo: p.subtitulo ?? null,
    tipoHabitacao: p.tipoHabitacao ?? null,
    statusObra: p.statusObra,
    previsaoEntrega: p.previsaoEntrega
      ? /^\d{4}-\d{2}$/.test(p.previsaoEntrega)
        ? `${p.previsaoEntrega}-01`
        : p.previsaoEntrega
      : null,
    oProjeto: p.oProjeto ?? null,
    arquitetura: p.arquitetura ?? null,
    paisagismo: p.paisagismo ?? null,
    interiores: p.interiores ?? null,
    totalUnidades: p.totalUnidades ?? null,
    totalAndares: p.totalAndares ?? null,
    unidadesPorAndar: p.unidadesPorAndar ?? null,
    numeroTorres: p.numeroTorres ?? null,
    areaTerreno: p.areaTerreno ?? null,
    areaConstruidaTotal: p.areaConstruidaTotal ?? null,
    metragemResidencial: p.metragemResidencial ?? null,
    metragemNr: p.metragemNr ?? null,
    quartos: p.quartos ?? null,
    vagas: p.vagas ?? null,
    textoLegal: p.textoLegal ?? null,
    enderecoParcial: p.enderecoParcial ?? null,
    enderecoCompleto: p.enderecoCompleto ?? null,
    cep: p.cep ?? null,
    enderecoVendas: p.enderecoVendas ?? null,
    standDeVendas: p.standDeVendas ?? null,
    linkUber: p.linkUber ?? null,
    linkMaps: p.linkMaps ?? null,
    linkWaze: p.linkWaze ?? null,
    imagemPrincipal: p.imagemPrincipal ?? null,
    logotipo: p.logotipo ?? null,
    urlVideoPrincipal: p.urlVideoPrincipal ?? null,
    thumbnailVideo: p.thumbnailVideo ?? null,
    urlTourVirtual: p.urlTourVirtual ?? null,
    vistasDoAndar: p.vistasDoAndar ?? null,
    obraFundacao: p.obraFundacao ?? null,
    obraAlvenaria: p.obraAlvenaria ?? null,
    obraAcabamento: p.obraAcabamento ?? null,
    obraTotal: p.obraTotal ?? null,
    obraDocumentacao: p.obraDocumentacao ?? null,
    obraAtualizadaEm: p.obraAtualizadaEm ?? null,
    redirecionarPara: p.redirecionarPara ?? null,
    seoTitulo: p.seoTitulo ?? null,
    seoDescricao: p.seoDescricao ?? null,
    visivel: p.visivel,
    exibirObras: p.exibirObras,
    exibirPlantas: p.exibirPlantas,
    exibirLocalizacao: p.exibirLocalizacao,
    modoBreveLancamento: p.modoBreveLancamento,
    diferenciais: p.diferenciais,
    areasComuns: p.areasComuns,
    certificacoes: p.certificacoes,
    detalhesLocalizacao: p.detalhesLocalizacao,
    tagsCard: p.tagsCard,
    relacionados: p.relacionados,
    cidadeId,
    bairroId,
    categoriaId,
    linhaProdutoId,
  };
}

export function validarEmpreendimento(input: EmpreendimentoInput) {
  const parsed = empreendimentoInputSchema.safeParse(input);
  if (!parsed.success) {
    const campos: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "_");
      if (!campos[k]) campos[k] = issue.message;
    }
    return { campos };
  }
  return { data: parsed.data };
}

// ════════════════════════════════════════════════════════════════════════
// Núcleo de persistência (puro: sem cookies/cache/revalidate).
// Reutilizado pela Server Action e por testes de integração.
// Faz upsert do empreendimento e substitui plantas e galerias (fachada/obra).
// ════════════════════════════════════════════════════════════════════════
export async function persistirEmpreendimento(
  empId: string | null,
  payload: SalvarPayload
): Promise<ResultadoSalvar & { vertente?: string }> {
  const v = validarEmpreendimento(payload);
  if (!v.data) return { ok: false, erro: "Validação falhou", campos: v.campos };

  const valores = await montarValores(v.data);
  if (!valores.linhaProdutoId) {
    return { ok: false, erro: "Vertente inválida", campos: { linhaProduto: "Vertente inválida" } };
  }

  try {
    // 1. upsert
    let id = empId;
    let slug = valores.slug;
    if (id) {
      const [row] = await db
        .update(empreendimentos)
        .set({ ...valores, atualizadoEm: new Date() })
        .where(eq(empreendimentos.id, id))
        .returning({ id: empreendimentos.id, slug: empreendimentos.slug });
      if (!row) return { ok: false, erro: "Empreendimento não encontrado" };
      slug = row.slug;
    } else {
      const [row] = await db
        .insert(empreendimentos)
        .values(valores)
        .returning({ id: empreendimentos.id, slug: empreendimentos.slug });
      id = row.id;
      slug = row.slug;
    }

    // 2. plantas: substitui o conjunto (remove vínculos atuais e plantas órfãs)
    const vinculos = await db
      .select({ plantaId: empreendimentoPlanta.plantaId })
      .from(empreendimentoPlanta)
      .where(eq(empreendimentoPlanta.empreendimentoId, id));
    await db.delete(empreendimentoPlanta).where(eq(empreendimentoPlanta.empreendimentoId, id));
    for (const { plantaId } of vinculos) {
      const aindaVinculada = await db.query.empreendimentoPlanta.findFirst({
        where: eq(empreendimentoPlanta.plantaId, plantaId),
      });
      if (!aindaVinculada) await db.delete(plantas).where(eq(plantas.id, plantaId));
    }
    for (const p of payload.plantas.filter((x) => x.nome?.trim())) {
      const pslug = await slugPlantaUnico(`${slug}-${p.nome}`);
      const [nova] = await db
        .insert(plantas)
        .values({
          slug: pslug,
          nome: p.nome,
          metragem: p.metragem || null,
          dormitorios: toInt(p.dormitorios),
          suites: toInt(p.suites),
          vagas: toInt(p.vagas),
          imagemPlanta: p.imagem ?? null,
          recursos: p.recursos ?? [],
        })
        .returning({ id: plantas.id });
      await db
        .insert(empreendimentoPlanta)
        .values({ empreendimentoId: id, plantaId: nova.id })
        .onConflictDoNothing();
    }

    // 3. galerias fachada/obra: substitui o conjunto
    await db
      .delete(midias)
      .where(and(eq(midias.empreendimentoId, id), inArray(midias.tipo, ["fachada", "obra"])));
    let ordem = 0;
    for (const chave of payload.galeriaFachada ?? []) {
      await db.insert(midias).values({ empreendimentoId: id, chave, tipo: "fachada", ordem: ordem++ });
    }
    ordem = 0;
    for (const chave of payload.galeriaObra ?? []) {
      await db.insert(midias).values({ empreendimentoId: id, chave, tipo: "obra", ordem: ordem++ });
    }

    return { ok: true, id, slug, vertente: v.data.linhaProduto };
  } catch (err) {
    await logError({ err, action: "persistir_empreendimento" }, "falha ao persistir empreendimento");
    const msg =
      err instanceof Error && err.message.includes("unique")
        ? "Já existe um empreendimento com este slug"
        : "Falha ao salvar";
    return { ok: false, erro: msg };
  }
}

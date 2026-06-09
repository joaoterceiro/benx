/* Mapeamento WP -> domínio (puro, sem upload nem banco).
   Fonte única de verdade do "de-para", usada pelo importador (import-wp.ts)
   e pela auditoria (audit-import.ts). Devolve IDs de attachment (não chaves
   MinIO): quem importa resolve os uploads; quem audita compara contagens. */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { carregarDump, parseMeta, type Row } from "@/db/wp-dump";

export const BASE = "C:\\Users\\joaotterceiro\\Local Sites\\benx\\app";
export const DUMP = join(BASE, "sql", "local.sql");
export const UPLOADS = join(BASE, "public", "wp-content", "uploads");

export const STATUS: Record<string, string> = {
  "lancamento": "lancamento", "lançamento": "lancamento", "na planta": "lancamento",
  "em construcao": "em_construcao", "em construção": "em_construcao",
  "pronto para morar": "pronto_para_morar", "pronto": "pronto_para_morar",
  "entregue": "entregue",
};
export const HABITACAO: Record<string, string> = { "his": "his", "hmp": "hmp", "his e hmp": "his_e_hmp" };
export const VERTENTE: Record<string, string> = { "alto-padrao": "benx_iconicos", "medio-alto": "benx", "medio-padrao": "benx" };
export const norm = (s: string) => s.trim().toLowerCase();

export function stripHtml(s: string): string {
  return s
    .replace(/<br\s*\/?>(\n)?/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#0?39;|&rsquo;|&apos;/g, "'").replace(/&quot;/g, '"')
    .replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
export const areaNum = (s: string | null): string => {
  if (!s) return "";
  const m = s.match(/[\d.,]+/); if (!m) return "";
  const n = m[0].replace(/\./g, "").replace(",", ".");
  return /^\d+(\.\d+)?$/.test(n) ? n : "";
};
export const ctype = (p: string) => {
  const e = p.toLowerCase().split(".").pop();
  return e === "png" ? "image/png" : e === "webp" ? "image/webp" : e === "gif" ? "image/gif"
    : e === "svg" ? "image/svg+xml" : e === "avif" ? "image/avif" : "image/jpeg";
};

export interface Ctx {
  posts: Row[];
  mv: (id: string, k: string) => string | null;
  metaDe: (id: string) => Map<string, string | null> | undefined;
  arquivoDe: (att: string | null | undefined) => string | null;
  arquivoExiste: (att: string | null | undefined) => boolean;
  publicados: Row[]; // empreendimentos + vivabenx, status publish
}

export function criarContexto(caminho = DUMP): Ctx {
  const db = carregarDump(caminho);
  const posts = db.rows("wp_posts");
  const metaIdx = new Map<string, Map<string, string | null>>();
  for (const m of db.rows("wp_postmeta")) {
    const id = m.post_id ?? ""; let mp = metaIdx.get(id); if (!mp) { mp = new Map(); metaIdx.set(id, mp); }
    mp.set(m.meta_key ?? "", m.meta_value ?? null);
  }
  const mv = (id: string, k: string) => metaIdx.get(id)?.get(k) ?? null;
  const metaDe = (id: string) => metaIdx.get(id);
  const arquivoDe = (att: string | null | undefined) => (att && /^\d+$/.test(att) ? mv(att, "_wp_attached_file") : null);
  const arquivoExiste = (att: string | null | undefined) => {
    const rel = arquivoDe(att); return !!rel && existsSync(join(UPLOADS, ...rel.split("/")));
  };

  // relações N:N empreendimento -> plantas
  const relPlantas = new Map<string, string[]>();
  for (const rel of ["wp_jet_rel_10", "wp_jet_rel_23"]) {
    for (const r of db.rows(rel)) {
      const p = r.parent_object_id ?? "", c = r.child_object_id ?? "";
      if (!relPlantas.has(p)) relPlantas.set(p, []); relPlantas.get(p)!.push(c);
    }
  }
  (criarContexto as any)._relPlantas = relPlantas;

  // taxonomias para categoria (Tipo)
  const terms = new Map<string, string>();
  for (const t of db.rows("wp_terms")) terms.set(t.term_id ?? "", t.slug ?? "");
  const ttMap = new Map<string, { term_id: string; taxonomy: string }>();
  for (const r of db.rows("wp_term_taxonomy")) ttMap.set(r.term_taxonomy_id ?? "", { term_id: r.term_id ?? "", taxonomy: r.taxonomy ?? "" });
  const relTerms = new Map<string, string[]>();
  for (const r of db.rows("wp_term_relationships")) {
    if (!relTerms.has(r.object_id ?? "")) relTerms.set(r.object_id ?? "", []); relTerms.get(r.object_id ?? "")!.push(r.term_taxonomy_id ?? "");
  }
  (criarContexto as any)._tax = { terms, ttMap, relTerms };

  const publicados = posts.filter((p) => ["empreendimentos", "vivabenx"].includes(p.post_type ?? "") && p.post_status === "publish");
  return { posts, mv, metaDe, arquivoDe, arquivoExiste, publicados };
}

const VALIDO_TIPO = new Set(["residencial", "comercial", "misto"]);
function categoriaDe(empId: string): string | undefined {
  const tax = (criarContexto as any)._tax as { terms: Map<string, string>; ttMap: Map<string, { term_id: string; taxonomy: string }>; relTerms: Map<string, string[]> };
  const tts = tax.relTerms.get(empId) ?? [];
  for (const t of ["tipo-empreendimento", "tipo-empreendimento_vivabenx"]) {
    for (const ttId of tts) { const info = tax.ttMap.get(ttId); if (!info || info.taxonomy !== t) continue; const slug = tax.terms.get(info.term_id); if (slug && VALIDO_TIPO.has(slug)) return slug; }
  }
  return undefined;
}

function repeater(raw: string | null): Record<string, unknown>[] {
  const v = parseMeta(raw);
  if (!v || typeof v !== "object") return [];
  return Object.values(v as Record<string, unknown>).filter((x): x is Record<string, unknown> => !!x && typeof x === "object");
}
const numFromTitle = (t: string, re: RegExp) => (t.match(re)?.[1] ?? "").trim();

export interface MapPlanta { nome: string; metragem: string; dormitorios: string; suites: string; vagas: string; recursos: string[]; thumbAtt: string | null }
export interface Mapeado {
  nome: string; slug: string; subtitulo: string;
  linhaProduto: string; categoriaSlug?: string; tipoHabitacao?: string; statusObra: string; previsaoEntrega: string;
  oProjeto: string; arquitetura: string; paisagismo: string; interiores: string;
  totalUnidades: string; totalAndares: string; unidadesPorAndar: string; numeroTorres: string;
  areaTerreno: string; areaConstruidaTotal: string; metragemResidencial: string; metragemNr: string; quartos: string; vagas: string; textoLegal: string;
  enderecoParcial: string; enderecoCompleto: string; cep: string; cidadeNome: string; cidadeUf: string; bairroNome: string;
  enderecoVendas: string; standDeVendas: string; linkUber: string; linkMaps: string; linkWaze: string;
  urlVideoPrincipal: string; urlTourVirtual: string; vistasDoAndar: string;
  obraFundacao: string; obraAlvenaria: string; obraAcabamento: string; obraTotal: string; obraDocumentacao: string; obraAtualizadaEm: string; redirecionarPara: string;
  visivel: boolean; exibirObras: boolean; exibirPlantas: boolean; exibirLocalizacao: boolean; modoBreveLancamento: boolean;
  diferenciais: string[]; detalhesLocalizacao: { titulo: string; distancia: string }[]; tagsCard: string[];
  areasNomeadas: { nome: string }[];
  certificacoes: { nome: string; logoAtt: string }[];
  imagemPrincipalAtt: string | null; logotipoAtt: string | null; thumbnailVideoAtt: string | null;
  fachadaAtts: string[]; obraAtts: string[]; areasGalAtts: string[];
  plantaIds: string[];
  relacionadosSlugs: string[];
}

const split = (csv: string | null) => (csv ? csv.split(",").map((x) => x.trim()).filter(Boolean) : []);

// Chaves de meta que o mapeamento consome (legado + _vb). Usada pela auditoria
// para detectar campos do WP com dado que NÃO foram importados.
export const CHAVES_CONSUMIDAS = new Set<string>([
  "nome_do_empreendimento_", "nome_do_empreendimento__vb", "subtitulo_slogan_", "subtitulo_slogan_vb",
  "linha_do_produto", "tipo_de_habitacao_vb", "status_da_obra_", "status_da_obra_vb",
  "previsao_de_entrega", "previsao_de_entrega_vb", "o_projeto_", "o_projeto_vb",
  "arquitetura", "arquitetura_vb", "paisagismo_", "paisagismo_vb", "interiores_", "interiores_vb",
  "total_de_unidades_", "total_de_unidades_vb", "total_de_andares_", "total_de_andares_vb",
  "unidades_por_andar_", "unidades_por_andar_vb", "_numero_de_torres_", "_numero_de_torres_vb",
  "area_do_terreno_", "area_do_terreno_vb", "_area_construida_total_", "_area_construida_total_vb",
  "metragem_r", "metragem_", "metragem_vb", "metragem_nr", "_quartos_", "_quartos_vb", "_residencial", "vagas_", "vagas_vb",
  "texto_legal_do_empreendimento", "texto_legal_do_empreendimento_vb",
  "endereco_parcial", "endereco_parcial_vb", "endereco_completo_", "endereco_completo_vb",
  "cep_empreendimento_", "cep_empreendimento_vb", "_cidade_empreendimento-", "_cidade_empreendimento_vb",
  "estado_empreendimento", "estado_empreendimento_vb", "bairro_empreendimento", "bairro_empreendimento_vb",
  "endereco_vendas_", "endereco_vendas_vb", "stand_de_vendas_", "stand_de_vendas_vb",
  "link_uber_", "link_uber_vb", "link_maps_", "link_maps_vb", "link_wase_", "link_wase_vb",
  "url_do_video_principal_", "url_do_video_principal_vb", "url_do_tour_virtual", "url_do_tour_virtual_vb",
  "vistas_do_andar_", "vistas_do_andar_vb", "fundacao_", "fundacao_vb", "alvenaria_", "alvenaria_vb",
  "acabamento", "acabamento_vb", "total_obras", "total_obras_vb", "_documentacao_", "_documentacao_vb",
  "data_de_atualizacao_", "data_de_atualizacao_vb", "redirecionar_pagina_", "_status_v", "_status_v_vb",
  "exibir_obras_no_site", "exibir_obras_no_site_vb", "exibir_plantas_na_pagina", "exibir_plantas_na_pagina_vb",
  "exibir_localizacao_na_pagina", "exibir_localizacao_na_pagina_vb", "ativar_modo_breve_lancamento_", "ativar_modo_breve_lancamento_vb",
  "certificacoes_do_empreendimento", "certificacoes_do_empreendimento_vb", "lista_de_diferenciais", "lista_de_diferenciais_vb",
  "detalhes_da_localizacao", "detalhes_da_localizacao_vb", "tags_card_p",
  "lista_de_areas_comuns_", "lista_de_areas_comuns_vb", "imagens_areas_comuns_", "imagens_areas_comuns_vb",
  "img_principal_produto", "img_principal_produto_vb", "_thumbnail_id", "logotipo_do_empreendimento_vb",
  "thumbnail_do_video_1", "thumbnail_do_video__vb", "imagens_da_fachada_", "imagens_da_fachada_vb",
  "_galeria_de_imagens_obras_", "_galeria_de_imagens_obras_vb",
  "vincular_outros_empreendimentos", "vincular_outros_empreendimentos_vb",
]);

// Padrão de chaves-lixo do WP/editor (Elementor, WPCode, revisões, duplicações).
export const CHAVE_LIXO = /^(_edit_|_wp_|_oembed|_elementor|_wpcode|_dp_original|classic-editor|_menu_item|informacoes_basicas_t|__galeria_imagens_|diferenciais_lista_|_exibir|ltspan_|_yoast|_aioseo|rank_math)/;

export function mapear(ctx: Ctx, post: Row): Mapeado {
  const id = post.ID!;
  const vb = post.post_type === "vivabenx";
  const g = (leg: string, viva: string) => (vb ? ctx.mv(id, viva) : ctx.mv(id, leg)) ?? "";
  const txt = (leg: string, viva: string) => g(leg, viva).trim();
  const html = (leg: string, viva: string) => stripHtml(g(leg, viva));
  const bool = (leg: string, viva: string) => norm(g(leg, viva)) === "true";
  const intTxt = (leg: string, viva: string) => g(leg, viva).match(/\d+/)?.[0] ?? "";

  const nome = txt("nome_do_empreendimento_", "nome_do_empreendimento__vb") || (post.post_title ?? "");
  const habRaw = norm(g("tipo_de_habitacao_vb", "tipo_de_habitacao_vb"));

  const certificacoes: { nome: string; logoAtt: string }[] = [];
  for (const it of repeater(ctx.mv(id, vb ? "certificacoes_do_empreendimento_vb" : "certificacoes_do_empreendimento"))) {
    const cn = String(it["certificacao_nome_"] ?? it["certificacao_nome"] ?? "").trim();
    if (cn) certificacoes.push({ nome: cn, logoAtt: String(it["certificacao_logo_"] ?? "") });
  }
  const diferenciais = repeater(ctx.mv(id, vb ? "lista_de_diferenciais_vb" : "lista_de_diferenciais"))
    .map((it) => String(Object.values(it).find((v) => typeof v === "string" && v.trim()) ?? "")).filter(Boolean);
  const detalhesLocalizacao = repeater(ctx.mv(id, vb ? "detalhes_da_localizacao_vb" : "detalhes_da_localizacao"))
    .map((it) => { const vals = Object.values(it).map(String); return { titulo: (vals[0] ?? "").trim(), distancia: (vals[1] ?? "").trim() }; }).filter((d) => d.titulo);
  const tagsCard = repeater(ctx.mv(id, "tags_card_p"))
    .map((it) => String(Object.values(it).find((v) => typeof v === "string" && v.trim()) ?? "")).filter(Boolean);
  const areasNomeadas = repeater(ctx.mv(id, vb ? "lista_de_areas_comuns_vb" : "lista_de_areas_comuns_"))
    .map((it) => ({ nome: String(Object.values(it).find((v) => typeof v === "string" && v.trim()) ?? "").trim() })).filter((a) => a.nome);

  const relPlantas = (criarContexto as any)._relPlantas as Map<string, string[]>;
  const plantaIds = (relPlantas.get(id) ?? []).filter((pid) => ctx.posts.find((p) => p.ID === pid)?.post_status === "publish");

  // empreendimentos relacionados: array PHP de IDs do WP -> slugs do clone
  const relRaw = parseMeta(ctx.mv(id, vb ? "vincular_outros_empreendimentos_vb" : "vincular_outros_empreendimentos"));
  const relIds = relRaw && typeof relRaw === "object" ? Object.values(relRaw as Record<string, unknown>).map(String).filter((s) => /^\d+$/.test(s)) : [];
  const relacionadosSlugs = relIds
    .map((rid) => ctx.posts.find((p) => p.ID === rid))
    .filter((p): p is Row => !!p && ["empreendimentos", "vivabenx"].includes(p.post_type ?? ""))
    .map((p) => p.post_name || "")
    .filter(Boolean);

  return {
    nome, slug: post.post_name || "",
    subtitulo: stripHtml(g("subtitulo_slogan_", "subtitulo_slogan_vb")),
    linhaProduto: vb ? "vivabenx" : (VERTENTE[norm(g("linha_do_produto", "linha_do_produto"))] || "benx"),
    categoriaSlug: categoriaDe(id),
    tipoHabitacao: vb ? HABITACAO[habRaw] : undefined,
    statusObra: STATUS[norm(g("status_da_obra_", "status_da_obra_vb"))] || "lancamento",
    previsaoEntrega: txt("previsao_de_entrega", "previsao_de_entrega_vb"),
    oProjeto: g("o_projeto_", "o_projeto_vb"),
    arquitetura: html("arquitetura", "arquitetura_vb"), paisagismo: html("paisagismo_", "paisagismo_vb"), interiores: html("interiores_", "interiores_vb"),
    totalUnidades: intTxt("total_de_unidades_", "total_de_unidades_vb"), totalAndares: intTxt("total_de_andares_", "total_de_andares_vb"),
    unidadesPorAndar: intTxt("unidades_por_andar_", "unidades_por_andar_vb"), numeroTorres: intTxt("_numero_de_torres_", "_numero_de_torres_vb"),
    areaTerreno: areaNum(g("area_do_terreno_", "area_do_terreno_vb")), areaConstruidaTotal: areaNum(g("_area_construida_total_", "_area_construida_total_vb")),
    // legado: metragem real está em "metragem_" (metragem_r costuma vir vazio/errado)
    metragemResidencial: (vb ? ctx.mv(id, "metragem_vb") : (ctx.mv(id, "metragem_") || ctx.mv(id, "metragem_r")))?.trim() ?? "",
    metragemNr: txt("metragem_nr", "metragem_nr"),
    // legado: descrição de dormitórios está em "_residencial"
    quartos: (vb ? ctx.mv(id, "_quartos_vb") : (ctx.mv(id, "_residencial") || ctx.mv(id, "_quartos_")))?.trim() ?? "",
    vagas: txt("vagas_", "vagas_vb"),
    textoLegal: g("texto_legal_do_empreendimento", "texto_legal_do_empreendimento_vb"),
    enderecoParcial: txt("endereco_parcial", "endereco_parcial_vb"), enderecoCompleto: txt("endereco_completo_", "endereco_completo_vb"),
    cep: txt("cep_empreendimento_", "cep_empreendimento_vb"),
    cidadeNome: txt("_cidade_empreendimento-", "_cidade_empreendimento_vb"), cidadeUf: txt("estado_empreendimento", "estado_empreendimento_vb"),
    bairroNome: txt("bairro_empreendimento", "bairro_empreendimento_vb"),
    enderecoVendas: txt("endereco_vendas_", "endereco_vendas_vb"), standDeVendas: txt("stand_de_vendas_", "stand_de_vendas_vb"),
    linkUber: txt("link_uber_", "link_uber_vb"), linkMaps: txt("link_maps_", "link_maps_vb"), linkWaze: txt("link_wase_", "link_wase_vb"),
    urlVideoPrincipal: txt("url_do_video_principal_", "url_do_video_principal_vb"), urlTourVirtual: txt("url_do_tour_virtual", "url_do_tour_virtual_vb"),
    vistasDoAndar: txt("vistas_do_andar_", "vistas_do_andar_vb"),
    obraFundacao: intTxt("fundacao_", "fundacao_vb"), obraAlvenaria: intTxt("alvenaria_", "alvenaria_vb"),
    obraAcabamento: intTxt("acabamento", "acabamento_vb"), obraTotal: intTxt("total_obras", "total_obras_vb"),
    obraDocumentacao: txt("_documentacao_", "_documentacao_vb"), obraAtualizadaEm: txt("data_de_atualizacao_", "data_de_atualizacao_vb"),
    redirecionarPara: txt("redirecionar_pagina_", "redirecionar_pagina_"),
    visivel: norm(ctx.mv(id, vb ? "_status_v_vb" : "_status_v") ?? "true") !== "false",
    exibirObras: bool("exibir_obras_no_site", "exibir_obras_no_site_vb"),
    exibirPlantas: g("exibir_plantas_na_pagina", "exibir_plantas_na_pagina_vb") ? bool("exibir_plantas_na_pagina", "exibir_plantas_na_pagina_vb") : true,
    exibirLocalizacao: g("exibir_localizacao_na_pagina", "exibir_localizacao_na_pagina_vb") ? bool("exibir_localizacao_na_pagina", "exibir_localizacao_na_pagina_vb") : true,
    modoBreveLancamento: bool("ativar_modo_breve_lancamento_", "ativar_modo_breve_lancamento_vb"),
    diferenciais, detalhesLocalizacao, tagsCard, areasNomeadas, certificacoes, relacionadosSlugs,
    imagemPrincipalAtt: (g("img_principal_produto", "img_principal_produto_vb") || ctx.mv(id, "_thumbnail_id")) || null,
    logotipoAtt: ctx.mv(id, "logotipo_do_empreendimento_vb"),
    thumbnailVideoAtt: g("thumbnail_do_video_1", "thumbnail_do_video__vb") || null,
    fachadaAtts: split(g("imagens_da_fachada_", "imagens_da_fachada_vb")),
    obraAtts: split(g("_galeria_de_imagens_obras_", "_galeria_de_imagens_obras_vb")),
    areasGalAtts: split(g("imagens_areas_comuns_", "imagens_areas_comuns_vb")),
    plantaIds,
  };
}

export function mapearPlanta(ctx: Ctx, pid: string, empNome: string): MapPlanta | null {
  const post = ctx.posts.find((p) => p.ID === pid);
  if (!post || post.post_status !== "publish") return null;
  const titulo = post.post_title ?? "";
  let nome = titulo;
  if (nome.toLowerCase().startsWith(empNome.toLowerCase())) nome = nome.slice(empNome.length).replace(/^\s*[|\-–—]\s*/, "").trim() || titulo;
  const recursos = repeater(ctx.mv(pid, "lista_recursos_planta") ?? ctx.mv(pid, "lista_recursos_planta_vivabenx"))
    .map((it) => String(Object.values(it).find((v) => typeof v === "string" && v.trim()) ?? "")).filter(Boolean);
  return {
    nome,
    metragem: areaNum(numFromTitle(titulo, /(\d+(?:[.,]\d+)?)\s*m/i)),
    dormitorios: numFromTitle(titulo, /(\d+)\s*(?:dorm|quarto)/i),
    suites: numFromTitle(titulo, /(\d+)\s*su[ií]te/i),
    vagas: numFromTitle(titulo, /(\d+)\s*vaga/i),
    recursos,
    thumbAtt: ctx.mv(pid, "_thumbnail_id"),
  };
}

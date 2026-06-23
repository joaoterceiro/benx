import { z } from "zod";

// Coerções tolerantes a campos vazios vindos de inputs HTML.
const intOpt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
  z.number().int().optional()
);
const pct = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
  z.number().int().min(0).max(100).optional()
);
const strOpt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : String(v)),
  z.string().optional()
);

const certificacao = z.object({
  nome: z.string().min(1),
  imagem: z.string().optional(),
});
const detalheLocalizacao = z.object({
  titulo: z.string().min(1),
  distancia: z.string().optional(),
  imagem: z.string().optional(),
});
const areaComum = z.object({
  nome: z.string().min(1),
  descricao: z.string().optional(),
  imagem: z.string().optional(),
});

// Schema de entrada do cadastro (JSON-serializável). Imagens entram como
// CHAVES do MinIO (resolvidas previamente via uploadImagem).
export const empreendimentoInputSchema = z.object({
  // Básico
  nome: z.string().min(2, "Informe o nome do empreendimento"),
  slug: z.string().min(2),
  subtitulo: strOpt,
  // vertente obrigatória (filtro de primeiro nível)
  linhaProduto: z.enum(["benx_iconicos", "benx", "vivabenx"], {
    message: "Selecione a vertente",
  }),
  // Texto livre: o admin pode cadastrar novos valores no formulário.
  tipoHabitacao: strOpt,
  statusObra: z.preprocess(
    (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : "lancamento"),
    z.string().min(1)
  ),
  previsaoEntrega: strOpt,
  categoriaSlug: strOpt,

  // Projeto
  oProjeto: strOpt,
  arquitetura: strOpt,
  paisagismo: strOpt,
  interiores: strOpt,

  // Características
  totalUnidades: intOpt,
  totalAndares: intOpt,
  unidadesPorAndar: intOpt,
  numeroTorres: intOpt,
  areaTerreno: strOpt,
  areaConstruidaTotal: strOpt,
  metragemResidencial: strOpt,
  metragemNr: strOpt,
  quartos: strOpt,
  vagas: strOpt,
  textoLegal: strOpt,

  // Localização (cidade/bairro por nome: resolve-or-create)
  enderecoParcial: strOpt,
  enderecoCompleto: strOpt,
  cep: strOpt,
  cidadeNome: strOpt,
  cidadeUf: strOpt,
  bairroNome: strOpt,
  enderecoVendas: strOpt,
  standDeVendas: strOpt,
  linkUber: strOpt,
  linkMaps: strOpt,
  linkWaze: strOpt,

  // Mídia destaque (chaves MinIO ou URLs de vídeo)
  imagemPrincipal: strOpt,
  logotipo: strOpt,
  urlVideoPrincipal: strOpt,
  thumbnailVideo: strOpt,
  urlTourVirtual: strOpt,
  vistasDoAndar: strOpt,

  // Obra
  obraFundacao: pct,
  obraAlvenaria: pct,
  obraAcabamento: pct,
  obraTotal: pct,
  obraDocumentacao: strOpt,
  obraAtualizadaEm: strOpt,
  redirecionarPara: strOpt,
  seoTitulo: strOpt,
  seoDescricao: strOpt,

  // Visibilidade
  visivel: z.boolean().default(true),
  exibirObras: z.boolean().default(false),
  exibirPlantas: z.boolean().default(true),
  exibirLocalizacao: z.boolean().default(true),
  modoBreveLancamento: z.boolean().default(false),

  // Repetíveis (JSONB)
  diferenciais: z.array(z.string()).default([]),
  areasComuns: z.array(areaComum).default([]),
  certificacoes: z.array(certificacao).default([]),
  detalhesLocalizacao: z.array(detalheLocalizacao).default([]),
  tagsCard: z.array(z.string()).default([]),
  relacionados: z.array(z.string()).default([]),
});

export type EmpreendimentoInput = z.input<typeof empreendimentoInputSchema>;
export type EmpreendimentoParsed = z.output<typeof empreendimentoInputSchema>;

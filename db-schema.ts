import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
  jsonb,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums (vocabulários fechados extraídos do JetEngine) ───────────────
// Status da obra normalizado (o WP tinha duplicatas: "na planta",
// "Pronto para Morar" vs "Pronto para morar", etc).
export const statusObraEnum = pgEnum("status_obra", [
  "lancamento",
  "em_construcao",
  "pronto_para_morar",
  "entregue",
]);

export const tipoHabitacaoEnum = pgEnum("tipo_habitacao", [
  "his",
  "hmp",
  "his_e_hmp",
]);

export const tipoMidiaEnum = pgEnum("tipo_midia", [
  "imagem",
  "video",
  "planta",
  "fachada",
  "area_comum",
  "obra",
]);

// ── Taxonomias (filtros da property search) ────────────────────────────
// Modeladas como tabelas de lookup. A busca filtra por estas dimensões.
export const cidades = pgTable("cidades", {
  id: uuid("id").defaultRandom().primaryKey(),
  nome: text("nome").notNull(),
  estado: text("estado").notNull(), // UF
  slug: text("slug").notNull().unique(),
});

export const bairros = pgTable("bairros", {
  id: uuid("id").defaultRandom().primaryKey(),
  nome: text("nome").notNull(),
  slug: text("slug").notNull().unique(),
  cidadeId: uuid("cidade_id").references(() => cidades.id),
});

export const categorias = pgTable("categorias", {
  id: uuid("id").defaultRandom().primaryKey(),
  nome: text("nome").notNull(),
  slug: text("slug").notNull().unique(),
});

export const linhasProduto = pgTable("linhas_produto", {
  id: uuid("id").defaultRandom().primaryKey(),
  nome: text("nome").notNull(),
  slug: text("slug").notNull().unique(),
});

// ── Empreendimento (entidade central) ──────────────────────────────────
export const empreendimentos = pgTable("empreendimentos", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  nome: text("nome").notNull(),
  subtitulo: text("subtitulo"),
  tipoHabitacao: tipoHabitacaoEnum("tipo_habitacao"),
  statusObra: statusObraEnum("status_obra").notNull().default("lancamento"),
  previsaoEntrega: date("previsao_entrega"),

  // Projeto
  oProjeto: text("o_projeto"),
  arquitetura: text("arquitetura"),
  paisagismo: text("paisagismo"),
  interiores: text("interiores"),

  // Características
  totalUnidades: integer("total_unidades"),
  totalAndares: integer("total_andares"),
  unidadesPorAndar: integer("unidades_por_andar"),
  numeroTorres: integer("numero_torres"),
  areaTerreno: numeric("area_terreno"),
  areaConstruidaTotal: numeric("area_construida_total"),
  metragemResidencial: text("metragem_residencial"),
  metragemNr: text("metragem_nr"),
  quartos: text("quartos"),
  vagas: text("vagas"),
  textoLegal: text("texto_legal"),

  // Localização
  enderecoParcial: text("endereco_parcial"),
  enderecoCompleto: text("endereco_completo"),
  cep: text("cep"),
  enderecoVendas: text("endereco_vendas"),
  standDeVendas: text("stand_de_vendas"),
  linkUber: text("link_uber"),
  linkMaps: text("link_maps"),
  linkWaze: text("link_waze"),

  // Mídia destaque
  imagemPrincipal: text("imagem_principal"), // chave no MinIO
  logotipo: text("logotipo"),
  urlVideoPrincipal: text("url_video_principal"),
  thumbnailVideo: text("thumbnail_video"),
  urlTourVirtual: text("url_tour_virtual"),
  vistasDoAndar: text("vistas_do_andar"),

  // Status da obra (multi-etapa, percentuais 0-100)
  obraFundacao: integer("obra_fundacao"),
  obraAlvenaria: integer("obra_alvenaria"),
  obraAcabamento: integer("obra_acabamento"),
  obraTotal: integer("obra_total"),
  obraAtualizadaEm: date("obra_atualizada_em"),

  // Switchers de visibilidade (respeitar na renderização)
  visivel: boolean("visivel").notNull().default(true),
  exibirObras: boolean("exibir_obras").notNull().default(false),
  exibirPlantas: boolean("exibir_plantas").notNull().default(true),
  exibirLocalizacao: boolean("exibir_localizacao").notNull().default(true),
  modoBreveLancamento: boolean("modo_breve_lancamento").notNull().default(false),

  // Conteúdo repetível, guardado como JSONB (diferenciais, áreas comuns,
  // certificações, detalhes de localização, tags de card). Estrutura leve.
  diferenciais: jsonb("diferenciais").$type<string[]>().default([]),
  areasComuns: jsonb("areas_comuns").$type<string[]>().default([]),
  certificacoes: jsonb("certificacoes").$type<{ nome: string; imagem?: string }[]>().default([]),
  detalhesLocalizacao: jsonb("detalhes_localizacao").$type<{ titulo: string; distancia?: string }[]>().default([]),
  tagsCard: jsonb("tags_card").$type<string[]>().default([]),

  // FKs de taxonomia
  cidadeId: uuid("cidade_id").references(() => cidades.id),
  bairroId: uuid("bairro_id").references(() => bairros.id),
  categoriaId: uuid("categoria_id").references(() => categorias.id),
  linhaProdutoId: uuid("linha_produto_id").references(() => linhasProduto.id),

  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow(),
});

// ── Planta (unidade / tipologia) ────────────────────────────────────────
export const plantas = pgTable("plantas", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  nome: text("nome").notNull(),
  metragem: numeric("metragem"),
  dormitorios: integer("dormitorios"),
  suites: integer("suites"),
  vagas: integer("vagas"),
  imagemPlanta: text("imagem_planta"), // chave no MinIO
  recursos: jsonb("recursos").$type<string[]>().default([]), // "lista de recursos" (repeater)
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

// ── Junção N:N empreendimento <-> planta ────────────────────────────────
export const empreendimentoPlanta = pgTable(
  "empreendimento_planta",
  {
    empreendimentoId: uuid("empreendimento_id")
      .notNull()
      .references(() => empreendimentos.id, { onDelete: "cascade" }),
    plantaId: uuid("planta_id")
      .notNull()
      .references(() => plantas.id, { onDelete: "cascade" }),
  },
  (t) => ({ pk: primaryKey({ columns: [t.empreendimentoId, t.plantaId] }) })
);

// ── Mídia (sempre referenciando o MinIO por chave) ──────────────────────
export const midias = pgTable("midias", {
  id: uuid("id").defaultRandom().primaryKey(),
  empreendimentoId: uuid("empreendimento_id").references(() => empreendimentos.id, {
    onDelete: "cascade",
  }),
  chave: text("chave").notNull(), // path no bucket benx-midia
  alt: text("alt"),
  tipo: tipoMidiaEnum("tipo").notNull().default("imagem"),
  ordem: integer("ordem").notNull().default(0),
});

// ── Drizzle relations (para queries com joins tipados) ──────────────────
export const empreendimentosRelations = relations(empreendimentos, ({ one, many }) => ({
  cidade: one(cidades, { fields: [empreendimentos.cidadeId], references: [cidades.id] }),
  bairro: one(bairros, { fields: [empreendimentos.bairroId], references: [bairros.id] }),
  categoria: one(categorias, { fields: [empreendimentos.categoriaId], references: [categorias.id] }),
  linhaProduto: one(linhasProduto, { fields: [empreendimentos.linhaProdutoId], references: [linhasProduto.id] }),
  midias: many(midias),
  plantas: many(empreendimentoPlanta),
}));

export const plantasRelations = relations(plantas, ({ many }) => ({
  empreendimentos: many(empreendimentoPlanta),
}));

export const empreendimentoPlantaRelations = relations(empreendimentoPlanta, ({ one }) => ({
  empreendimento: one(empreendimentos, {
    fields: [empreendimentoPlanta.empreendimentoId],
    references: [empreendimentos.id],
  }),
  planta: one(plantas, {
    fields: [empreendimentoPlanta.plantaId],
    references: [plantas.id],
  }),
}));

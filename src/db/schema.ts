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
// status_obra e tipo_habitacao são texto livre: o admin pode cadastrar novos
// valores direto no formulário. Os valores base abaixo servem de sugestão na UI
// e de chave para os rótulos legíveis em src/lib/labels.ts.
export const STATUS_OBRA_BASE = [
  "lancamento",
  "em_construcao",
  "pronto_para_morar",
  "entregue",
] as const;
export const TIPO_HABITACAO_BASE = ["his", "his_2", "hmp", "his_e_hmp"] as const;

export const tipoMidiaEnum = pgEnum("tipo_midia", [
  "imagem",
  "video",
  "planta",
  "fachada",
  "area_comum",
  "obra",
]);

// Funil de leads (vocabulário do protótipo admin).
export const statusLeadEnum = pgEnum("status_lead", [
  "novo",
  "em_contato",
  "qualificado",
  "convertido",
  "perdido",
]);

// Papéis de acesso ao admin.
export const papelEnum = pgEnum("papel", ["admin", "editor"]);

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

// Linhas de produto (vertentes). A config em src/lib/ecossistema é a fonte
// única de verdade; esta tabela é semeada a partir dela (ver src/db/seed.ts).
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
  tipoHabitacao: text("tipo_habitacao"),
  statusObra: text("status_obra").notNull().default("lancamento"),
  previsaoEntrega: date("previsao_entrega"),
  ordemHome: integer("ordem_home").notNull().default(0), // posição na faixa da home (menor = primeiro)

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
  obraDocumentacao: text("obra_documentacao"),
  obraAtualizadaEm: date("obra_atualizada_em"),

  // Redirecionamento opcional da página pública (legado JetEngine)
  redirecionarPara: text("redirecionar_para"),

  // SEO (fallback: nome / subtitulo)
  seoTitulo: text("seo_titulo"),
  seoDescricao: text("seo_descricao"),

  // Switchers de visibilidade (respeitar na renderização)
  visivel: boolean("visivel").notNull().default(true),
  exibirObras: boolean("exibir_obras").notNull().default(false),
  exibirPlantas: boolean("exibir_plantas").notNull().default(true),
  exibirLocalizacao: boolean("exibir_localizacao").notNull().default(true),
  modoBreveLancamento: boolean("modo_breve_lancamento").notNull().default(false),

  // Conteúdo repetível, guardado como JSONB (diferenciais, áreas comuns,
  // certificações, detalhes de localização, tags de card). Estrutura leve.
  diferenciais: jsonb("diferenciais").$type<string[]>().default([]),
  areasComuns: jsonb("areas_comuns")
    .$type<{ nome: string; descricao?: string; imagem?: string }[]>()
    .default([]),
  certificacoes: jsonb("certificacoes").$type<{ nome: string; imagem?: string }[]>().default([]),
  detalhesLocalizacao: jsonb("detalhes_localizacao").$type<{ titulo: string; distancia?: string; imagem?: string }[]>().default([]),
  tagsCard: jsonb("tags_card").$type<string[]>().default([]),
  // Empreendimentos relacionados (slugs de outros empreendimentos).
  relacionados: jsonb("relacionados").$type<string[]>().default([]),

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

// ── Leads (captação no site público, gestão no admin) ───────────────────
export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  empreendimentoId: uuid("empreendimento_id").references(() => empreendimentos.id, {
    onDelete: "set null",
  }),
  nome: text("nome").notNull(),
  email: text("email"),
  telefone: text("telefone"),
  mensagem: text("mensagem"),
  origem: text("origem"), // ex.: slug do empreendimento ou "portal"
  // LGPD: consentimento explícito no ponto de coleta.
  consentimento: boolean("consentimento").notNull().default(false),
  consentimentoEm: timestamp("consentimento_em"),
  status: statusLeadEnum("status").notNull().default("novo"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

// ── Registro de consentimento de cookies (LGPD: prova do consentimento) ──
export const consentimentos = pgTable("consentimentos", {
  id: uuid("id").defaultRandom().primaryKey(),
  versao: text("versao").notNull(), // versão da política aceita
  necessarios: boolean("necessarios").notNull().default(true),
  analiticos: boolean("analiticos").notNull().default(false),
  marketing: boolean("marketing").notNull().default(false),
  acao: text("acao").notNull(), // aceitar_todos | recusar | personalizado
  userAgent: text("user_agent"),
  ip: text("ip"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

// ── Itens do menu overlay (gerenciados no admin) ────────────────────────
export const menuItens = pgTable("menu_itens", {
  id: uuid("id").defaultRandom().primaryKey(),
  texto: text("texto").notNull(),
  url: text("url").notNull(),
  ordem: integer("ordem").notNull().default(0),
  parentId: uuid("parent_id"),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

// ── Configurações do site (key-value, editável no admin) ────────────────
export const configuracoes = pgTable("configuracoes", {
  chave: text("chave").primaryKey(),
  valor: text("valor"),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow(),
});

// ── Usuários e sessões (auth do admin, self-hosted) ─────────────────────
export const usuarios = pgTable("usuarios", {
  id: uuid("id").defaultRandom().primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  senhaHash: text("senha_hash").notNull(),
  papel: papelEnum("papel").notNull().default("editor"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const sessoes = pgTable("sessoes", {
  // token de sessão (random, é o segredo guardado no cookie httpOnly)
  token: text("token").primaryKey(),
  usuarioId: uuid("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  expiraEm: timestamp("expira_em").notNull(),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

// ── Benx Jornal (blog / clipping de notícias) ──────────────────────────
export const postsJornal = pgTable("posts_jornal", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  titulo: text("titulo").notNull(),
  categoria: text("categoria").notNull().default("Sem categoria"),
  fonte: text("fonte"),            // veículo de origem (ex.: "O Estado de S. Paulo")
  fonteUrl: text("fonte_url"),     // link para o artigo na íntegra
  resumo: text("resumo"),          // chamada / destaque
  conteudo: text("conteudo"),      // corpo do post
  imagem: text("imagem"),          // chave no MinIO
  seoTitulo: text("seo_titulo"),   // <title> / og:title (fallback: titulo)
  seoDescricao: text("seo_descricao"), // meta description (fallback: resumo)
  dataPublicacao: timestamp("data_publicacao").notNull().defaultNow(),
  destaque: boolean("destaque").notNull().default(false), // post em destaque no topo
  publicado: boolean("publicado").notNull().default(true),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow(),
});

// ── Hero Slider (slides do topo das homes de cada vertente) ─────────────
export const heroSlides = pgTable("hero_slides", {
  id: uuid("id").defaultRandom().primaryKey(),
  // vertentes onde o slide aparece: ["benx_iconicos","benx","vivabenx"]
  locais: jsonb("locais").$type<string[]>().notNull().default([]),
  titulo: text("titulo").notNull(),
  imagem: text("imagem"),                   // chave no MinIO
  videoUrl: text("video_url"),              // opcional: vídeo de fundo (chave ou URL)
  link: text("link"),                       // destino do botão
  botaoTexto: text("botao_texto"),          // default "Conheça"
  tags: jsonb("tags").$type<string[]>().default([]),
  ordem: integer("ordem").notNull().default(0),
  duracao: integer("duracao").notNull().default(6), // segundos que o slide fica visível
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow(),
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

export const midiasRelations = relations(midias, ({ one }) => ({
  empreendimento: one(empreendimentos, {
    fields: [midias.empreendimentoId],
    references: [empreendimentos.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  empreendimento: one(empreendimentos, {
    fields: [leads.empreendimentoId],
    references: [empreendimentos.id],
  }),
}));

export const sessoesRelations = relations(sessoes, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [sessoes.usuarioId],
    references: [usuarios.id],
  }),
}));

export const bairrosRelations = relations(bairros, ({ one }) => ({
  cidade: one(cidades, { fields: [bairros.cidadeId], references: [cidades.id] }),
}));

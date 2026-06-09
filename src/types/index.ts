// ════════════════════════════════════════════════════════════════════════
// Contrato de tipos do domínio. Derivado do schema Drizzle por inferência.
// Ninguém cria tipo solto: importar daqui (@/types).
// ════════════════════════════════════════════════════════════════════════
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type * as schema from "@/db/schema";

export type Empreendimento = InferSelectModel<typeof schema.empreendimentos>;
export type NovoEmpreendimento = InferInsertModel<typeof schema.empreendimentos>;

export type Planta = InferSelectModel<typeof schema.plantas>;
export type NovaPlanta = InferInsertModel<typeof schema.plantas>;

export type Midia = InferSelectModel<typeof schema.midias>;
export type NovaMidia = InferInsertModel<typeof schema.midias>;

export type Usuario = InferSelectModel<typeof schema.usuarios>;
export type Papel = Usuario["papel"];

export type Lead = InferSelectModel<typeof schema.leads>;
export type NovoLead = InferInsertModel<typeof schema.leads>;
export type StatusLead = Lead["status"];

export type Cidade = InferSelectModel<typeof schema.cidades>;
export type Bairro = InferSelectModel<typeof schema.bairros>;
export type Categoria = InferSelectModel<typeof schema.categorias>;
export type LinhaProduto = InferSelectModel<typeof schema.linhasProduto>;

export type PostJornal = InferSelectModel<typeof schema.postsJornal>;
export type NovoPostJornal = InferInsertModel<typeof schema.postsJornal>;

export type HeroSlide = InferSelectModel<typeof schema.heroSlides>;
export type NovoHeroSlide = InferInsertModel<typeof schema.heroSlides>;

// statusObra e tipoHabitacao são texto livre (o admin cadastra novos valores no
// formulário): derivam como string. tipoMidia continua pgEnum.
export type StatusObra = Empreendimento["statusObra"];
export type TipoHabitacao = NonNullable<Empreendimento["tipoHabitacao"]>;
export type TipoMidia = Midia["tipo"];

// Modelo de leitura com relações resolvidas (usado nas queries/páginas).
export type EmpreendimentoComRelacoes = Empreendimento & {
  cidade: Cidade | null;
  bairro: Bairro | null;
  categoria: Categoria | null;
  linhaProduto: LinhaProduto | null;
  midias: Midia[];
};

// Re-export da config de ecossistema para quem importa só de @/types.
export type { Vertente, VertenteValue } from "@/lib/ecossistema";

import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { configuracoes } from "@/db/schema";
import { getUrl } from "@/lib/storage";
import { logger } from "@/lib/logger";

const CHAVE = "mentes_arquitetos";

// Guardado como config JSON. `imagem` pode ser chave MinIO (upload), path local
// (/...) ou URL externa. O público resolve para URL (`foto`).
export interface ArquitetoConfig {
  nome: string;
  descricao: string;
  projeto: string;
  imagem: string;
}

// Shape consumido pelo componente público (imagem já resolvida).
export interface Arquiteto {
  nome: string;
  descricao: string;
  projeto: string;
  foto: string;
}

export const ARQUITETOS_DEFAULT: ArquitetoConfig[] = [
  {
    nome: "Jacobsen Arquitetura",
    descricao:
      "A Jacobsen Arquitetura é um escritório internacional de arquitetura que nasceu no Rio de Janeiro e possui mais de quarenta anos de atuação. Como premissa e metodologia, desenvolve seus projetos buscando a integração entre o ambiente construído e seu contexto natural. Não parte de formas pré-concebidas, mas explora soluções derivadas do diálogo estabelecido entre arquitetura e natureza, considerando a contribuição ativa dos anseios de seus clientes. Explora possibilidades de uso de materiais naturais, interpretando os conceitos de transparência, leveza e fluidez, de modo a constituir uma linguagem estética contemporânea. Com atuação internacional, o escritório possui sedes em São Paulo, Rio de Janeiro e Lisboa.",
    projeto: "Projetista de Arquitetura do empreendimento Arbórea Vista Jardim Europa",
    imagem: "/mentes/arq-1.jpg",
  },
  {
    nome: "Lissoni & Partners",
    descricao:
      "A Lissoni & Partners é um estúdio de arquitetura e design liderado pelo arquiteto italiano Piero Lissoni. Com escritórios em Milão e Nova York, o estúdio desenvolve projetos em diversas áreas, como arquitetura, paisagismo, design de interiores, design de produtos e design gráfico, além de atuar como diretor de arte de diversas empresas renomadas.\n\nPiero Lissoni é reconhecido como um dos mestres do design contemporâneo, com mais de 30 anos de experiência e projetos em todo o mundo. O estúdio se destaca por sua abordagem personalizada, rigor, simplicidade, atenção aos detalhes, coerência e elegância em seus projetos.\n\nAlém de seus projetos de arquitetura e design, Piero Lissoni atua como diretor de arte de empresas como Alpi, Boffi, Living Divani, Lualdi, Porro e Sanlorenzo, para as quais também desenha produtos.",
    projeto: "Projetista de Design de Interiores do empreendimento Arbórea Itaim",
    imagem: "/mentes/arq-2.jpg",
  },
  {
    nome: "Gensler + Zien",
    descricao:
      "Fundada em 1965, a Gensler lidera o ranking das 300 maiores firmas de arquitetura dos Estados Unidos há mais de 10 anos consecutivos. Presente em 53 locais e com mais de 7.000 profissionais conectados pelas Américas, pela Europa, pela China, pela Ásia e pelo Oriente Médio, a empresa trabalha globalmente para atender aos seus 4.000 clientes em mais de 29 áreas de atuação, abrangendo residências, comércios, comunidade e setores da saúde.",
    projeto: "Projetistas de Arquitetura do empreendimento 280 Art Boulevard",
    imagem: "/mentes/arq-3.jpg",
  },
  {
    nome: "Triptyque Architecture",
    descricao:
      "A Triptyque é uma agência franco-brasileira de arquitetura e urbanismo, fundada em São Paulo, em 2000, e em Paris, em 2008. Reconhecida por sua abordagem naturalista e racionalista, atua em projetos públicos e privados nos segmentos residencial, corporativo, educacional, hoteleiro, de saúde e pesquisa.\n\nCom presença internacional, participou de importantes bienais e exposições, tendo modelos de seus projetos integrados às coleções do Centro Pompidou, em Paris, e do Museu Guggenheim, em Nova York. Seu trabalho recebeu prêmios internacionais e é publicado em diversos países, refletindo inovação e sensibilidade estética.",
    projeto: "Projetista de Arquitetura do empreendimento J329",
    imagem: "/mentes/arq-4.jpg",
  },
  {
    nome: "Enea Landscape",
    descricao:
      "Enzo Enea é um dos principais nomes do paisagismo mundial, com mais de 1.000 projetos realizados para hotéis, SPAs e museus ao redor do mundo, atendendo clientes como a Rainha do Bahrein e o Príncipe Charles. À frente do renomado escritório Enea GmbH, na Suíça, é reconhecido por integrar arquitetura, arte e natureza de forma singular, além de ser o criador do Enea Tree Museum, em Zurique.",
    projeto: "Projetista de Paisagismo do empreendimento Parque Global",
    imagem: "/mentes/arq-5.jpg",
  },
];

function ehChaveMinio(v: string): boolean {
  return !!v && !v.startsWith("/") && !/^https?:\/\//i.test(v) && !v.startsWith("data:");
}

function normalizar(a: Partial<ArquitetoConfig>): ArquitetoConfig {
  return {
    nome: (a?.nome ?? "").toString(),
    descricao: (a?.descricao ?? "").toString(),
    projeto: (a?.projeto ?? "").toString(),
    imagem: (a?.imagem ?? "").toString(),
  };
}

export async function lerArquitetos(): Promise<ArquitetoConfig[]> {
  try {
    const [row] = await db
      .select({ valor: configuracoes.valor })
      .from(configuracoes)
      .where(eq(configuracoes.chave, CHAVE))
      .limit(1);
    if (row?.valor) {
      const parsed = JSON.parse(row.valor);
      if (Array.isArray(parsed)) return parsed.map(normalizar);
    }
  } catch (err) {
    logger.warn({ err, action: "ler_arquitetos" }, "usando arquitetos padrão");
  }
  return ARQUITETOS_DEFAULT;
}

export async function resolverImagemArquiteto(v: string): Promise<string> {
  if (!v) return "";
  return ehChaveMinio(v) ? getUrl(v) : v;
}

export async function lerArquitetosResolvidos(): Promise<Arquiteto[]> {
  const lista = await lerArquitetos();
  return Promise.all(
    lista.map(async (a) => ({
      nome: a.nome,
      descricao: a.descricao,
      projeto: a.projeto,
      foto: await resolverImagemArquiteto(a.imagem),
    }))
  );
}

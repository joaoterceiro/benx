import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { Reveal } from "@/components/public/reveal";
import { Carrossel } from "@/components/public/produto/interativos";
import { ArquitetosLista, type Arquiteto } from "@/components/public/mentes/arquitetos-lista";

export const metadata: Metadata = {
  title: "Arquitetos que inspiram",
  description:
    "Arquitetos que inspiram. Conheça os arquitetos, designers e paisagistas por trás dos empreendimentos Benx: Jacobsen, Lissoni & Partners, Gensler, Triptyque e Enea.",
};

const NAVY = "#0a2a66";
const COL = "mx-auto w-full max-w-site px-6";

const PROJETOS = [1, 2, 3, 4, 5, 6].map((n) => `/mentes/proj-${n}.jpg`);

const ARQUITETOS: Arquiteto[] = [
  {
    nome: "Jacobsen\nArquitetura",
    descricao:
      "A Jacobsen Arquitetura é um escritório internacional de arquitetura que nasceu no Rio de Janeiro e possui mais de quarenta anos de atuação. Como premissa e metodologia, desenvolve seus projetos buscando a integração entre o ambiente construído e seu contexto natural. Não parte de formas pré-concebidas, mas explora soluções derivadas do diálogo estabelecido entre arquitetura e natureza, considerando a contribuição ativa dos anseios de seus clientes. Explora possibilidades de uso de materiais naturais, interpretando os conceitos de transparência, leveza e fluidez, de modo a constituir uma linguagem estética contemporânea. Com atuação internacional, o escritório possui sedes em São Paulo, Rio de Janeiro e Lisboa.",
    projeto: "Projetista de Arquitetura do empreendimento Arbórea Vista Jardim Europa",
    foto: "/mentes/arq-1.jpg",
  },
  {
    nome: "Lissoni & Partners",
    descricao:
      "A Lissoni & Partners é um estúdio de arquitetura e design liderado pelo arquiteto italiano Piero Lissoni. Com escritórios em Milão e Nova York, o estúdio desenvolve projetos em diversas áreas, como arquitetura, paisagismo, design de interiores, design de produtos e design gráfico, além de atuar como diretor de arte de diversas empresas renomadas.\n\nPiero Lissoni é reconhecido como um dos mestres do design contemporâneo, com mais de 30 anos de experiência e projetos em todo o mundo. O estúdio se destaca por sua abordagem personalizada, rigor, simplicidade, atenção aos detalhes, coerência e elegância em seus projetos.\n\nAlém de seus projetos de arquitetura e design, Piero Lissoni atua como diretor de arte de empresas como Alpi, Boffi, Living Divani, Lualdi, Porro e Sanlorenzo, para as quais também desenha produtos.",
    projeto: "Projetista de Design de Interiores do empreendimento Arbórea Itaim",
    foto: "/mentes/arq-2.jpg",
  },
  {
    nome: "Gensler + Zien",
    descricao:
      "Fundada em 1965, a Gensler lidera o ranking das 300 maiores firmas de arquitetura dos Estados Unidos há mais de 10 anos consecutivos. Presente em 53 locais e com mais de 7.000 profissionais conectados pelas Américas, pela Europa, pela China, pela Ásia e pelo Oriente Médio, a empresa trabalha globalmente para atender aos seus 4.000 clientes em mais de 29 áreas de atuação, abrangendo residências, comércios, comunidade e setores da saúde.",
    projeto: "Projetistas de Arquitetura do empreendimento 280 Art Boulevard",
    foto: "/mentes/arq-3.jpg",
  },
  {
    nome: "Triptyque Architecture",
    descricao:
      "A Triptyque é uma agência franco-brasileira de arquitetura e urbanismo, fundada em São Paulo, em 2000, e em Paris, em 2008. Reconhecida por sua abordagem naturalista e racionalista, atua em projetos públicos e privados nos segmentos residencial, corporativo, educacional, hoteleiro, de saúde e pesquisa.\n\nCom presença internacional, participou de importantes bienais e exposições, tendo modelos de seus projetos integrados às coleções do Centro Pompidou, em Paris, e do Museu Guggenheim, em Nova York. Seu trabalho recebeu prêmios internacionais e é publicado em diversos países, refletindo inovação e sensibilidade estética.",
    projeto: "Projetista de Arquitetura do empreendimento J329",
    foto: "/mentes/arq-4.jpg",
  },
  {
    nome: "Enea Landscape",
    descricao:
      "Enzo Enea é um dos principais nomes do paisagismo mundial, com mais de 1.000 projetos realizados para hotéis, SPAs e museus ao redor do mundo, atendendo clientes como a Rainha do Bahrein e o Príncipe Charles. À frente do renomado escritório Enea GmbH, na Suíça, é reconhecido por integrar arquitetura, arte e natureza de forma singular, além de ser o criador do Enea Tree Museum, em Zurique.",
    projeto: "Projetista de Paisagismo do empreendimento Parque Global",
    foto: "/mentes/arq-5.jpg",
  },
];

export default function MentesCriativasPage() {
  return (
    <div className="bg-white text-[#1a2230]">
      {/* HERO */}
      <header className="relative flex h-[62vh] min-h-[440px] flex-col justify-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mentes/hero.jpg" alt="Arquitetos que inspiram" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />

        <SiteHeader />

        <div className={`relative z-10 ${COL} pb-10 text-right`}>
          <h1 className="ml-auto text-[44px] font-light leading-[1.05] tracking-tight text-white sm:text-[68px]">
            Arquitetos<br />que inspiram
          </h1>
        </div>
      </header>

      {/* INSPIRAÇÃO */}
      <section className={COL}>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative z-20 lg:-mt-48">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mentes/inspiracao.jpg" alt="Inspiração na vanguarda" className="aspect-[3/4] w-full object-cover" />
          </div>
          <div className="pb-16 pt-10 lg:pt-16">
            <Reveal>
              <p className="text-[15px] leading-relaxed text-[#5a6577]">
                Na Benx, cada empreendimento começa com uma escolha que vai além da técnica: a escolha de quem assina. Acreditamos que grandes projetos nascem de mentes inquietas, que pensam a cidade com sensibilidade, ousadia e responsabilidade.
              </p>
              <h2 className="mt-10 text-[34px] font-light leading-[1.1] tracking-tight sm:text-[44px]" style={{ color: NAVY }}>
                Inspiração<br />na vanguarda
              </h2>
              <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-[#5a6577]">
                <p>Por isso, reunimos arquitetos, designers e paisagistas que nos inspiram, profissionais que compartilham da nossa visão de futuro e transformam cada espaço em uma experiência única. São nomes que não apenas projetam, mas contam histórias através da forma, da luz, da função e do entorno.</p>
                <p>Essa curadoria cuidadosa reflete o nosso compromisso com a excelência, a originalidade e o impacto positivo. Para nós, construir é também emocionar, e quem assina conosco precisa acreditar no poder de inspirar através da arquitetura.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PROJETOS COM ASSINATURA */}
      <section className={`${COL} py-12`}>
        <Reveal>
          <div className="grid items-center gap-6 sm:grid-cols-2">
            <h2 className="text-[34px] font-light leading-[1.05] tracking-tight sm:text-[46px]" style={{ color: NAVY }}>
              Projetos<br />com assinatura
            </h2>
            <p className="text-[20px] font-light leading-snug sm:text-[24px]" style={{ color: NAVY }}>
              <span className="font-semibold">Visão, autoria</span> e<br /><span className="font-semibold">propósito</span> em cada traço
            </p>
          </div>
          <div className="mt-10">
            <Carrossel autoplay intervalMs={3500}>
              {PROJETOS.map((src, i) => (
                <div key={i} className="aspect-[3/4] w-[72%] shrink-0 snap-start overflow-hidden sm:w-[31%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Projeto ${i + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </Carrossel>
          </div>
        </Reveal>
      </section>

      {/* ARQUITETOS */}
      <section className={`${COL} py-12 pb-24`}>
        <Reveal>
          <ArquitetosLista arquitetos={ARQUITETOS} />
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}

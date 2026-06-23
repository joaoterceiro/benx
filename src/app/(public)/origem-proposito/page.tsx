import type { Metadata } from "next";
import Link from "next/link";
import { BuscaTrigger } from "@/components/public/busca-glass";
import { MenuTrigger } from "@/components/public/menu-overlay";
import { SiteFooter } from "@/components/public/site-footer";
import { Reveal } from "@/components/public/reveal";
import { LinhaTempo, type MarcoTempo } from "@/components/public/origem/linha-tempo";
import { PremiosCarrossel } from "@/components/public/origem/premios-carrossel";

export const metadata: Metadata = {
  title: "Origem e Propósito",
  description:
    "Da Bueno Netto à Benx: 50 anos de legado e visão transformadora. Conheça a história, o propósito e os prêmios que construíram nossa referência no mercado imobiliário.",
};

const NAVY = "#0a2a66";
const COL = "mx-auto w-full max-w-site px-6";

const AERIAL = "/origem/image-3-e1764274647359.jpg";
const TORRE = "/origem/Group-1000005967.png";
const AERIAL2 = "/origem/parque-global.png";

const MARCOS: MarcoTempo[] = [
  { ano: "1976", titulo: "Fundação da Bueno Netto", texto: "Nasce e começa a atuar em território nacional no segmento de empreendimentos residenciais, comerciais e corporativos triple A.", imagem: AERIAL },
  { ano: "1992", titulo: "Transformação da Vila Olímpia e Protagonismo Social", texto: "Inicia a transformação imobiliária da Vila Olímpia, uma oportunidade de investimento devido ao potencial da região. Liderou a criação e estruturação da ONG \"Movimento Colmeia\" para reestruturação urbanística do bairro.", imagem: AERIAL2 },
  { ano: "2008", titulo: "Primeiro Prêmio Master Imobiliário", texto: "A Bueno Netto é Master Imobiliário 2008 na categoria Empreendimentos, Retrofit com o Edifício Standard Building, transformando-o no melhor triple A da região.", imagem: "/origem/premios1-1.jpg" },
  { ano: "2011", titulo: "Reconhecimento no Retrofit Corporativo", texto: "A Bueno Netto é Master Imobiliário 2011 na categoria Comercial, Retrofit com o Rio Branco 115, o novo Retrofit corporativo no centro do Rio de Janeiro.", imagem: AERIAL2 },
  { ano: "2012", titulo: "Reestruturação Estratégica do Negócio", texto: "Criação das suas 3 unidades de negócio: Benx Incorporadora, BN Engenharia e Bem Imobiliária.", imagem: TORRE },
  { ano: "2013", titulo: "Lançamento do Parque Global", texto: "A Bueno Netto lança o Parque Global, um dos maiores projetos urbanos do país, com conceito inovador e integração de áreas verdes amplas, negócios, serviços, lazer, comércio, moradia, hotelaria, mobilidade e acessibilidade.", imagem: AERIAL },
  { ano: "2014", titulo: "Consolidação como Referência em Soluções Urbanísticas", texto: "A Bueno Netto é Master Imobiliário 2014 na categoria Profissional, Soluções Urbanísticas com o Parque Global, um complexo projeto de uso misto.", imagem: AERIAL },
  { ano: "2015", titulo: "Expansão para Empreendimentos Comerciais Mixed-Use", texto: "A Bueno Netto é Master Imobiliário 2015 na categoria Empreendimento Comercial com o Berrini One, uma nova referência de edifício corporativo mixed-use na cidade de São Paulo.", imagem: TORRE },
  { ano: "2016", titulo: "Criação da Marca Viva Benx", texto: "Benx Incorporadora cria o Viva Benx, uma linha revolucionária de produtos econômicos, com planta inteligente, localização privilegiada em bairros centrais e decorado com renomados arquitetos e decoradores.", imagem: AERIAL2 },
  { ano: "2018", titulo: "Consolidação da Plataforma Viva Benx", texto: "A plataforma Viva Benx se solidifica com mais lançamentos extraordinários em localizações estratégicas e lazer de primeira. A compra de terrenos cresce a cada ano, junto às vendas.", imagem: TORRE },
  { ano: "2019", titulo: "Expansão Acelerada e Novo Prêmio", texto: "Já são mais de 15 lançamentos na plataforma Viva Benx. A Benx tem um novo Prêmio Master Imobiliário na categoria Profissional com Viva Benx Vila Olímpia.", imagem: AERIAL },
  { ano: "2020", titulo: "Sucesso Comercial do Parque Global", texto: "A retomada do Parque Global é um sucesso, 90% das primeiras 2 torres residenciais vendidas, bem como as vendas do ano e o crescimento da presença e performance online.", imagem: AERIAL },
  { ano: "2021", titulo: "Prêmio de Marketing e Certificação Great Place to Work", texto: "O Parque Global é premiado novamente com o Prêmio Master Imobiliário na categoria Profissional, Marketing e encerra o ano com quatro das suas cinco torres residenciais lançadas e com mais de 85% vendidas. Em paralelo, a Benx conquista o certificado Great Place to Work Brasil.", imagem: AERIAL },
];

export default function OrigemPropositoPage() {
  return (
    <div className="bg-white text-[#1a2230]">
      {/* HEADER sólido */}
      <header className="sticky top-0 z-40 bg-[#0a2a66]">
        <div className={`${COL} flex items-center justify-between py-4`}>
          <Link href="/" aria-label="Benx">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-benx-branco.png" alt="Benx" className="h-6 w-auto" />
          </Link>
          <div className="flex items-center gap-3 text-white">
            <BuscaTrigger className="h-8 w-8 hover:opacity-80" />
            <MenuTrigger className="h-8 w-8 hover:opacity-80" />
          </div>
        </div>
      </header>

      {/* TOPO: masonry de 2 colunas contínuas (igual ao WP) */}
      <section className={`${COL} pb-8 pt-12`}>
        <Reveal className="grid gap-x-12 gap-y-10 lg:grid-cols-2">
          {/* COLUNA ESQUERDA */}
          <div className="flex flex-col gap-10">
            {/* iframe oficial do YouTube */}
            <div className="aspect-video w-full overflow-hidden">
              <iframe
                src="https://www.youtube.com/embed/fF5qAzZaHBw"
                title="Benx Incorporadora"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>

            <div>
              <h2 className="text-[30px] font-light leading-[1.1] tracking-tight sm:text-[40px]" style={{ color: NAVY }}>
                Benx. Construímos mais do que espaços: <span className="font-semibold">moldamos o futuro</span>
              </h2>
              <div className="mt-6 space-y-5 text-[18px] leading-[1.7] text-[#5a6577]">
                <p>A Benx nasceu para ressignificar a forma como as pessoas vivem e interagem com a cidade. Mais do que construir empreendimentos, desenvolvemos projetos que moldam cenários urbanos, integrando arquitetura, arte, inovação e sofisticação para criar espaços que transcendem o conceito de morar. Nossa atuação vai além da construção de imóveis: buscamos redefinir bairros inteiros e deixar um legado para o futuro.</p>
                <p>Fazemos parte das empresas Bueno Netto, um dos maiores e mais sólidos nomes do setor imobiliário no Brasil, com 50 anos de história e expertise no desenvolvimento de projetos icônicos. Com uma visão pautada na excelência e na inovação, construímos empreendimentos que unem design autoral, tecnologia e curadoria, sempre com atenção aos detalhes e um olhar estratégico para a evolução das cidades. Essa dedicação já rendeu diversos reconhecimentos no mercado, consolidando a Benx como referência no segmento.</p>
              </div>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={AERIAL} alt="Empreendimentos Benx" className="aspect-[4/3] w-full object-cover" />
          </div>

          {/* COLUNA DIREITA */}
          <div className="flex flex-col gap-10">
            <h1 className="text-[36px] font-light leading-[1.05] tracking-tight sm:text-[52px]" style={{ color: NAVY }}>
              Da Bueno<br />Netto à Benx
            </h1>
            <div className="grid grid-cols-2 gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/origem/trofeu.png" alt="" className="aspect-[3/4] w-full rounded-md object-cover" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={TORRE} alt="" className="aspect-[3/4] w-full rounded-md object-cover" />
            </div>
            <div className="grid place-items-center py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/origem/bueno-netto-50.png" alt="Bueno Netto 50 Anos" className="h-auto w-full max-w-[230px] sm:max-w-[290px]" />
            </div>
            <div className="space-y-6 text-[17px] leading-[1.7] text-[#5a6577]">
              <p>O nosso portfólio é diverso e expressivo. Empreendimentos de alto padrão como Parque Global, Arbórea Itaim, The Frame são exemplos do compromisso da Benx em entregar exclusividade com qualidade e inovação. Cada projeto reflete uma arquitetura imponente, combinando estética sofisticada, arquitetura inteligente e soluções urbanísticas modernas. A curadoria de arquitetos renomados e a integração de arte nos empreendimentos reforçam essa visão, criando espaços que unem beleza e significado. Mais do que moradia, entregamos um novo patamar de experiência e estilo de vida.</p>
              <p>A Viva Benx nasceu dessa expertise, uma plataforma de produtos econômicos que trouxe a possibilidade de viver em empreendimentos bem planejados, modernos e com infraestrutura completa. Estrategicamente localizados em regiões de fácil acesso, sempre próximos ao transporte público, os empreendimentos Viva Benx oferecem condomínios que se destacam pelo design contemporâneo e uma ampla estrutura de lazer.</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* MARCA SÓLIDA: título + 2 colunas */}
      <section className={`${COL} py-12`}>
        <Reveal>
          <h2 className="max-w-5xl text-[26px] font-light leading-[1.2] tracking-tight sm:text-[34px]" style={{ color: NAVY }}>
            Somos uma marca <span className="font-semibold">sólida e versátil</span>, que atua em diferentes frentes, mas sempre com um <span className="font-semibold">compromisso inegociável de fazer bem-feito</span>.
          </h2>
          <div className="mt-8 grid gap-x-12 gap-y-6 text-[17px] leading-[1.7] text-[#5a6577] lg:grid-cols-2">
            <p>O nosso portfólio é diverso e expressivo. Empreendimentos de alto padrão como Parque Global, Arbórea Itaim, The Frame são exemplos do compromisso da Benx em entregar exclusividade com qualidade e inovação. Cada projeto reflete uma arquitetura imponente, combinando estética sofisticada, arquitetura inteligente e soluções urbanísticas modernas. A curadoria de arquitetos renomados e a integração de arte nos empreendimentos reforçam essa visão, criando espaços que unem beleza e significado. Mais do que moradia, entregamos um novo patamar de experiência e estilo de vida.</p>
            <p>A Viva Benx nasceu dessa expertise, uma plataforma de produtos econômicos que trouxe a possibilidade de viver em empreendimentos bem planejados, modernos e com infraestrutura completa. Estrategicamente localizados em regiões de fácil acesso, sempre próximos ao transporte público, os empreendimentos Viva Benx oferecem condomínios que se destacam pelo design contemporâneo e uma ampla estrutura de lazer.</p>
          </div>
        </Reveal>
      </section>

      {/* NÚMEROS */}
      <section className={`${COL} py-16`}>
        <Reveal>
          <p className="text-center text-[12px] font-semibold uppercase tracking-[0.2em] text-[#9aa3b2]">A Benx em números</p>
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 sm:grid-cols-2 sm:divide-x sm:divide-[#e3e8ef]">
            {[
              { n: "+150", l: "empreendimentos" },
              { n: "+5,5 mi", l: "de m² construídos" },
            ].map((s) => (
              <div key={s.l} className="flex flex-col items-center px-6 py-4 text-center">
                <p className="text-[64px] font-bold leading-none tracking-tight sm:text-[96px]" style={{ color: NAVY }}>{s.n}</p>
                <p className="mt-4 text-[13px] font-medium uppercase tracking-[0.16em] text-[#7a8190]">{s.l}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className={`${COL} py-6`}>
        <div className="flex flex-col items-start justify-between gap-6 bg-[#0a2a66] px-10 py-10 sm:flex-row sm:items-center sm:px-12">
          <p className="text-[24px] font-light italic leading-snug text-white sm:text-[28px]">
            Fale com nossa equipe e<br className="hidden sm:block" /> conheça mais da Benx.
          </p>
          <Link href="/#contato" className="shrink-0 border border-white/70 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/10">
            Fale com um especialista
          </Link>
        </div>
      </section>

      {/* ADALBERTO */}
      <section className={`${COL} py-20`}>
        <Reveal className="grid gap-x-14 gap-y-8 lg:grid-cols-2">
          {/* coluna esquerda: título + 3 parágrafos */}
          <div>
            <h2 className="text-[40px] font-light leading-[1.04] tracking-tight sm:text-[56px]" style={{ color: NAVY }}>
              <span className="font-semibold">50 anos</span> de legado e <span className="font-semibold">visão transformadora</span>
            </h2>
            <div className="mt-8 space-y-7 text-[18px] leading-[1.7] text-[#5a6577]">
              <p>À frente de uma das trajetórias mais sólidas e inspiradoras do mercado imobiliário brasileiro, Adalberto Bueno Netto construiu mais do que edifícios: construiu um legado. Fundador da Bueno Netto, é o nome por trás de mais de 150 empreendimentos que ajudaram a redefinir a paisagem urbana de São Paulo. Símbolo de coragem, excelência e compromisso com o país, sua história inspira o presente e aponta caminhos para o futuro.</p>
              <p>Engenheiro civil formado pela Poli-USP e com mestrado em Stanford, Adalberto iniciou sua jornada em 1974, em uma pequena sobreloja na região da Paulista. Desde o começo, rompeu padrões: vendeu o apartamento que ganhou de presente de casamento para investir no primeiro terreno. Nele, ergueu seu primeiro edifício no Itaim Bibi: e nunca mais parou.</p>
              <p>Guiado por uma convicção simples e poderosa, "se é para fazer, que seja bem feito", viabilizou empreendimentos icônicos, com destaque para o Parque Global, o maior projeto urbano da América Latina. Mais do que um marco de escala, o Parque Global representa uma nova forma de pensar e viver a cidade: mais integrada, mais verde, mais humana. Um projeto que sintetiza décadas de visão e ousadia.</p>
            </div>
          </div>

          {/* coluna direita: foto no topo + 3 parágrafos */}
          <div>
            <div className="w-full overflow-hidden bg-[#e9edf3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/origem/sr.adalberto.jpg" alt="Adalberto Bueno Netto" className="h-full w-full object-cover" />
            </div>
            <div className="mt-8 space-y-7 text-[18px] leading-[1.7] text-[#5a6577]">
              <p>Mas seu impacto vai além da construção. Adalberto sempre acreditou que construir é também transformar. Esteve à frente da requalificação de áreas estratégicas, como a Vila Olímpia, investiu na valorização da arte como parte da experiência urbana e reforça, hoje, seu legado público ao liderar a viabilização do Parque Linear Bruno Covas, iniciativa que conecta cultura, meio ambiente e bem-estar coletivo.</p>
              <p>Também está à frente da criação de um instituto voltado à capacitação profissional na construção civil, reforçando sua crença no impacto social do setor como ferramenta de transformação de vidas.</p>
              <p>Ao completar 50 anos de atuação, celebramos não apenas os números, mas uma visão que respeita a cidade, valoriza a cultura e acredita na força do fazer bem feito.</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* DNA */}
      <section className={`${COL} py-16`}>
        <Reveal>
          <p className="mx-auto max-w-3xl text-center text-[24px] font-light leading-snug tracking-tight sm:text-[32px]" style={{ color: NAVY }}>
            <span className="font-semibold">Esse é o DNA que inspira a Benx.</span> E é com ele que seguimos construindo os próximos capítulos da nossa história.
          </p>
        </Reveal>
      </section>

      {/* LINHA DO TEMPO */}
      <section className={`${COL} py-12`}>
        <Reveal>
          <LinhaTempo marcos={MARCOS} />
        </Reveal>
      </section>

      {/* PRÊMIOS */}
      <section className="bg-white">
        <Reveal className={`${COL} py-20`}>
          {/* linha 1: título + introdução */}
          <div className="grid gap-12 lg:grid-cols-2">
            <h2 className="text-[34px] font-light leading-[1.08] tracking-tight sm:text-[46px]" style={{ color: NAVY }}>
              Somos premiados pela <span className="font-semibold">experiência, qualidade e confiabilidade</span>
            </h2>
            <p className="text-[17px] leading-[1.7] text-[#5a6577]">
              Os empreendimentos da Benx Incorporadora, que já somam mais de 2.500.000 m² em desenvolvimento, trazem essa marca de experiência, qualidade e confiabilidade, sempre presentes em nossos novos lançamentos e novidades, para você conferir e desfrutar, seja para moradia, investimento ou atividade comercial. Sempre sintonizada com as necessidades do mercado, para atendê-lo com rapidez e qualidade, a Benx Incorporadora já recebeu diversos prêmios e certificações sempre em busca das melhores soluções para seus clientes. Veja a seguir os principais prêmios e certificados que possuímos.
            </p>
          </div>

          {/* linha 2: carrossel + detalhe do prêmio */}
          <div className="mt-16 grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <PremiosCarrossel
              logos={[
                { src: "/origem/premios1-1.jpg", alt: "Prêmio Master Imobiliário 2008" },
                { src: "/origem/premios2-2.jpg", alt: "GBC Brasil" },
                { src: "/origem/premios3-3.jpg", alt: "Certificação" },
              ]}
            />
            <div>
              <h3 className="text-[26px] font-semibold leading-tight tracking-tight sm:text-[30px]" style={{ color: NAVY }}>Prêmio Master Imobiliário 2019/2011/2008</h3>
              <div className="mt-6 space-y-6 text-[17px] leading-[1.7] text-[#5a6577]">
                <p>A Benx ganhou Master Imobiliário 2019 na categoria Profissional, Oportunidade estratégica com o produto Viva Benx. Desde o seu primeiro lançamento, o Viva Benx evoluiu e se tornou referência em bem-estar e qualidade de vida por um preço justo. Os projetos com alto padrão de acabamento, que reúnem boa localização, lazer e diferenciais exclusivos, transformaram o jeito de viver na cidade.</p>
                <p>A Bueno Netto também ganhou Master Imobiliário 2011 na categoria Comercial, Retrofit com o Rio Branco 115, o novo Retrofit corporativo no centro do Rio de Janeiro. Trata-se de um edifício da década de 1950, totalmente renovado e reposicionado no mercado, com especificações técnicas e tecnologia dos mais atuais edifícios corporativos.</p>
                <p>A Bueno Netto é Master Imobiliário 2008 na categoria Empreendimentos, Retrofit, com o Edifício Standard Building, transformando-o no melhor Triple A da região. O objetivo de resgatar o grande valor arquitetônico e histórico do empreendimento, localizado na cidade do Rio de Janeiro, foi alcançado, resultando essa importante premiação.</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}

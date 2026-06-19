import type { Metadata } from "next";
import { EsgShell, COL, NAVY } from "@/components/public/esg/esg-shell";
import { Reveal } from "@/components/public/reveal";

export const metadata: Metadata = {
  title: "Excelência nos Empreendimentos — ESG",
  description: "Qualidade transversal, Sistema de Gestão Integrada (SGI) e certificações que reforçam o compromisso da Benx com a excelência.",
};

// Certificações (logo + rótulo) em cards navy.
const CERTS = [
  { nome: "AQUA-HQE™", logo: "/esg/aqua.png" },
  { nome: "LEED", logo: "/esg/imagesd.png" },
  { nome: "Fitwel", logo: "/esg/Fitwel.png" },
  { nome: "EDGE", logo: "/esg/edge-1-1dd.png" },
];

// Logos institucionais (norma / programa / sistema). ISO + PBQP-H vêm juntos no
// mesmo arquivo; SGI é a "flor" colorida.
const SELOS = [
  { src: "/esg/Group-1000006088.jpg", alt: "ISO 45001:2018 e PBQP-H", classe: "h-16 sm:h-20" },
  { src: "/esg/polit-sgi_ima-02.png", alt: "Sistema de Gestão Integrada (SGI)", classe: "h-24 sm:h-28" },
];

// Desempenho da Viva Benx (3 frentes com listas).
const DESEMPENHO = [
  {
    titulo: "Redução de consumo de energia",
    itens: [
      "Elevadores com chamada inteligente",
      "Painéis fotovoltaicos para geração de energia",
      "Sensores de presença nas áreas comuns",
      "Persiana de enrolar nos dormitórios",
      "Lâmpadas e luminárias LED",
    ],
  },
  {
    titulo: "Conforto e segurança",
    itens: [
      "Paisagismo ecoeficiente, com espécies nativas e preservação (sempre que possível) das árvores já existentes no terreno",
      "Portaria única com controle de acesso de pedestres e veículos, integrando segurança e gestão de fluxo",
    ],
  },
  {
    titulo: "Redução de consumo de água",
    itens: [
      "Torneiras, vasos sanitários e chuveiros com dispositivos economizadores",
      "Infraestrutura para medição individualizada de água",
      "Captação e uso de água da chuva para torneira externa e irrigação dos jardins",
    ],
  },
];

export default function EsgExcelenciaPage() {
  return (
    <EsgShell ativo="excelencia">
      {/* INTRO + DIAGRAMA */}
      <section className={`${COL} py-16`}>
        <Reveal className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <span className="inline-block border border-[#e3e8ef] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5b6577]">
              Excelência nos empreendimentos
            </span>
            <h2 className="mt-6 text-[44px] font-light leading-[1.0] tracking-tight sm:text-[60px]" style={{ color: NAVY }}>
              Excelência
            </h2>
            <div className="mt-6 max-w-xl space-y-5 text-[15px] leading-relaxed text-[#5a6577]">
              <p>A Benx atua em toda a cadeia imobiliária, da escolha estratégica do terreno à entrega dos produtos, desenvolvendo empreendimentos residenciais e comerciais que vão da habitação econômica ao mercado de luxo.</p>
              <p><strong className="text-[#1a2230]">QUALIDADE</strong> é um valor transversal inegociável na Benx. Está presente desde o desenvolvimento do projeto até o pós-entrega, sempre com foco na experiência completa do cliente. Esse compromisso é sustentado por certificações em qualidade, sustentabilidade, saúde e bem-estar, além de equipes especializadas em incorporação e construção, estruturadas para atender com precisão diferentes perfis de produtos do Viva Benx, alto padrão e luxo.</p>
            </div>
          </div>

          {/* diagrama (imagem pronta) */}
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/esg/Group-1000006060.png"
              alt="Inovação, otimização e excelência: qualidade, assistência técnica, gestão de clientes e estratégia de personalização"
              className="h-auto w-full max-w-[540px]"
            />
          </div>
        </Reveal>
      </section>

      {/* SELOS / NORMAS */}
      <section className={`${COL} pb-6`}>
        <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
          {SELOS.map((s) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={s.alt} src={s.src} alt={s.alt} className={`${s.classe} w-auto object-contain`} />
          ))}
        </div>
      </section>

      {/* CERTIFICAÇÕES (cards navy) */}
      <section className={`${COL} py-12`}>
        <Reveal>
          <h2 className="text-[20px] font-semibold uppercase tracking-[0.08em] sm:text-[24px]" style={{ color: NAVY }}>
            Certificações que reforçam o compromisso com a excelência
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {CERTS.map((c) => (
              <div key={c.nome} className="flex flex-col items-center gap-4 bg-[#0a2a66] px-5 py-8 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-md bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.logo} alt={c.nome} className="h-full w-full object-contain" />
                </span>
                <span className="text-[14px] font-semibold uppercase tracking-[0.08em] text-white">{c.nome}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* PARQUE GLOBAL */}
      <section className={`${COL} py-12`}>
        <Reveal className="grid items-stretch gap-0 bg-[#f0f1f4] sm:grid-cols-[1fr_1.1fr]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/esg/Biodiverdidade-Parque-Global.png" alt="Parque Global" className="h-full min-h-[240px] w-full object-cover" />
          <div className="p-8 sm:p-10">
            <h2 className="text-[22px] font-semibold uppercase leading-tight tracking-[0.04em] sm:text-[26px]" style={{ color: NAVY }}>
              Parque Global: referência nacional em certificações
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-[#5a6577]">
              O Parque Global é referência nacional em sustentabilidade, com 15 certificações concluídas ou em andamento, incluindo o LEED for Cities and Communities e a pré-certificação LEED Ouro. Suas torres residenciais possuem o selo AQUA-HQE, atestando o mais alto nível de qualidade e eficiência ambiental. O projeto também avança na certificação Fitwel, focada em saúde e bem-estar dos moradores.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ALTO DESEMPENHO NA HABITAÇÃO POPULAR */}
      <section className={`${COL} py-12`}>
        <Reveal className="grid items-center gap-10 sm:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="text-[22px] font-semibold uppercase tracking-[0.04em] sm:text-[26px]" style={{ color: NAVY }}>
              Alto desempenho na habitação popular
            </h2>
            <div className="mt-5 max-w-2xl space-y-4 text-[14px] leading-relaxed text-[#5a6577]">
              <p>A Viva Benx rompe a ideia de que habitação econômica não pode ser sustentável, ao unir acessibilidade financeira, qualidade arquitetônica e desempenho ambiental elevado e ao quebrar o paradigma de que moradias populares devem se limitar às periferias.</p>
              <p>Com a metodologia <strong className="text-[#1a2230]">ECONOMIX</strong>, integra soluções de ecoeficiência que reduzem impactos ambientais e elevam o bem-estar ao longo de todo o ciclo de vida dos empreendimentos.</p>
            </div>
          </div>
          <div className="flex justify-center sm:justify-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-vivabenx-cor.svg" alt="Viva Benx" className="h-auto w-48 sm:w-56" />
          </div>
        </Reveal>
      </section>

      {/* TRÊS FRENTES DE DESEMPENHO */}
      <section className={`${COL} pb-16`}>
        <div className="grid gap-4 sm:grid-cols-3">
          {DESEMPENHO.map((d) => (
            <div key={d.titulo} className="bg-[#f0f1f4] p-7">
              <h3 className="text-[18px] font-semibold uppercase leading-tight tracking-[0.03em]" style={{ color: NAVY }}>
                {d.titulo}
              </h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-[#5a6577] marker:text-[#0a2a66]">
                {d.itens.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </EsgShell>
  );
}

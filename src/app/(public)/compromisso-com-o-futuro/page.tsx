import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { Reveal } from "@/components/public/reveal";

export const metadata: Metadata = {
  title: "Compromisso com o Futuro",
  description:
    "A Benx incorpora o desenvolvimento sustentável à sua governança como princípio ético e inegociável. Conheça nosso Relato de Sustentabilidade.",
};

const NAVY = "#0a2a66";
const COL = "mx-auto w-full max-w-site px-6";

const TEMAS = [
  { label: "Excelência dos empreendimentos", href: "/esg/excelencia" },
  { label: "Gente e gestão de stakeholders", href: "/esg/gente" },
  { label: "Construção sustentável", href: "/esg/construcao" },
  { label: "Transparência e prestação de contas", href: "/esg/transparencia" },
];

const DIRETRIZES = [
  { sigla: "GRI", nome: "Global Reporting Initiative", texto: "Padrões internacionais para comunicação de impactos econômicos, ambientais e sociais." },
  { sigla: "ODS", nome: "Objetivos do Desenvolvimento Sustentável", texto: "Alinhamento à agenda 2030 da ONU, reforçando o compromisso com a responsabilidade corporativa." },
  { sigla: "SASB", nome: "Sustainability Accounting Standards Board", texto: "Padrões setoriais que orientam a divulgação de informações com foco em investidores e stakeholders." },
];

const RELATORIOS = [
  { ano: "2022", href: "https://mediumpurple-dove-988968.hostingersite.com/wp-content/uploads/2026/02/Relatorio_de_sustentabilidade_-2022.pdf" },
  { ano: "2023", href: "#" },
  { ano: "2024", href: "https://mediumpurple-dove-988968.hostingersite.com/wp-content/uploads/2026/02/Relatorio_de_sustentabilidade_-2024.pdf" },
];

export default function CompromissoComOFuturoPage() {
  return (
    <div className="bg-white text-[#1a2230]">
      {/* HERO */}
      <header className="relative flex min-h-[88vh] flex-col justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/compromisso/hero.png" alt="Compromisso com o futuro" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />

        <SiteHeader />

        <div className={`relative z-10 ${COL} max-w-3xl`}>
          <h1 className="text-[44px] font-light leading-[1.05] tracking-tight text-white sm:text-[64px]">
            Compromisso<br />com o futuro
          </h1>
          <p className="mt-5 max-w-xl text-[18px] font-light leading-snug text-white/85 sm:text-[22px]">
            50 anos transformando São Paulo com inovação, excelência e responsabilidade socioambiental.
          </p>
          <p className="mt-8 max-w-2xl text-[14px] leading-relaxed text-white/75">
            A Benx incorpora o desenvolvimento sustentável à sua governança corporativa como um princípio ético e inegociável. Essa visão orienta nossas decisões, direciona investimentos e fortalece a gestão dos impactos ambientais, sociais e econômicos ao longo de todo o ciclo dos nossos empreendimentos. Trabalhamos para elevar a eficiência no uso de recursos, garantir desempenho econômico sustentável e valorizar as pessoas que constroem a nossa história sempre com o compromisso de gerar impacto positivo para a cidade e para a sociedade.
          </p>
        </div>
      </header>

      {/* RELATO + DIRETRIZES */}
      <section className={`${COL} py-20`}>
        <Reveal>
          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
            {/* esquerda */}
            <div>
              <span className="inline-block border border-[#e3e8ef] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5b6577]">
                Compromisso com Futuro
              </span>
              <h2 className="mt-6 text-[34px] font-light leading-[1.05] tracking-tight sm:text-[46px]" style={{ color: NAVY }}>
                Relato de<br />Sustentabilidade
              </h2>
              <p className="mt-6 text-[15px] leading-relaxed text-[#5a6577]">
                Nosso compromisso com o Futuro reúne as principais iniciativas, projetos e resultados da Benx voltados à geração de valor para todos os nossos públicos de interesse. Entre 2023 e 2024, passamos por uma transformação profunda: consolidamos as operações de incorporação e construção em uma única estrutura, integrando equipes, processos e cultura em um movimento que reposiciona a Benx para os próximos ciclos de crescimento. Apresentamos as nossas ações para endereçar cada um dos nossos temas materiais que fazem parte da nossa estratégia e nosso dia a dia:
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {TEMAS.map((t) => (
                  <Link key={t.href} href={t.href} className="grid min-h-[88px] place-items-center bg-[#0a2a66] px-6 py-5 text-center text-[13px] font-semibold uppercase leading-snug tracking-wide text-white transition hover:brightness-125">
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* direita: diretrizes */}
            <div>
              <h3 className="text-[26px] font-light tracking-tight sm:text-[30px]" style={{ color: NAVY }}>Diretrizes Utilizadas</h3>
              <div className="mt-6 flex flex-col">
                {DIRETRIZES.map((d) => (
                  <div key={d.sigla} className="border-t border-black/10 py-6">
                    <p style={{ color: NAVY }}>
                      <span className="text-[22px] font-normal">{d.sigla}</span>{" "}
                      <span className="text-[13px] italic text-[#8a94a6]">({d.nome})</span>
                    </p>
                    <p className="mt-2 text-[14px] leading-relaxed text-[#5a6577]">{d.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* DOWNLOADS */}
      <section className="bg-[#f6f7f9]">
        <Reveal className={`${COL} py-16 text-center`}>
          <h2 className="text-[24px] font-light tracking-tight sm:text-[30px]" style={{ color: NAVY }}>
            Conheça nosso relato de sustentabilidade:
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {RELATORIOS.map((r) => (
              <a
                key={r.ano}
                href={r.href}
                target={r.href !== "#" ? "_blank" : undefined}
                rel={r.href !== "#" ? "noopener noreferrer" : undefined}
                className="group inline-flex items-center gap-3 bg-[#0a2a66] px-7 py-4 text-[13px] font-semibold uppercase tracking-wide text-white transition hover:opacity-90"
              >
                <Download size={16} />
                Baixar relatório {r.ano}
              </a>
            ))}
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}

import Link from "next/link";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

export const NAVY = "#0a2a66";
export const COL = "mx-auto w-full max-w-site px-6";

export const ESG_SECOES = [
  { key: "compromisso", label: "COMPROMISSO", href: "/compromisso-com-o-futuro" },
  { key: "benx", label: "BENX", href: "/esg/a-benx" },
  { key: "excelencia", label: "EXCELÊNCIA", href: "/esg/excelencia" },
  { key: "gente", label: "GENTE E GESTÃO", href: "/esg/gente" },
  { key: "sustentavel", label: "SUSTENTÁVEL", href: "/esg/construcao" },
  { key: "transparencia", label: "TRANSPARÊNCIA", href: "/esg/transparencia" },
] as const;

export type EsgKey = (typeof ESG_SECOES)[number]["key"];

// Hero compartilhado da seção ESG ("Compromisso com o futuro").
export function EsgHero() {
  return (
    <header className="relative flex min-h-[72vh] flex-col justify-center overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/compromisso/hero.png" alt="Compromisso com o futuro" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
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
          A Benx incorpora o desenvolvimento sustentável à sua governança corporativa como um princípio ético e inegociável. Essa visão orienta nossas decisões, direciona investimentos e fortalece a gestão dos impactos ambientais, sociais e econômicos ao longo de todo o ciclo dos nossos empreendimentos. Trabalhamos para elevar a eficiência no uso de recursos, garantir desempenho econômico sustentável e valorizar as pessoas que constroem a nossa história, sempre com o compromisso de gerar impacto positivo para a cidade e para a sociedade.
        </p>
      </div>
    </header>
  );
}

// Casca das páginas de detalhe ESG: hero + sub-nav (seção ativa) + conteúdo.
export function EsgShell({ ativo, children }: { ativo: EsgKey; children: React.ReactNode }) {
  return (
    <div className="bg-white text-[#1a2230]">
      <EsgHero />
      <nav style={{ background: "linear-gradient(90deg, #05142f 0%, #163a76 50%, #05142f 100%)" }}>
        <div className={`${COL} flex flex-wrap items-center justify-center gap-x-2 gap-y-1 py-1`}>
          {ESG_SECOES.map((s) => {
            const on = s.key === ativo;
            return (
              <Link
                key={s.key}
                href={s.href}
                className={`px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.12em] transition ${on ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
              >
                {s.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

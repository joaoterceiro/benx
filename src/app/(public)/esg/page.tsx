import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EsgHero, COL, NAVY } from "@/components/public/esg/esg-shell";
import { SiteFooter } from "@/components/public/site-footer";

export const metadata: Metadata = {
  title: "ESG — Compromisso com o Futuro",
  description: "A agenda ESG da Benx: compromisso com o futuro, excelência nos empreendimentos, gente e gestão, construção sustentável e transparência.",
};

const ITENS = [
  { label: "Compromisso com o futuro", href: "/compromisso-com-o-futuro" },
  { label: "A Benx", href: "/esg/a-benx" },
  { label: "Excelência dos empreendimentos", href: "/esg/excelencia" },
  { label: "Gente e gestão de stakeholders", href: "/esg/gente" },
  { label: "Construção sustentável", href: "/esg/construcao" },
  { label: "Transparência e prestação de contas", href: "/esg/transparencia" },
];

export default function EsgHubPage() {
  return (
    <div className="bg-white text-[#1a2230]">
      <EsgHero />
      <section className={`${COL} py-16`}>
        <ul className="mx-auto max-w-3xl">
          {ITENS.map((i) => (
            <li key={i.href}>
              <Link
                href={i.href}
                className="group flex items-center justify-between gap-4 border-b border-black/10 py-6 text-[20px] font-light tracking-tight transition-colors hover:text-[#0a4dcc] sm:text-[24px]"
                style={{ color: NAVY }}
              >
                {i.label}
                <ArrowRight size={20} className="shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <SiteFooter />
    </div>
  );
}

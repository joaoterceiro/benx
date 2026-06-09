import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { Reveal } from "@/components/public/reveal";

export const metadata: Metadata = {
  title: "Canal de Ética",
  description:
    "Um espaço seguro e confidencial para reportar condutas inadequadas, irregularidades ou situações que violem nossos princípios éticos e de compliance.",
};

const NAVY = "#0a2a66";
const COL = "mx-auto w-full max-w-site px-6";

export default function CanalDeEticaPage() {
  return (
    <div className="bg-white text-[#1a2230]">
      {/* HERO */}
      <header className="relative flex h-[60vh] min-h-[420px] flex-col justify-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/etica/hero.jpg" alt="Canal de Ética" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/45" />

        <SiteHeader />

        <div className={`relative z-10 ${COL} pb-12`}>
          <h1 className="text-[40px] font-light leading-none tracking-tight text-white sm:text-[64px]">Canal de Ética</h1>
        </div>
      </header>

      {/* BEM-VINDO */}
      <section className={`${COL} py-20`}>
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div>
              <h2 className="text-[34px] font-light leading-[1.1] tracking-tight sm:text-[44px]" style={{ color: NAVY }}>
                Bem-vindo<br />ao nosso canal de ética
              </h2>
              <p className="mt-6 text-[22px] font-light leading-snug" style={{ color: NAVY }}>
                Um espaço seguro para suas manifestações ou práticas em desacordo com os valores da Benx Incorporadora e BEM Imobiliária
              </p>
            </div>
            <p className="text-[15px] leading-relaxed text-[#5a6577] lg:pt-4">
              O Canal de Ética é um meio confidencial e seguro para você reportar condutas inadequadas, irregularidades ou situações que violem nossos princípios éticos e de compliance. Sua contribuição é fundamental para mantermos um ambiente de trabalho íntegro e transparente.
            </p>
          </div>

          {/* CARD navy */}
          <div className="mt-12 grid gap-8 bg-[#0a2a66] p-10 lg:grid-cols-2 lg:items-center lg:p-12">
            <p className="text-[18px] font-light leading-snug text-white">
              Clique no botão para fazer uma denúncia, manifestações e relatos de forma anônima e segura.
            </p>
            <div className="lg:flex lg:justify-end">
              <a
                href="https://denuncia.iauditcloud.com.br/benx"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 border border-white/30 px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-white/10"
              >
                <ArrowRight size={16} className="shrink-0 transition-transform group-hover:translate-x-1" />
                Quero denunciar
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}

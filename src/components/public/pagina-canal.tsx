import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { Reveal } from "@/components/public/reveal";

const NAVY = "#0a2a66";
const COL = "mx-auto w-full max-w-site px-6";

export interface CanalBotao {
  label: string;
  href: string;
  externo?: boolean;
}

export interface PaginaCanalProps {
  /** Título do hero (ex.: "Trabalhe conosco"). */
  titulo: string;
  /** Imagem de fundo do hero. */
  heroSrc: string;
  /** Heading da seção (2 linhas: ex.: ["Faça parte", "do nosso time"]). */
  heading: [string, string];
  /** Texto destacado (esquerda, navy). */
  textoEsq: string;
  /** Texto de apoio (direita, cinza). */
  textoDir: string;
  /** Texto do card navy. */
  cardTexto: string;
  /** Botões do card navy. */
  botoes: CanalBotao[];
}

// Template comum das páginas de canal/atendimento (hero + boas-vindas + card navy).
export function PaginaCanal({ titulo, heroSrc, heading, textoEsq, textoDir, cardTexto, botoes }: PaginaCanalProps) {
  return (
    <div className="bg-white text-[#1a2230]">
      {/* HERO */}
      <header className="relative flex h-[60vh] min-h-[420px] flex-col justify-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroSrc} alt={titulo} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/45" />

        <SiteHeader />

        <div className={`relative z-10 ${COL} pb-12`}>
          <h1 className="text-[40px] font-light leading-none tracking-tight text-white sm:text-[64px]">{titulo}</h1>
        </div>
      </header>

      {/* BEM-VINDO */}
      <section className={`${COL} py-20`}>
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div>
              <h2 className="text-[34px] font-light leading-[1.1] tracking-tight sm:text-[44px]" style={{ color: NAVY }}>
                {heading[0]}<br />{heading[1]}
              </h2>
              <p className="mt-6 text-[22px] font-light leading-snug" style={{ color: NAVY }}>{textoEsq}</p>
            </div>
            <p className="text-[15px] leading-relaxed text-[#5a6577] lg:pt-4">{textoDir}</p>
          </div>

          {/* CARD navy */}
          <div className="mt-12 grid gap-8 bg-[#0a2a66] p-10 lg:grid-cols-2 lg:items-center lg:p-12">
            <p className="text-[20px] font-light leading-snug text-white">{cardTexto}</p>
            <div className="flex flex-col gap-3 lg:items-end">
              {botoes.map((b, i) => (
                <a
                  key={i}
                  href={b.href}
                  target={b.externo ? "_blank" : undefined}
                  rel={b.externo ? "noopener noreferrer" : undefined}
                  className="group inline-flex items-center gap-3 border border-white/30 px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-white/10"
                >
                  <ArrowRight size={16} className="shrink-0 transition-transform group-hover:translate-x-1" />
                  {b.label}
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}

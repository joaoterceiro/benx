"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { SeloTag } from "@/components/public/selo-tag";
import type { SeloConfig } from "@/lib/selo";

export interface StripCard {
  href: string;
  nome: string;
  statusLabel: string;
  imagemUrl: string | null;
  seloUrl?: string | null;
}

export interface StripCols { mobile: number; tablet: number; desktop: number; wide: number }

// Classes literais de flex-basis por nº de cards (1-6) e breakpoint. Precisam ser
// literais para o Tailwind gerar todas. gap entre cards = 1rem (n cards descontam (n-1)rem).
const BASIS_MOBILE: Record<number, string> = {
  1: "basis-full",
  2: "basis-[calc((100%_-_1rem)/2)]",
  3: "basis-[calc((100%_-_2rem)/3)]",
  4: "basis-[calc((100%_-_3rem)/4)]",
  5: "basis-[calc((100%_-_4rem)/5)]",
  6: "basis-[calc((100%_-_5rem)/6)]",
};
const BASIS_TABLET: Record<number, string> = {
  1: "sm:basis-full",
  2: "sm:basis-[calc((100%_-_1rem)/2)]",
  3: "sm:basis-[calc((100%_-_2rem)/3)]",
  4: "sm:basis-[calc((100%_-_3rem)/4)]",
  5: "sm:basis-[calc((100%_-_4rem)/5)]",
  6: "sm:basis-[calc((100%_-_5rem)/6)]",
};
const BASIS_DESKTOP: Record<number, string> = {
  1: "lg:basis-full",
  2: "lg:basis-[calc((100%_-_1rem)/2)]",
  3: "lg:basis-[calc((100%_-_2rem)/3)]",
  4: "lg:basis-[calc((100%_-_3rem)/4)]",
  5: "lg:basis-[calc((100%_-_4rem)/5)]",
  6: "lg:basis-[calc((100%_-_5rem)/6)]",
};
const BASIS_WIDE: Record<number, string> = {
  1: "xl:basis-full",
  2: "xl:basis-[calc((100%_-_1rem)/2)]",
  3: "xl:basis-[calc((100%_-_2rem)/3)]",
  4: "xl:basis-[calc((100%_-_3rem)/4)]",
  5: "xl:basis-[calc((100%_-_4rem)/5)]",
  6: "xl:basis-[calc((100%_-_5rem)/6)]",
};
const COLS_PADRAO: StripCols = { mobile: 2, tablet: 3, desktop: 4, wide: 5 };
function basisDe(cols: StripCols): string {
  return [
    BASIS_MOBILE[cols.mobile] ?? BASIS_MOBILE[2],
    BASIS_TABLET[cols.tablet] ?? BASIS_TABLET[3],
    BASIS_DESKTOP[cols.desktop] ?? BASIS_DESKTOP[4],
    BASIS_WIDE[cols.wide] ?? BASIS_WIDE[5],
  ].join(" ");
}

export function EmpreendimentosStrip({
  cards,
  cols,
  cardWidthClass,
  aspectClass = "aspect-[3/4]",
  autoplay = false,
  intervalo = 4500,
  seloConfig,
}: {
  cards: StripCard[];
  cols?: StripCols;
  cardWidthClass?: string;
  aspectClass?: string;
  autoplay?: boolean;
  intervalo?: number;
  seloConfig?: SeloConfig;
}) {
  // Largura: override explícito (cardWidthClass) > config por breakpoint (cols) > padrão.
  const widthClass = cardWidthClass ?? basisDe(cols ?? COLS_PADRAO);
  const ref = useRef<HTMLDivElement>(null);
  const pausado = useRef(false);

  const rolar = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: "smooth" });
  };

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => {
      const el = ref.current;
      if (!el || pausado.current) return;
      // volta ao início quando chega ao fim
      const fim = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      if (fim) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: Math.round(el.clientWidth * 0.8), behavior: "smooth" });
    }, intervalo);
    return () => clearInterval(id);
  }, [autoplay, intervalo]);

  if (cards.length === 0) return null;

  return (
    <div className="relative px-4" onMouseEnter={() => { pausado.current = true; }} onMouseLeave={() => { pausado.current = false; }}>
      <button type="button" aria-label="Anterior" onClick={() => rolar(-1)} className="absolute left-0 top-1/2 z-30 grid h-10 w-10 -translate-y-1/2 place-items-center bg-[#0A2A66] text-white transition hover:brightness-125">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
      </button>
      <div ref={ref} className="flex snap-x gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={`group relative ${aspectClass} shrink-0 snap-start overflow-hidden ${widthClass}`}
          >
            <Image src={c.imagemUrl || "/placeholder-card.jpg"} alt={c.nome} fill sizes="(max-width: 640px) 55vw, (max-width: 1024px) 38vw, 20vw" loading="lazy" className="object-cover transition duration-500 group-hover:scale-105" />
            {c.seloUrl && seloConfig && <SeloTag url={c.seloUrl} config={seloConfig} />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/25" />
            {c.statusLabel && (
              <span className="absolute right-5 top-6 whitespace-nowrap border border-white/70 px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                {c.statusLabel}
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 p-6 text-[26px] font-bold leading-tight tracking-tight text-white drop-shadow transition-transform duration-500 group-hover:-translate-y-1 sm:text-[30px]">{c.nome}</span>
          </Link>
        ))}
      </div>
      <button type="button" aria-label="Próximo" onClick={() => rolar(1)} className="absolute right-0 top-1/2 z-30 grid h-10 w-10 -translate-y-1/2 place-items-center bg-[#0A2A66] text-white transition hover:brightness-125">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
      </button>
    </div>
  );
}

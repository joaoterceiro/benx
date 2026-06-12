"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export interface StripCard {
  href: string;
  nome: string;
  statusLabel: string;
  imagemUrl: string | null;
}

export function EmpreendimentosStrip({
  cards,
  // Largura por flex-basis calculada para caber um nº inteiro de cards IGUAIS
  // (descontando os gaps de 1rem): 2 no mobile, 3 no sm, 4 no lg. Sem corte.
  cardWidthClass = "basis-[calc((100%_-_1rem)/2)] sm:basis-[calc((100%_-_2rem)/3)] lg:basis-[calc((100%_-_3rem)/4)]",
  aspectClass = "aspect-[3/4]",
  autoplay = false,
  intervalo = 4500,
}: {
  cards: StripCard[];
  cardWidthClass?: string;
  aspectClass?: string;
  autoplay?: boolean;
  intervalo?: number;
}) {
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
      <button type="button" aria-label="Anterior" onClick={() => rolar(-1)} className="absolute left-0 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center bg-[#0A2A66] text-white transition hover:brightness-125">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
      </button>
      <div ref={ref} className="flex snap-x gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={`group relative ${aspectClass} shrink-0 snap-start overflow-hidden ${cardWidthClass}`}
          >
            <Image src={c.imagemUrl || "/placeholder-card.jpg"} alt={c.nome} fill sizes="(max-width: 640px) 55vw, (max-width: 1024px) 38vw, 20vw" loading="lazy" className="object-cover transition duration-500 group-hover:scale-105" />
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
      <button type="button" aria-label="Próximo" onClick={() => rolar(1)} className="absolute right-0 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center bg-[#0A2A66] text-white transition hover:brightness-125">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
      </button>
    </div>
  );
}

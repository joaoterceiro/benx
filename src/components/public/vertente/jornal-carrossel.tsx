"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export interface JornalCard {
  slug: string;
  fonte: string | null;
  titulo: string;
  resumo: string | null;
  imagemUrl: string | null;
}

export function JornalCarrossel({ posts }: { posts: JornalCard[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const pausado = useRef(false);

  const rolar = (dir: -1 | 1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.9), behavior: "smooth" });
  };

  useEffect(() => {
    if (posts.length <= 2) return;
    const id = setInterval(() => {
      const el = ref.current;
      if (!el || pausado.current) return;
      const fim = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      if (fim) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: Math.round(el.clientWidth * 0.9), behavior: "smooth" });
    }, 5000);
    return () => clearInterval(id);
  }, [posts.length]);

  if (posts.length === 0) return null;

  return (
    <div className="relative sm:px-12" onMouseEnter={() => { pausado.current = true; }} onMouseLeave={() => { pausado.current = false; }}>
      {posts.length > 2 && (
        <>
          <button type="button" aria-label="Anterior" onClick={() => rolar(-1)} className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center bg-[#0A2A66] text-white transition hover:brightness-125 sm:grid">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button type="button" aria-label="Próximo" onClick={() => rolar(1)} className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center bg-[#0A2A66] text-white transition hover:brightness-125 sm:grid">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </>
      )}

      <div ref={ref} className="flex snap-x gap-8 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/benx-journal/${p.slug}`}
            className="group flex w-full shrink-0 snap-start items-start gap-5 sm:w-[calc(50%-1rem)]"
          >
            <div className="flex min-w-0 flex-1 flex-col">
              {p.fonte && <span className="text-[13px] text-black/45">{p.fonte}</span>}
              <h3 className="mt-2 text-[19px] font-bold capitalize leading-snug text-[#1a1a1a] transition group-hover:text-[#0A4DCC]">{p.titulo}</h3>
              {p.resumo && <p className="mt-3 line-clamp-5 text-[13px] leading-relaxed text-black/55">{p.resumo}</p>}
            </div>
            <div className="shrink-0 overflow-hidden">
              {p.imagemUrl ? (
                <div className="relative h-[280px] w-[260px] max-w-[40vw] overflow-hidden">
                  <Image src={p.imagemUrl} alt={p.titulo} fill sizes="(max-width: 640px) 40vw, 260px" loading="lazy" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
                </div>
              ) : <div className="h-[280px] w-[260px] bg-black/10" />}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

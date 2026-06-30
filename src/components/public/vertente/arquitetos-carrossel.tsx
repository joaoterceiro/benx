"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const NAVY = "#0A2A66";
const VERMELHO = "#e11d2a";

export interface ArquitetoCard {
  nome: string;
  categoria: string;
  bio: string;
  foto: string;
}

// Vitrine premium de arquitetos em carrossel. Setas circulares no cabeçalho
// (mesmo vocabulário do CTA), nunca sobre as fotos; desabilitam nas pontas.
// Barra de progresso e edge-fade indicam que há mais conteúdo ao lado.
export function ArquitetosCarrossel({ itens }: { itens: ArquitetoCard[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [prog, setProg] = useState(0);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
    setProg(max > 0 ? Math.min(1, Math.max(0, el.scrollLeft / max)) : 0);
  }, []);

  useEffect(() => {
    sync();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const mover = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const passo = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * passo, behavior: "smooth" });
  };

  const multi = itens.length > 1;

  return (
    <div>
      {/* cabeçalho editorial + navegação */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em]" style={{ color: VERMELHO }}>
            Arquitetura &amp; Design
          </p>
          <h2 className="mt-4 text-[clamp(34px,4.2vw,58px)] font-medium leading-[1.0] tracking-[-0.025em]" style={{ color: NAVY }}>
            Arquitetos que inspiram
          </h2>
        </div>
        <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end sm:gap-5">
          <p className="max-w-[260px] text-[15px] leading-relaxed text-black/45 sm:text-right">
            As assinaturas por trás de cada empreendimento Benx.
          </p>
          {multi && (
            <div className="flex items-center gap-2.5">
              <NavBtn dir={-1} on={canPrev} onClick={() => mover(-1)} label="Arquiteto anterior" />
              <NavBtn dir={1} on={canNext} onClick={() => mover(1)} label="Próximo arquiteto" />
            </div>
          )}
        </div>
      </div>

      <div className="my-10 h-px w-full bg-black/[0.08] sm:my-11" />

      {/* trilho do carrossel */}
      <div className="relative">
        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {itens.map((a) => (
            <Link
              key={a.nome}
              data-card
              href="/mentes-criativas"
              className="group block w-[72%] shrink-0 snap-start sm:w-[44%] lg:w-[calc((100%-3rem)/4)]"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] bg-[#16181c]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.foto}
                  alt={a.nome}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-[800ms] ease-[cubic-bezier(.2,0,.2,1)] group-hover:scale-[1.05]"
                />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-[#0b0f17]/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="pointer-events-none absolute inset-x-5 bottom-5 translate-y-3 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="text-[13.5px] leading-[1.5] text-white/95">{a.bio}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="relative inline-block text-[17px] font-medium leading-none tracking-[-0.01em]" style={{ color: NAVY }}>
                  {a.nome}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 transition-[width] duration-300 ease-out group-hover:w-full" style={{ background: VERMELHO }} />
                </span>
                {a.categoria && (
                  <p className="mt-2 text-[11.5px] uppercase tracking-[0.14em] text-black/40">{a.categoria}</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* dica de continuidade à direita (some no fim) */}
        {multi && canNext && (
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-14 bg-gradient-to-l from-[#f7f8fa] to-transparent sm:block" />
        )}
      </div>

      {/* barra de progresso do scroll */}
      {multi && (
        <div className="mt-8 h-px w-full overflow-hidden bg-black/[0.08]">
          <div
            className="h-px transition-[width] duration-150 ease-out"
            style={{ width: `${14 + prog * 86}%`, background: NAVY }}
          />
        </div>
      )}

      {/* CTA */}
      <div className="mt-10 flex justify-center sm:justify-end">
        <Link
          href="/mentes-criativas"
          className="group inline-flex items-center gap-4 text-[13px] font-bold uppercase tracking-[0.16em]"
          style={{ color: NAVY }}
        >
          Conheça os arquitetos
          <span className="grid h-11 w-11 place-items-center rounded-full border border-black/10 transition-colors duration-300 group-hover:border-[#0A2A66] group-hover:bg-[#0A2A66]">
            <ArrowRight size={17} className="text-[#0A2A66] transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white" />
          </span>
        </Link>
      </div>
    </div>
  );
}

function NavBtn({ dir, on, onClick, label }: { dir: number; on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!on}
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full border border-black/10 text-[#0A2A66] transition-all duration-300 enabled:hover:border-[#0A2A66] enabled:hover:bg-[#0A2A66] enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {dir < 0 ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
      </svg>
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { HeroSlideResolvido } from "@/db/queries";

const COL = "mx-auto w-full max-w-site px-6";

export function HeroSlider({ slides }: { slides: HeroSlideResolvido[] }) {
  const [i, setI] = useState(0);
  const [pausado, setPausado] = useState(false);
  const total = slides.length;

  const ir = (n: number) => setI((total + n) % total);
  const prox = () => ir(i + 1);
  const ant = () => ir(i - 1);

  // Autoplay com duração POR slide (reagenda a cada troca / pausa).
  useEffect(() => {
    if (total <= 1 || pausado) return;
    const segundos = slides[i]?.duracao && slides[i].duracao > 0 ? slides[i].duracao : 6;
    const t = setTimeout(() => setI((c) => (c + 1) % total), segundos * 1000);
    return () => clearTimeout(t);
  }, [i, total, pausado, slides]);

  if (total === 0) return null;

  return (
    <section
      className="relative h-[78vh] min-h-[520px] w-full overflow-hidden bg-black"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {/* slides */}
      {slides.map((s, idx) => (
        <div key={s.id} className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? "opacity-100" : "pointer-events-none opacity-0"}`}>
          {s.videoUrl ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={s.videoUrl} autoPlay muted loop playsInline poster={s.imagemUrl ?? undefined} className="absolute inset-0 h-full w-full object-cover" />
          ) : s.imagemUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.imagemUrl}
              alt={s.titulo}
              fetchPriority={idx === 0 ? "high" : "low"}
              loading={idx === 0 ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
              style={{ animation: idx === i ? "hero-zoom 8s ease-out forwards" : "none" }}
            />
          ) : <div className="absolute inset-0 bg-neutral-800" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/35" />
        </div>
      ))}

      {/* conteúdo do slide ativo */}
      <div className="relative z-10 flex h-full flex-col justify-end pb-40 sm:pb-48">
        <div className={COL}>
          {/* key={i} reinicia as animações de entrada a cada troca de slide.
              Entrada escalonada: título → tags → botão. */}
          <div key={i} className="flex flex-col items-start">
            <h2 className="max-w-3xl text-[38px] font-bold leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-[56px]" style={{ animation: "hero-in .8s cubic-bezier(.22,1,.36,1) both", animationDelay: "80ms" }}>{slides[i].titulo}</h2>
            {slides[i].tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-3">
                {slides[i].tags.map((t, k) => (
                  <span
                    key={k}
                    className="border border-white/50 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm"
                    style={{ animation: "hero-in .6s cubic-bezier(.22,1,.36,1) both", animationDelay: `${220 + k * 90}ms` }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            {slides[i].link && (
              <Link
                href={slides[i].link!}
                className="mt-6 inline-block bg-[#e11d2a] px-9 py-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-white transition-[transform,filter,box-shadow] duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg"
                style={{ animation: "hero-in .6s cubic-bezier(.22,1,.36,1) both", animationDelay: `${260 + slides[i].tags.length * 90 + 80}ms` }}
              >
                {slides[i].botaoTexto}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* setas */}
      {total > 1 && (
        <>
          <button type="button" aria-label="Anterior" onClick={ant} className="group absolute left-4 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-white/5 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-white/80 hover:bg-white/20 sm:left-6 sm:h-14 sm:w-14">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="transition-transform duration-300 group-hover:-translate-x-0.5"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button type="button" aria-label="Próximo" onClick={prox} className="group absolute right-4 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-white/5 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-white/80 hover:bg-white/20 sm:right-6 sm:h-14 sm:w-14">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="transition-transform duration-300 group-hover:translate-x-0.5"><path d="m9 18 6-6-6-6" /></svg>
          </button>

          {/* indicadores (traços) centralizados */}
          <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {slides.map((_, k) => (
              <button
                key={k}
                type="button"
                aria-label={`Ir para o slide ${k + 1}`}
                onClick={() => setI(k)}
                className={`h-[3px] transition-all duration-300 ${k === i ? "w-9 bg-white" : "w-5 bg-white/40 hover:bg-white/70"}`}
              />
            ))}
          </div>
        </>
      )}

      <style>{"@keyframes hero-zoom{from{transform:scale(1)}to{transform:scale(1.08)}}@keyframes hero-in{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}"}</style>
    </section>
  );
}

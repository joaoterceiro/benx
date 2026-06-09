"use client";

import { useEffect, useRef, useState } from "react";

const NAVY = "#0a2a66";
const AZUL = "#0A4DCC";
const LARANJA = "#ED6B1F";

// ── Navegação por âncoras com scrollspy ───────────────────────────────────
export function AnchorNav({ itens }: { itens: { id: string; label: string }[] }) {
  const [ativo, setAtivo] = useState(itens[0]?.id ?? "");
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setAtivo(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    for (const it of itens) {
      const el = document.getElementById(it.id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, [itens]);

  // Detecta quando a barra "gruda" (sticky) para reduzir a largura.
  const [stuck, setStuck] = useState(false);
  const sentinela = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinela.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { rootMargin: "-77px 0px 0px 0px", threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const glass = { background: "rgba(18,20,24,0.6)", backdropFilter: "blur(18px) saturate(140%)", WebkitBackdropFilter: "blur(18px) saturate(140%)" };

  return (
    <>
      <div ref={sentinela} aria-hidden className="h-px w-full" />
      <nav className={`sticky top-[76px] z-30 transition-[padding] duration-300 ${stuck ? "px-4 pt-2" : "border-b border-white/10"}`} style={stuck ? undefined : glass}>
        <div className={`mx-auto flex max-w-site items-center justify-between gap-2 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${stuck ? "border border-white/10 shadow-[0_14px_34px_rgba(0,0,0,.45)]" : ""}`} style={stuck ? glass : undefined}>
        {itens.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            className="whitespace-nowrap py-4 text-[13px] font-semibold uppercase tracking-[0.05em] transition-colors hover:text-white sm:text-[15px]"
            style={{ color: ativo === it.id ? "#ffffff" : "rgba(255,255,255,0.6)" }}
          >
            {it.label}
          </a>
        ))}
        </div>
      </nav>
    </>
  );
}

// ── Carrossel horizontal (galeria, destaques) ─────────────────────────────
export function Carrossel({ children, className = "", autoplay = false, intervalMs = 3500 }: { children: React.ReactNode; className?: string; autoplay?: boolean; intervalMs?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mover = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.75, behavior: "smooth" });

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => {
      const el = ref.current;
      if (!el) return;
      const fim = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      if (fim) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: el.clientWidth * 0.5, behavior: "smooth" });
    }, intervalMs);
    return () => clearInterval(id);
  }, [autoplay, intervalMs]);

  return (
    <div className={`relative ${className}`}>
      <div ref={ref} className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      <button onClick={() => mover(-1)} aria-label="Anterior" className="absolute left-2 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center bg-[#1b2435] text-white shadow-md transition hover:bg-[#0a2a66]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
      </button>
      <button onClick={() => mover(1)} aria-label="Próximo" className="absolute right-2 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center bg-[#1b2435] text-white shadow-md transition hover:bg-[#0a2a66]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
      </button>
    </div>
  );
}

// ── Galeria: 3 por vez (desktop), autoplay, loop infinito ─────────────────
export function GaleriaCarrossel({ imagens, cols, aspect = "16 / 10" }: { imagens: { url: string; alt: string }[]; cols?: number; aspect?: string }) {
  const n = imagens.length;
  const [per, setPer] = useState(cols ?? 3);
  useEffect(() => {
    if (cols) { setPer(cols); return; }
    const calc = () => setPer(window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [cols]);

  const loop = n > per;
  const slides = loop ? [...imagens.slice(-per), ...imagens, ...imagens.slice(0, per)] : imagens;
  const [i, setI] = useState(loop ? per : 0);
  const [anim, setAnim] = useState(true);
  const sobre = useRef(false);
  const [lb, setLb] = useState<number | null>(null); // índice real aberto no lightbox
  const lbRef = useRef(false);
  const realDe = (k: number) => (loop ? (((k - per) % n) + n) % n : k);

  // pausa o autoplay enquanto o lightbox está aberto + teclado (Esc/setas)
  useEffect(() => { lbRef.current = lb !== null; }, [lb]);
  useEffect(() => {
    if (lb === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLb(null);
      else if (e.key === "ArrowRight") setLb((v) => (v === null ? v : (v + 1) % n));
      else if (e.key === "ArrowLeft") setLb((v) => (v === null ? v : (v - 1 + n) % n));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [lb, n]);

  // reposiciona ao mudar quantidade visível
  useEffect(() => { setAnim(false); setI(loop ? per : 0); }, [per, loop]);
  useEffect(() => { if (!anim) { const id = requestAnimationFrame(() => setAnim(true)); return () => cancelAnimationFrame(id); } }, [anim]);

  // autoplay (pausa no hover)
  useEffect(() => {
    if (!loop) return;
    const id = setInterval(() => { if (!sobre.current && !lbRef.current) setI((v) => v + 1); }, 4500);
    return () => clearInterval(id);
  }, [loop, n]);

  function aoFim(e: React.TransitionEvent) {
    if (e.target !== e.currentTarget || !loop) return; // ignora transições filhas (zoom)
    if (i >= n + per) { setAnim(false); setI(i - n); }
    else if (i < per) { setAnim(false); setI(i + n); }
  }

  const realIndex = loop ? (((i - per) % n) + n) % n : i;

  return (
    <div className="relative" onMouseEnter={() => (sobre.current = true)} onMouseLeave={() => (sobre.current = false)}>
      <div className="overflow-hidden">
        <div
          className="flex"
          style={{ transform: `translateX(calc(${i} * -100% / ${per}))`, transition: anim ? "transform 650ms cubic-bezier(0.22,1,0.36,1)" : "none" }}
          onTransitionEnd={aoFim}
        >
          {slides.map((g, k) => (
            <div key={k} className="group shrink-0 px-1.5" style={{ flex: `0 0 calc(100% / ${per})` }}>
              <button type="button" onClick={() => setLb(realDe(k))} className="block w-full cursor-zoom-in overflow-hidden" aria-label="Ampliar imagem">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.url} alt={g.alt} style={{ aspectRatio: aspect }} className="w-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.04]" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {loop && (
        <>
          <button onClick={() => setI((v) => v - 1)} aria-label="Anterior" className="group absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center bg-white/90 text-[#0a2a66] shadow-md transition hover:bg-white">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-0.5"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button onClick={() => setI((v) => v + 1)} aria-label="Próximo" className="group absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center bg-white/90 text-[#0a2a66] shadow-md transition hover:bg-white">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5"><path d="m9 18 6-6-6-6" /></svg>
          </button>
          <div className="mt-5 flex justify-center gap-1.5">
            {imagens.map((_, k) => (
              <button key={k} aria-label={`Ir para imagem ${k + 1}`} onClick={() => setI(per + k)}
                className="h-1 transition-all duration-300" style={{ width: k === realIndex ? 26 : 10, background: k === realIndex ? "#0A4DCC" : "#cfd4dc" }} />
            ))}
          </div>
        </>
      )}

      {/* Lightbox */}
      {lb !== null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4" onClick={() => setLb(null)}>
          <button type="button" aria-label="Fechar" onClick={() => setLb(null)} className="absolute right-5 top-5 grid h-10 w-10 place-items-center text-white/80 hover:text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
          {n > 1 && (
            <button type="button" aria-label="Anterior" onClick={(e) => { e.stopPropagation(); setLb((v) => (v === null ? v : (v - 1 + n) % n)); }} className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center text-white/80 hover:text-white">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagens[lb].url} alt={imagens[lb].alt} onClick={(e) => e.stopPropagation()} className="max-h-[88vh] max-w-[92vw] object-contain" />
          {n > 1 && (
            <button type="button" aria-label="Próximo" onClick={(e) => { e.stopPropagation(); setLb((v) => (v === null ? v : (v + 1) % n)); }} className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center text-white/80 hover:text-white">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          )}
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[13px] text-white/70">{lb + 1} / {n}</span>
        </div>
      )}
    </div>
  );
}

// ── Carrossel de pontos próximos (Localização) ────────────────────────────
export function PontosCarrossel({ pontos }: { pontos: { titulo: string; distancia: string }[] }) {
  const n = pontos.length;
  const [i, setI] = useState(0);
  const sobre = useRef(false);
  useEffect(() => {
    if (n <= 1) return;
    const id = setInterval(() => { if (!sobre.current) setI((v) => (v + 1) % n); }, 5000);
    return () => clearInterval(id);
  }, [n]);
  if (n === 0) return null;
  return (
    <div className="relative h-[260px] w-full lg:h-[280px]" onMouseEnter={() => (sobre.current = true)} onMouseLeave={() => (sobre.current = false)}>
      <div className="absolute inset-0 overflow-hidden bg-[#111]">
        <div className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" style={{ transform: `translateX(-${i * 100}%)` }}>
          {pontos.map((p, k) => (
            <div key={k} className="relative h-full w-full shrink-0">
              <div className="absolute bottom-0 left-0 right-0 bg-black/65 px-5 py-3.5 text-center text-[14px] font-medium text-white">
                {p.titulo}{p.distancia ? ` – ${p.distancia}` : ""}
              </div>
            </div>
          ))}
        </div>
      </div>
      {n > 1 && (
        <>
          <button onClick={() => setI((v) => (v - 1 + n) % n)} aria-label="Anterior" className="absolute left-3 top-1/2 grid h-[46px] w-[46px] -translate-y-1/2 place-items-center rounded-2xl bg-[#002a5c]/85 text-2xl leading-none text-white transition hover:bg-[#002a5c]">‹</button>
          <button onClick={() => setI((v) => (v + 1) % n)} aria-label="Próximo" className="absolute right-3 top-1/2 grid h-[46px] w-[46px] -translate-y-1/2 place-items-center rounded-2xl bg-[#002a5c]/85 text-2xl leading-none text-white transition hover:bg-[#002a5c]">›</button>
        </>
      )}
    </div>
  );
}

// ── Accordion (diferenciais) ──────────────────────────────────────────────
export function Accordion({ itens }: { itens: { titulo: string; descricao?: string }[] }) {
  const [aberto, setAberto] = useState<number | null>(null);
  return (
    <ul className="flex flex-col gap-2">
      {itens.map((it, i) => (
        <li key={i}>
          <button
            onClick={() => setAberto(aberto === i ? null : i)}
            className="flex w-full items-center gap-5 px-7 py-5 text-left text-[17px] font-medium text-white transition-colors sm:text-[19px]"
            style={{ background: aberto === i ? AZUL : NAVY }}
          >
            <span className="w-6 shrink-0 text-center text-2xl font-light leading-none opacity-90">{aberto === i ? "−" : "+"}</span>
            <span>{it.titulo}</span>
          </button>
          {aberto === i && it.descricao ? (
            <div className="px-7 py-4 text-[15px] leading-relaxed text-foreground-secondary">{it.descricao}</div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

// ── Compartilhar (ícones sociais com a URL da página) ─────────────────────
export function Compartilhar() {
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.href), []);
  const u = encodeURIComponent(url || "");
  const redes = [
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, d: "M14 8.5h2.5V5.5H14c-1.9 0-3 1.2-3 3V10H9v3h2v6h3v-6h2.2l.3-3H14V9c0-.4.2-.5.6-.5z" },
    { label: "WhatsApp", href: `https://wa.me/?text=${u}`, d: "M12 3a9 9 0 00-7.7 13.6L3 21l4.5-1.2A9 9 0 1012 3zm0 2a7 7 0 11-3.6 13l-.3-.2-2.4.6.6-2.3-.2-.3A7 7 0 0112 5zm3.4 8.5c-.2-.1-1-.5-1.2-.5-.2-.1-.3-.1-.4.1l-.5.6c-.1.1-.2.1-.4 0a5.6 5.6 0 01-2.6-2.3c-.1-.2 0-.3.1-.4l.3-.3.1-.3v-.3l-.5-1.2c-.1-.3-.2-.3-.4-.3h-.3a.7.7 0 00-.5.2c-.2.2-.6.6-.6 1.4s.6 1.6.7 1.7c.1.2 1.3 2 3.1 2.8 1.1.5 1.5.5 2 .4.3 0 1-.4 1.1-.8.2-.4.2-.7.1-.8l-.3-.2z" },
    { label: "X", href: `https://twitter.com/intent/tweet?url=${u}`, d: "M17 4h2.5l-5.5 6.3L20.5 20H15l-4-5.2L6.3 20H3.8l5.9-6.7L3.5 4H9l3.6 4.8L17 4z" },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, d: "M6.5 8.5v9H4v-9h2.5zM5.2 4a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM20 17.5h-2.5v-4.6c0-1.2-.5-1.8-1.4-1.8-.8 0-1.3.5-1.5 1.1-.1.2-.1.5-.1.8v4.5H11s.1-8.2 0-9h2.5v1.3c.3-.5 1-1.2 2.3-1.2 1.7 0 2.9 1.1 2.9 3.4v5.5z" },
  ];
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[12px] text-white/70">Compartilhar:</span>
      <div className="flex items-center gap-1.5">
        {redes.map((r) => (
          <a key={r.label} href={r.href} target="_blank" rel="noopener noreferrer" aria-label={`Compartilhar no ${r.label}`}
            className="grid h-7 w-7 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d={r.d} /></svg>
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Lista de plantas (accordion com imagem + specs) ───────────────────────
export interface PlantaItem {
  nome: string; metragem?: string; dormitorios?: string; suites?: string; vagas?: string; recursos: string[]; url: string | null;
}
export function PlantasLista({ plantas, tourUrl, videoUrl }: { plantas: PlantaItem[]; tourUrl?: string; videoUrl?: string }) {
  const [aberto, setAberto] = useState<number | null>(0);
  return (
    <div>
      {(tourUrl || videoUrl) && (
        <div className="mb-5 flex flex-wrap justify-end gap-2">
          {tourUrl && (
            <a href={tourUrl} target="_blank" rel="noopener noreferrer" className="rounded-md px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white" style={{ background: NAVY }}>Tour virtual</a>
          )}
          {videoUrl && (
            <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="rounded-md border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide" style={{ borderColor: NAVY, color: NAVY }}>Vídeo do andar</a>
          )}
        </div>
      )}
      <ul className="border-t border-black/10">
        {plantas.map((p, i) => {
          const specs = [
            p.metragem ? `${p.metragem} m²` : null,
            p.dormitorios ? `${p.dormitorios} dorm.` : null,
            p.suites ? `${p.suites} suíte(s)` : null,
            p.vagas ? `${p.vagas} vaga(s)` : null,
          ].filter(Boolean);
          return (
            <li key={i} className="border-b border-black/10">
              <button onClick={() => setAberto(aberto === i ? null : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left">
                <span className="text-[15px] font-semibold uppercase tracking-[0.04em] sm:text-[16px]" style={{ color: NAVY }}>{p.nome}</span>
                <span className="text-2xl font-light leading-none text-foreground-tertiary">{aberto === i ? "−" : "+"}</span>
              </button>
              {aberto === i ? (
                <div className="grid gap-5 pb-6 sm:grid-cols-[1.1fr_1fr]">
                  {p.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.url} alt={p.nome} className="w-full border border-black/10 object-contain" />
                  ) : <div className="grid aspect-[4/3] place-items-center bg-black/5 text-[12px] text-foreground-tertiary">Sem planta</div>}
                  <div>
                    {specs.length > 0 && <p className="text-[14px] font-medium text-foreground">{specs.join(" · ")}</p>}
                    {p.recursos.length > 0 && (
                      <ul className="mt-4 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                        {p.recursos.map((r, k) => (
                          <li key={k} className="flex items-start gap-3">
                            <span className="shrink-0 text-[24px] font-bold leading-none" style={{ color: LARANJA }} aria-hidden>+</span>
                            <span className="max-w-[150px] text-[16px] leading-snug text-[#333]">{r}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

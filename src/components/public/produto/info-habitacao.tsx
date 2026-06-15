"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, FileText } from "lucide-react";
import type { VarianteInfo } from "@/lib/info-habitacao";

// Atalho compacto que abre as "Informações importantes" (HIS/HMP) num modal, com
// o conteúdo em acordeão. Conteúdo já resolvido pelo server (editável no admin).
export function InfoHabitacao({ variante, cor = "#0a2a66" }: { variante?: VarianteInfo | null; cor?: string }) {
  const [aberto, setAberto] = useState(false);
  const [secao, setSecao] = useState<number | null>(null);
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setAberto(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = anterior; window.removeEventListener("keydown", onKey); };
  }, [aberto]);

  if (!variante || variante.secoes.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-site px-6 py-8">
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="group inline-flex items-center gap-3 border px-5 py-3.5 transition-colors hover:bg-black/[0.02]"
        style={{ borderColor: `${cor}33` }}
      >
        <FileText size={18} style={{ color: cor }} />
        <span className="text-[13px] font-semibold uppercase tracking-[0.04em]" style={{ color: cor }}>{variante.titulo}</span>
        <span className="ml-1 text-[16px] leading-none transition-transform duration-200 group-hover:translate-x-0.5" style={{ color: cor }} aria-hidden>→</span>
      </button>

      {montado &&
        createPortal(
          <div
            aria-hidden={!aberto}
            onClick={() => setAberto(false)}
            className={`fixed inset-0 z-[100] grid place-items-center p-4 transition-opacity duration-200 sm:p-8 ${aberto ? "opacity-100" : "pointer-events-none opacity-0"}`}
            style={{ background: "rgba(5,10,25,.55)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)" }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={variante.titulo}
              onClick={(e) => e.stopPropagation()}
              className={`flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden border border-black/10 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.4)] transition-all duration-200 ${aberto ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
            >
              <div className="flex items-start justify-between gap-4 border-b border-black/10 px-6 py-5">
                <h2 className="text-[16px] font-semibold uppercase tracking-tight sm:text-[18px]" style={{ color: cor }}>{variante.titulo}</h2>
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  aria-label="Fechar"
                  className="grid h-9 w-9 shrink-0 place-items-center border border-black/10 text-foreground-secondary transition hover:bg-black/[0.04] hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              <ul className="overflow-y-auto">
                {variante.secoes.map((s, i) => {
                  const open = secao === i;
                  return (
                    <li key={i} className="border-b border-black/10 px-6">
                      <button
                        type="button"
                        onClick={() => setSecao(open ? null : i)}
                        aria-expanded={open}
                        className="group flex w-full items-center justify-between gap-4 py-4 text-left"
                      >
                        <span className="text-[14px] font-semibold uppercase tracking-[0.03em] transition-opacity group-hover:opacity-70" style={{ color: cor }}>{s.q}</span>
                        <span className="relative inline-block h-4 w-4 shrink-0 text-foreground-tertiary transition-transform duration-300 group-hover:scale-110" aria-hidden>
                          <span className="absolute left-1/2 top-1/2 h-[1.5px] w-3.5 -translate-x-1/2 -translate-y-1/2 bg-current" />
                          <span className={`absolute left-1/2 top-1/2 h-3.5 w-[1.5px] -translate-x-1/2 -translate-y-1/2 bg-current transition-transform duration-300 ease-out ${open ? "scale-y-0" : "scale-y-100"}`} />
                        </span>
                      </button>
                      {open && (
                        <div
                          className="pb-6 text-[14px] leading-relaxed text-[#3a4760] [&_h4]:mt-5 [&_h4]:text-[13px] [&_h4]:font-semibold [&_h4]:uppercase [&_h4]:tracking-wide [&_h4]:text-foreground [&_li]:ml-5 [&_li]:mt-1.5 [&_p]:mt-3 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:mt-2 [&_ul]:list-disc"
                          dangerouslySetInnerHTML={{ __html: s.html }}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}

"use client";

import { useState } from "react";
import { infoHabitacaoPorTipo } from "@/lib/info-habitacao";

// Seção colapsável com as "Informações importantes" sobre HIS/HMP, conforme o
// tipo de habitação do empreendimento (Viva Benx). Cada pergunta é um acordeão.
export function InfoHabitacao({ tipo, cor = "#0a2a66" }: { tipo?: string | null; cor?: string }) {
  const variante = infoHabitacaoPorTipo(tipo);
  const [aberto, setAberto] = useState<number | null>(null);
  if (!variante) return null;

  return (
    <section className="mx-auto w-full max-w-site px-6 py-12">
      <h2 className="text-[20px] font-semibold uppercase tracking-tight sm:text-[24px]" style={{ color: cor }}>
        {variante.titulo}
      </h2>
      <ul className="mt-6 border-t border-black/10">
        {variante.secoes.map((s, i) => {
          const open = aberto === i;
          return (
            <li key={i} className="border-b border-black/10">
              <button
                type="button"
                onClick={() => setAberto(open ? null : i)}
                aria-expanded={open}
                className="group flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span className="text-[14px] font-semibold uppercase tracking-[0.03em] transition-opacity group-hover:opacity-70 sm:text-[15px]" style={{ color: cor }}>
                  {s.q}
                </span>
                {/* ícone +/- animado */}
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
    </section>
  );
}

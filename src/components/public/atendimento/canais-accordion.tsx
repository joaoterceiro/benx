"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Phone, Mail, MessageCircle, ArrowRight, ArrowUpRight } from "lucide-react";

const NAVY = "#0a2a66";

export interface CanalContato { tipo: "tel" | "mail" | "whats"; texto: string; href: string }
export interface CanalCta { label: string; href: string }
export interface Canal {
  label: string;
  href: string; // página completa
  resumo: string;
  obs?: string;
  contatos?: CanalContato[];
  ctas?: CanalCta[];
}

const ICONE = { tel: Phone, mail: Mail, whats: MessageCircle };
const externo = (href: string) => /^https?:/i.test(href);

export function CanaisAccordion({ canais }: { canais: Canal[] }) {
  const [aberto, setAberto] = useState<number | null>(null);

  return (
    <div className="mt-10">
      <p className="mb-4 text-[13px] text-[#8a94a6]">Toque em um canal para abrir as informações e os contatos.</p>
      <div className="border-t border-black/10">
        {canais.map((c, i) => {
        const on = aberto === i;
        return (
          <div key={c.label} className="border-b border-black/10">
            <button
              type="button"
              onClick={() => setAberto(on ? null : i)}
              aria-expanded={on}
              className={`group flex w-full items-center justify-between gap-4 px-3 py-5 text-left text-[20px] font-normal tracking-tight transition-colors sm:text-[22px] ${on ? "bg-[#0a2a66]/[0.03]" : "hover:bg-black/[0.02]"}`}
              style={{ color: NAVY }}
            >
              <span className="flex items-center gap-3">
                {c.label}
                {!on && <span className="hidden text-[12px] font-normal normal-case tracking-normal text-[#a0a8b5] transition-opacity group-hover:text-[#6b7689] sm:inline">ver detalhes</span>}
              </span>
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${on ? "border-transparent bg-[#0a2a66] text-white" : "border-[#0a2a66]/25 text-[#0a2a66] group-hover:border-[#0a2a66]/60 group-hover:bg-[#0a2a66]/[0.06]"}`}>
                <ChevronDown size={18} strokeWidth={2.2} className={`transition-transform duration-300 ${on ? "rotate-180" : ""}`} />
              </span>
            </button>

            <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <div className="max-w-2xl px-3 pb-7">
                  <p className="text-[15px] leading-relaxed text-[#5a6577]">{c.resumo}</p>
                  {c.obs && <p className="mt-2 text-[13px] text-[#8a94a6]">{c.obs}</p>}

                  {((c.ctas?.length ?? 0) > 0 || (c.contatos?.length ?? 0) > 0) && (
                    <div className="mt-5 flex flex-wrap items-center gap-2.5">
                      {c.ctas?.map((cta) => (
                        <a
                          key={cta.href}
                          href={cta.href}
                          target={externo(cta.href) ? "_blank" : undefined}
                          rel={externo(cta.href) ? "noopener noreferrer" : undefined}
                          className="inline-flex items-center gap-2 bg-[#0a2a66] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-white transition hover:brightness-125"
                        >
                          {cta.label}
                          {externo(cta.href) ? <ArrowUpRight size={15} /> : <ArrowRight size={15} />}
                        </a>
                      ))}
                      {c.contatos?.map((ct) => {
                        const Icone = ICONE[ct.tipo];
                        return (
                          <a
                            key={ct.href}
                            href={ct.href}
                            target={ct.tipo === "whats" ? "_blank" : undefined}
                            rel={ct.tipo === "whats" ? "noopener noreferrer" : undefined}
                            className="inline-flex items-center gap-2 border border-[#e3e8ef] px-4 py-2.5 text-[13px] font-medium transition hover:border-[#0a2a66]/40"
                            style={{ color: NAVY }}
                          >
                            <Icone size={15} /> {ct.texto}
                          </a>
                        );
                      })}
                    </div>
                  )}

                  <Link href={c.href} className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8a94a6] transition hover:text-[#0a2a66]">
                    Ver página completa <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { MenuItem, MenuConfig } from "@/lib/menu";

// ── Store simples de abertura (gatilho e overlay vivem separados) ─────────
let aberto = false;
const ouvintes = new Set<(v: boolean) => void>();
export function abrirMenu() { aberto = true; ouvintes.forEach((f) => f(true)); }
function fecharMenu() { aberto = false; ouvintes.forEach((f) => f(false)); }

// Ícone hambúrguer que abre o menu
export function MenuTrigger({ className = "", color = "#ffffff" }: { className?: string; color?: string }) {
  return (
    <button type="button" aria-label="Abrir menu" onClick={abrirMenu} className={`grid place-items-center ${className}`}>
      <span className="relative block h-[20px] w-7">
        <span className="absolute left-0 top-0 h-0.5 w-full rounded" style={{ background: color }} />
        <span className="absolute left-0 top-[9px] h-0.5 w-full rounded" style={{ background: color }} />
        <span className="absolute left-0 top-[18px] h-0.5 w-full rounded" style={{ background: color }} />
      </span>
    </button>
  );
}

const ChevronDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const ArrowRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export function MenuOverlay({ itens, config }: { itens: MenuItem[]; config: MenuConfig }) {
  const [open, setOpen] = useState(false);
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    const o = (v: boolean) => setOpen(v);
    ouvintes.add(o);
    setOpen(aberto);
    return () => { ouvintes.delete(o); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") fecharMenu(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div
      aria-hidden={!open}
      onClick={fecharMenu}
      className={`fixed inset-0 z-[99999] transition-[opacity,background-color] duration-500 ${open ? "visible bg-black/30 opacity-100 backdrop-blur-sm" : "invisible bg-transparent opacity-0"}`}
    >
      {/* painel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex h-full w-[88%] max-w-[420px] flex-col border-r border-white/10 shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "rgba(20,20,25,0.92)", backdropFilter: "blur(30px) saturate(140%)", WebkitBackdropFilter: "blur(30px) saturate(140%)" }}
      >
        {/* header com fechar */}
        <div className="flex items-center justify-end border-b border-white/10 bg-white/5 px-7 py-5">
          <button type="button" aria-label="Fechar menu" onClick={fecharMenu} className="group relative h-6 w-6">
            <span className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 rotate-45 bg-white/70 transition group-hover:bg-red-400" />
            <span className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 -rotate-45 bg-white/70 transition group-hover:bg-red-400" />
          </button>
        </div>

        {/* navegação */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 [scrollbar-color:rgba(255,255,255,0.25)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5 hover:[&::-webkit-scrollbar-thumb]:bg-white/35">
          <ul>
            {itens.map((it) => {
              const temFilhos = it.filhos.length > 0;
              const aberta = expandido === it.id;
              return (
                <li key={it.id} className="border-b border-white/10">
                  {temFilhos ? (
                    <button
                      type="button"
                      onClick={() => setExpandido(aberta ? null : it.id)}
                      className="flex min-h-[56px] w-full items-center justify-between px-8 py-4 text-left text-white transition hover:bg-white/10"
                      style={{ fontSize: config.rootSize, fontWeight: config.rootWeight }}
                    >
                      <span>{it.texto}</span>
                      <span className={`text-white/45 transition-transform ${aberta ? "rotate-90" : ""}`}><ChevronDown /></span>
                    </button>
                  ) : (
                    <Link
                      href={it.url}
                      onClick={fecharMenu}
                      className="group flex min-h-[56px] items-center justify-between px-8 py-4 text-white transition hover:translate-x-1 hover:bg-white/10"
                      style={{ fontSize: config.rootSize, fontWeight: config.rootWeight }}
                    >
                      <span>{it.texto}</span>
                      <span className="text-white/45 transition-all group-hover:translate-x-2 group-hover:text-white"><ArrowRight /></span>
                    </Link>
                  )}
                  {/* subitens (acordeão) */}
                  {temFilhos && (
                    <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ${aberta ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
                      <ul className="my-2 mx-2 rounded-lg border border-white/10 bg-white/5 py-1">
                        {it.filhos.map((f) => (
                          <li key={f.id}>
                            <Link
                              href={f.url}
                              onClick={fecharMenu}
                              className="group flex min-h-[45px] items-center justify-between border-l-[3px] border-[#002a5c]/60 py-3 pl-12 pr-6 text-white/75 transition hover:translate-x-0.5 hover:border-[#002a5c] hover:bg-white/10 hover:text-white"
                              style={{ fontSize: config.subSize, fontWeight: config.subWeight }}
                            >
                              <span>{f.texto}</span>
                              <span className="text-white/40 group-hover:text-white"><ArrowRight /></span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* footer */}
        <div className="border-t border-white/10 bg-white/5 px-6 py-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={config.footerLogo} alt={config.footerTitulo} className="mb-3 h-7 w-auto object-contain" />
          <h3 className="text-[14px] font-semibold text-white">{config.footerTitulo}</h3>
          <p className="mt-1.5 whitespace-pre-line text-[11px] leading-relaxed text-white/45">{config.footerContato}</p>
        </div>
      </div>
    </div>
  );
}

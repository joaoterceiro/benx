"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type IconName = "whatsapp" | "phone" | "mail";

export interface ContactChannel {
  id: string;
  sup: string;
  main: string;
  icon: IconName;
  href: string;
}

// Ícones (paths das marcas, iguais aos do painel de canais de vendas).
const PATHS: Record<IconName, string> = {
  phone:
    "M6.6 10.8a15.6 15.6 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.3 1l-2.1 2.2z",
  whatsapp:
    "M12 3a9 9 0 00-7.7 13.6L3 21l4.5-1.2A9 9 0 1012 3zm0 2a7 7 0 11-3.6 13l-.3-.2-2.4.6.6-2.3-.2-.3A7 7 0 0112 5zm3.4 8.5c-.2-.1-1-.5-1.2-.5-.2-.1-.3-.1-.4.1l-.5.6c-.1.1-.2.1-.4 0a5.6 5.6 0 01-2.6-2.3c-.1-.2 0-.3.1-.4l.3-.3.1-.3v-.3l-.5-1.2c-.1-.3-.2-.3-.4-.3h-.3a.7.7 0 00-.5.2c-.2.2-.6.6-.6 1.4s.6 1.6.7 1.7c.1.2 1.3 2 3.1 2.8 1.1.5 1.5.5 2 .4.3 0 1-.4 1.1-.8.2-.4.2-.7.1-.8l-.3-.2z",
  mail: "M4 5h16c.6 0 1 .4 1 1v12c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1V6c0-.6.4-1 1-1zm8 7L5.2 7h13.6L12 12zm0 2.2L5 9v8h14V9l-7 5.2z",
};

function ehExterno(c: ContactChannel) {
  return c.icon === "whatsapp" || /^https?:/i.test(c.href);
}

/**
 * Launcher único de atendimento (substitui o botão flutuante do WhatsApp e a aba
 * "Canais de vendas"). Pílula fixa no canto inferior direito que abre um painel
 * com os canais + um telefone secundário (phone2) e o status da equipe.
 */
export function ContactLauncher({
  channels,
  phone2,
  phone2Label = "Canal de Atendimento",
  phone2Hours,
  statusText = "Online",
}: {
  channels: ContactChannel[];
  phone2?: string;
  phone2Label?: string;
  phone2Hours?: string;
  statusText?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  // Esc fecha.
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setAberto(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto]);

  const tel2 = phone2 ? `tel:${phone2.replace(/\D/g, "")}` : undefined;

  return (
    <>
      {/* Pílula flutuante */}
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-label={aberto ? "Fechar atendimento" : "Abrir canais de atendimento"}
        aria-expanded={aberto}
        aria-haspopup="dialog"
        className="group fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-full bg-[#0a2a66] py-2 pl-2 pr-5 text-white shadow-[0_10px_30px_rgba(10,42,102,0.45)] ring-1 ring-white/10 transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#0a4dcc]"
      >
        <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10 transition-transform group-hover:scale-105">
          {aberto ? (
            <X size={22} />
          ) : (
            <svg width="24" height="24" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M224,200v8a32,32,0,0,1-32,32H136" />
              <path d="M224,128H192a16,16,0,0,0-16,16v40a16,16,0,0,0,16,16h32V128a96,96,0,1,0-192,0v56a16,16,0,0,0,16,16H64a16,16,0,0,0,16-16V144a16,16,0,0,0-16-16H32" />
            </svg>
          )}
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[14px] font-semibold">Atendimento</span>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-white/75">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
            Fale com a gente
          </span>
        </span>
      </button>

      {montado &&
        createPortal(
          <div
            aria-hidden={!aberto}
            onClick={() => setAberto(false)}
            className={`fixed inset-0 z-[59] transition-opacity duration-300 ${aberto ? "opacity-100" : "pointer-events-none opacity-0"}`}
            style={{ background: "rgba(5,10,25,.5)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)" }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Canais de atendimento"
              onClick={(e) => e.stopPropagation()}
              className={`fixed bottom-24 right-5 flex w-[380px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b1322] text-white shadow-[0_30px_80px_rgba(0,0,0,0.6)] transition-all duration-300 ease-[cubic-bezier(.32,.72,0,1)] ${aberto ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 pb-5 pt-6">
                <div>
                  <h2 className="text-[20px] font-semibold leading-tight">Fale com a gente</h2>
                  {statusText && (
                    <p className="mt-1.5 flex items-center gap-2 text-[12px] font-medium text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
                      {statusText}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  aria-label="Fechar"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/15 bg-white/[0.06] text-white/70 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Canais */}
              <div className="flex flex-col gap-1 px-4 py-4">
                {channels.map((c) => {
                  const externo = ehExterno(c);
                  return (
                    <a
                      key={c.id}
                      href={c.href}
                      target={externo ? "_blank" : undefined}
                      rel={externo ? "noopener noreferrer" : undefined}
                      className="group flex items-center gap-4 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-white/[0.05]"
                    >
                      <span
                        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white shadow-[0_4px_14px_rgba(10,77,204,0.35)] transition-transform duration-300 group-hover:scale-105 ${c.icon === "whatsapp" ? "bg-[#25D366]" : "bg-[#0a4dcc]"}`}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <path d={PATHS[c.icon]} />
                        </svg>
                      </span>
                      <span className="min-w-0 leading-tight">
                        <span className="block text-[12px] font-light text-white/60">{c.sup}</span>
                        <span className="block truncate text-[17px] font-semibold">{c.main}</span>
                      </span>
                      <svg className="ml-auto shrink-0 text-white/30 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white/60" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </a>
                  );
                })}
              </div>

              {/* Telefone secundário */}
              {phone2 && (
                <div className="border-t border-white/10 bg-white/[0.02] px-6 py-5">
                  <p className="text-[12px] font-light text-white/60">{phone2Label}</p>
                  <a href={tel2} className="mt-0.5 block text-[18px] font-semibold transition-colors hover:text-white/80">
                    {phone2}
                  </a>
                  {phone2Hours && <p className="mt-1 text-[12px] font-light text-white/45">{phone2Hours}</p>}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

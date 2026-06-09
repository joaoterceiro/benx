"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// Canais de vendas Benx (constantes de marca, iguais à página /vendas).
const CANAIS = [
  {
    sup: "Central de vendas",
    main: "0800 729 1981",
    href: "tel:08007291981",
    externo: false,
    // telefone
    d: "M6.6 10.8a15.6 15.6 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.3 1l-2.1 2.2z",
  },
  {
    sup: "Vendas via",
    main: "WHATSAPP",
    href: "https://wa.me/5511944431066?text=Ol%C3%A1%2C%20vi%20o%20Portal%20Benx%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es.",
    externo: true,
    d: "M12 3a9 9 0 00-7.7 13.6L3 21l4.5-1.2A9 9 0 1012 3zm0 2a7 7 0 11-3.6 13l-.3-.2-2.4.6.6-2.3-.2-.3A7 7 0 0112 5zm3.4 8.5c-.2-.1-1-.5-1.2-.5-.2-.1-.3-.1-.4.1l-.5.6c-.1.1-.2.1-.4 0a5.6 5.6 0 01-2.6-2.3c-.1-.2 0-.3.1-.4l.3-.3.1-.3v-.3l-.5-1.2c-.1-.3-.2-.3-.4-.3h-.3a.7.7 0 00-.5.2c-.2.2-.6.6-.6 1.4s.6 1.6.7 1.7c.1.2 1.3 2 3.1 2.8 1.1.5 1.5.5 2 .4.3 0 1-.4 1.1-.8.2-.4.2-.7.1-.8l-.3-.2z",
  },
  {
    sup: "Vendas por",
    main: "E-MAIL",
    href: "mailto:relacionamento@benx.com.br",
    externo: false,
    d: "M4 5h16c.6 0 1 .4 1 1v12c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1V6c0-.6.4-1 1-1zm8 7L5.2 7h13.6L12 12zm0 2.2L5 9v8h14V9l-7 5.2z",
  },
];

export function CanaisVendas() {
  const [aberto, setAberto] = useState(false);

  // Trava o scroll + Esc fecha.
  useEffect(() => {
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setAberto(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = anterior; window.removeEventListener("keydown", onKey); };
  }, [aberto]);

  return (
    <>
      {/* Aba fixa à direita, no centro vertical */}
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label="Abrir canais de vendas"
        className="group fixed right-0 top-1/2 z-40 flex -translate-y-1/2 items-center gap-2 bg-[#0a2a66] px-3 py-6 text-[14px] font-semibold uppercase tracking-[0.22em] text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-[background-color,box-shadow,padding] duration-300 ease-out hover:bg-[#0a4dcc] hover:px-4 hover:shadow-[0_14px_36px_rgba(10,77,204,0.5)]"
        style={{ writingMode: "vertical-rl" }}
      >
        <span className="h-2 w-2 rounded-full bg-white/80 transition-transform duration-300 group-hover:scale-125" aria-hidden />
        Canais de vendas
      </button>

      <Painel aberto={aberto} onClose={() => setAberto(false)} />
    </>
  );
}

function Painel({ aberto, onClose }: { aberto: boolean; onClose: () => void }) {
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  if (!montado) return null;

  return createPortal(
    <div
      aria-hidden={!aberto}
      onClick={onClose}
      className={`fixed inset-0 z-[2147483000] transition-[opacity,visibility] duration-300 ${aberto ? "visible opacity-100" : "invisible opacity-0"}`}
      style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", pointerEvents: aberto ? "auto" : "none" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Canais de vendas"
        onClick={(e) => e.stopPropagation()}
        className={`fixed left-1/2 top-1/2 flex w-[480px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 flex-col border border-white/10 bg-[#0b1322] px-9 py-11 text-white shadow-[0_30px_80px_rgba(0,0,0,0.6)] transition-all duration-300 ease-[cubic-bezier(.32,.72,0,1)] ${aberto ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-5 top-5 grid h-10 w-10 place-items-center border border-white/15 bg-white/[0.06] text-white/70 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>

        <h2 className="text-[32px] font-light leading-[1.1] tracking-tight text-white sm:text-[38px]">
          Nossos canais<br />de vendas
        </h2>

        <div className="mt-9 flex flex-col gap-5">
          {CANAIS.map((c) => (
            <a
              key={c.main}
              href={c.href}
              target={c.externo ? "_blank" : undefined}
              rel={c.externo ? "noopener noreferrer" : undefined}
              className="group flex items-center gap-4 rounded-lg px-2 py-1.5 -mx-2 transition-colors duration-200 hover:bg-white/[0.04]"
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-[#0a4dcc] text-white shadow-[0_4px_14px_rgba(10,77,204,0.35)] transition-[transform,background-color,box-shadow] duration-300 ease-out group-hover:scale-105 group-hover:bg-[#0a3a8f] group-hover:shadow-[0_8px_22px_rgba(10,77,204,0.55)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="transition-transform duration-300 group-hover:scale-110"><path d={c.d} /></svg>
              </span>
              <span className="leading-tight transition-transform duration-300 ease-out group-hover:translate-x-1">
                <span className="block text-[14px] font-light text-white/70 transition-colors group-hover:text-white/90">{c.sup}</span>
                <span className="block text-[20px] font-medium text-white">{c.main}</span>
              </span>
            </a>
          ))}
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-[14px] font-light text-white/70">Canal de Atendimento</p>
          <a href="tel:40038503" className="mt-0.5 block text-[20px] font-medium text-white transition-colors hover:text-white/80">4003-8503</a>
          <p className="mt-1 text-[13px] font-light text-white/55">Horário de funcionamento das 9:00 às 17:00</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

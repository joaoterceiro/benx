"use client";

import { useState } from "react";

// Barra de compartilhamento da matéria (WhatsApp, Facebook, X, LinkedIn + copiar link).
export function CompartilharBarra({ url, titulo }: { url: string; titulo: string }) {
  const [copiado, setCopiado] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(titulo);

  const redes = [
    { nome: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}`, icon: IconWhats },
    { nome: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: IconFace },
    { nome: "X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, icon: IconX },
    { nome: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, icon: IconIn },
  ];

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      /* clipboard indisponível: ignora silenciosamente */
    }
  }

  const botao = "grid h-10 w-10 place-items-center rounded-full border border-black/10 text-[#0A2A66] transition hover:border-[#0A2A66] hover:bg-[#0A2A66] hover:text-white";

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-black/45">Compartilhar</span>
      {redes.map((r) => {
        const Icone = r.icon;
        return (
          <a key={r.nome} href={r.href} target="_blank" rel="noopener noreferrer" aria-label={`Compartilhar no ${r.nome}`} className={botao}>
            <Icone />
          </a>
        );
      })}
      <button type="button" onClick={copiar} aria-label="Copiar link" className={botao}>
        {copiado ? <IconCheck /> : <IconLink />}
      </button>
    </div>
  );
}

const IconWhats = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 3a9 9 0 00-7.7 13.6L3 21l4.5-1.2A9 9 0 1012 3zm0 2a7 7 0 11-3.6 13l-.3-.2-2.4.6.6-2.3-.2-.3A7 7 0 0112 5zm3.4 8.5c-.2-.1-1-.5-1.2-.5-.2-.1-.3-.1-.4.1l-.5.6c-.1.1-.2.1-.4 0a5.6 5.6 0 01-2.6-2.3c-.1-.2 0-.3.1-.4l.3-.3.1-.3v-.3l-.5-1.2c-.1-.3-.2-.3-.4-.3h-.3a.7.7 0 00-.5.2c-.2.2-.6.6-.6 1.4s.6 1.6.7 1.7c.1.2 1.3 2 3.1 2.8 1.1.5 1.5.5 2 .4.3 0 1-.4 1.1-.8.2-.4.2-.7.1-.8l-.3-.2z" />
  </svg>
);
const IconFace = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M13.5 21v-7h2.3l.4-2.7h-2.7V9.5c0-.8.2-1.3 1.4-1.3h1.4V5.8c-.7-.1-1.4-.1-2.1-.1-2 0-3.4 1.2-3.4 3.5v1.9H8.5V14h2.3v7h2.7z" />
  </svg>
);
const IconX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18.2 3h3.3l-7.2 8.2L23 21h-6.6l-5.2-6.8L5.3 21H2l7.7-8.8L1.5 3h6.8l4.7 6.2L18.2 3zm-1.2 16h1.8L7.1 4.8H5.2L17 19z" />
  </svg>
);
const IconIn = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M6.9 8.8H3.8V21h3.1V8.8zM5.3 3.5a1.8 1.8 0 100 3.6 1.8 1.8 0 000-3.6zM21 21v-6.7c0-3.2-.7-5.6-4.4-5.6-1.8 0-3 1-3.4 1.9h-.1V8.8H10V21h3.1v-6c0-1.6.3-3.1 2.3-3.1 1.9 0 2 1.8 2 3.2V21H21z" />
  </svg>
);
const IconLink = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.5 1.5" />
    <path d="M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7l1.5-1.5" />
  </svg>
);
const IconCheck = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

"use client";

import { useEffect, useRef, useState } from "react";

interface Opt { value: string; label: string }

// Select customizado (painel estilizável) que alimenta um input oculto para o
// submit do form GET da barra de busca.
export function FiltroSelect({
  name, placeholder, options, defaultValue = "",
}: {
  name: string;
  placeholder: string;
  options: Opt[];
  defaultValue?: string;
}) {
  const [open, setOpen] = useState(false);
  const [valor, setValor] = useState(defaultValue);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const atual = options.find((o) => o.value === valor);

  return (
    <div ref={ref} className={`relative ${open ? "z-50" : "z-10"}`}>
      <input type="hidden" name={name} value={valor} />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center justify-between gap-3 border border-white/25 bg-white/10 px-4 text-left text-[14px] text-white transition hover:border-white/40 sm:w-52"
        style={open ? { borderColor: "rgba(255,255,255,.6)", background: "rgba(255,255,255,.16)" } : undefined}
      >
        <span className="truncate">{atual ? atual.label : placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`shrink-0 text-white/70 transition-transform ${open ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 max-h-[320px] w-[260px] max-w-[80vw] overflow-y-auto border border-black/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,.25)]">
          <Item ativo={valor === ""} onClick={() => { setValor(""); setOpen(false); }}>{placeholder}</Item>
          {options.map((o) => (
            <Item key={o.value} ativo={valor === o.value} onClick={() => { setValor(o.value); setOpen(false); }}>{o.label}</Item>
          ))}
        </div>
      )}
    </div>
  );
}

function Item({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full px-4 py-2.5 text-left text-[14px] transition ${ativo ? "bg-[#0A2A66] text-white" : "text-[#1a1a1a] hover:bg-[#0A2A66] hover:text-white"}`}
    >
      {children}
    </button>
  );
}

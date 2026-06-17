"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export interface ConfirmOpts {
  titulo: string;
  descricao?: string;
  palavra?: string; // palavra a digitar (default "EXCLUIR")
  confirmLabel?: string; // texto do botão (default "Excluir")
  digitar?: boolean; // exige digitar a palavra para confirmar (default true)
  tom?: "perigo" | "neutro"; // estilo: destrutivo (vermelho) ou neutro (default "perigo")
}

type ConfirmFn = (opts: ConfirmOpts) => Promise<boolean>;

const ConfirmCtx = createContext<ConfirmFn>(async () => false);

export function useConfirm(): ConfirmFn {
  return useContext(ConfirmCtx);
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOpts | null>(null);
  const [texto, setTexto] = useState("");
  const resolver = useRef<((v: boolean) => void) | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const confirmar = useCallback<ConfirmFn>((o) => {
    setTexto("");
    setOpts(o);
    return new Promise<boolean>((res) => { resolver.current = res; });
  }, []);

  const fechar = useCallback((v: boolean) => {
    resolver.current?.(v);
    resolver.current = null;
    setOpts(null);
    setTexto("");
  }, []);

  const palavra = (opts?.palavra ?? "EXCLUIR").toUpperCase();
  const exigeTexto = opts?.digitar ?? true;
  const neutro = opts?.tom === "neutro";
  const valido = exigeTexto ? texto.trim().toUpperCase() === palavra : true;

  // Foco no input (se houver) + trava scroll + Esc fecha + Enter confirma.
  useEffect(() => {
    if (!opts) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar(false);
      if (e.key === "Enter" && !exigeTexto) fechar(true);
    };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); document.body.style.overflow = anterior; window.removeEventListener("keydown", onKey); };
  }, [opts, fechar, exigeTexto]);

  return (
    <ConfirmCtx.Provider value={confirmar}>
      {children}

      {opts && (
        <div
          className="fixed inset-0 z-[2147483600] grid place-items-center p-4"
          style={{ background: "rgba(0,0,0,.5)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
          onClick={() => fechar(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label={opts.titulo}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 text-foreground shadow-[0_28px_64px_rgba(0,0,0,0.65)]"
            style={{ background: "#1b1b1f" }}
          >
            <div className="flex items-start gap-3 px-6 pt-6">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={neutro ? { background: "rgba(45,107,228,0.16)", color: "#7AA7F5" } : { background: "rgba(225,29,42,0.14)", color: "#F2555A" }}>
                <AlertTriangle size={20} strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[16px] font-semibold leading-tight">{opts.titulo}</h2>
                {opts.descricao && <p className="mt-1.5 text-[13px] leading-relaxed text-foreground-secondary">{opts.descricao}</p>}
              </div>
              <button type="button" aria-label="Fechar" onClick={() => fechar(false)} className="grid h-8 w-8 place-items-center rounded-lg text-foreground-tertiary transition hover:bg-white/[0.07] hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            {exigeTexto && (
              <div className="px-6 pb-2 pt-5">
                <label className="text-[12px] text-foreground-secondary">
                  Digite <span className="font-bold text-foreground">{palavra}</span> para confirmar.
                </label>
                <input
                  ref={inputRef}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && valido) fechar(true); }}
                  placeholder={palavra}
                  autoComplete="off"
                  spellCheck={false}
                  className="mt-2 h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 text-[14px] tracking-wide text-foreground outline-none transition focus:border-[#E11D2A]/60 focus:bg-white/[0.06]"
                />
              </div>
            )}

            <div className={`flex justify-end gap-3 px-6 pb-6 ${exigeTexto ? "pt-4" : "pt-5"}`}>
              <button
                type="button"
                onClick={() => fechar(false)}
                className="rounded-lg border border-white/12 bg-white/[0.04] px-5 py-2.5 text-[13px] font-medium text-foreground-secondary transition hover:bg-white/10 hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!valido}
                onClick={() => fechar(true)}
                className="rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                style={
                  neutro
                    ? { background: valido ? "#2D6BE4" : "#1f3f7a", boxShadow: valido ? "0 4px 18px rgba(45,107,228,0.45)" : "none" }
                    : { background: valido ? "#E11D2A" : "#7a1f25", boxShadow: valido ? "0 4px 18px rgba(225,29,42,0.45)" : "none" }
                }
              >
                {opts.confirmLabel ?? "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}

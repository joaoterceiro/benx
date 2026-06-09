"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Cookie } from "lucide-react";
import { POLITICA_VERSAO } from "@/lib/legal-version";
import { registrarConsentimento } from "@/actions/consentimento";

const CHAVE = "benx_cookie_consent";
export const EVENTO_GERENCIAR = "benx:gerenciar-cookies";
const GLASS = {
  background: "rgba(20,20,25,0.92)",
  backdropFilter: "blur(30px) saturate(140%)",
  WebkitBackdropFilter: "blur(30px) saturate(140%)",
} as const;

type Acao = "aceitar_todos" | "recusar" | "personalizado";
interface Estado { versao: string; necessarios: true; analiticos: boolean; marketing: boolean; acao: Acao; ts: number }

function lerEstado(): Estado | null {
  try {
    const raw = localStorage.getItem(CHAVE);
    if (!raw) return null;
    return JSON.parse(raw) as Estado;
  } catch { return null; }
}

export function CookieConsent({ cookiesTexto, politicaHtml }: { cookiesTexto: string; politicaHtml: string }) {
  const [visivel, setVisivel] = useState(false);
  const [modal, setModal] = useState(false); // modal de política
  const [gerenciar, setGerenciar] = useState(false); // modal de preferências
  const [analiticos, setAnaliticos] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Aplica as preferências: persiste, propaga p/ scripts e registra no servidor.
  const aplicar = useCallback((an: boolean, mk: boolean, acao: Acao) => {
    const estado: Estado = { versao: POLITICA_VERSAO, necessarios: true, analiticos: an, marketing: mk, acao, ts: Date.now() };
    try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch {}
    // Gating de scripts: estado global + evento para analytics/marketing tags.
    (window as unknown as { __benxConsent?: Estado }).__benxConsent = estado;
    window.dispatchEvent(new CustomEvent("benx:consent", { detail: estado }));
    setVisivel(false);
    setGerenciar(false);
    // Registro no servidor (prova do consentimento) — não bloqueia a UI.
    void registrarConsentimento({ versao: POLITICA_VERSAO, analiticos: an, marketing: mk, acao });
  }, []);

  useEffect(() => {
    const e = lerEstado();
    if (!e || e.versao !== POLITICA_VERSAO) {
      setVisivel(true);
    } else {
      setAnaliticos(e.analiticos); setMarketing(e.marketing);
      (window as unknown as { __benxConsent?: Estado }).__benxConsent = e;
    }
    // Reabrir o gerenciador pelo link do rodapé.
    const abrir = () => {
      const at = lerEstado();
      setAnaliticos(at?.analiticos ?? false);
      setMarketing(at?.marketing ?? false);
      setGerenciar(true);
    };
    window.addEventListener(EVENTO_GERENCIAR, abrir);
    return () => window.removeEventListener(EVENTO_GERENCIAR, abrir);
  }, []);

  // Trava o scroll com qualquer modal aberto.
  useEffect(() => {
    const aberto = modal || gerenciar;
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setModal(false); setGerenciar(false); } };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = anterior; window.removeEventListener("keydown", onKey); };
  }, [modal, gerenciar]);

  const btnPrim = "bg-white px-6 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#14141a] transition hover:bg-white/85";
  const btnSec = "border border-white/20 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/85 transition hover:border-white/40 hover:bg-white/10 hover:text-white";
  const btnGhost = "px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/60 transition hover:bg-white/10 hover:text-white";

  return (
    <>
      {/* ── Banner de cookies (glass, inferior) ── */}
      <div className={`fixed inset-x-0 bottom-0 z-[2147482000] transition-all duration-[350ms] ease-[cubic-bezier(.32,.72,0,1)] ${visivel ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"}`}>
        <div className="mx-auto m-3 max-w-5xl overflow-hidden border border-white/12 text-white shadow-[0_24px_60px_rgba(0,0,0,.6)] sm:m-4" style={GLASS}>
          <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:gap-8">
            <div className="flex items-start gap-3.5 lg:flex-1">
              <span className="grid h-10 w-10 shrink-0 place-items-center bg-white/10 text-white/90 ring-1 ring-white/15">
                <Cookie size={20} strokeWidth={1.8} />
              </span>
              <p className="self-center text-[13px] leading-relaxed text-white/80">
                {cookiesTexto}{" "}
                <button type="button" onClick={() => setModal(true)} className="font-semibold text-white underline underline-offset-2 transition hover:text-white/70">
                  Política de Privacidade
                </button>
                .
              </p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end lg:shrink-0">
              <button type="button" onClick={() => setGerenciar(true)} className={btnGhost}>Personalizar</button>
              <button type="button" onClick={() => aplicar(false, false, "recusar")} className={btnSec}>Recusar</button>
              <button type="button" onClick={() => aplicar(true, true, "aceitar_todos")} className={btnPrim}>Aceitar todos</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal: Gerenciar preferências de cookies ── */}
      <Overlay aberto={gerenciar} onClose={() => setGerenciar(false)} label="Preferências de cookies">
        <header className="flex shrink-0 items-center justify-between border-b border-white/[0.08] bg-white/[0.05] px-6 py-[18px]">
          <h2 className="text-[15px] font-semibold uppercase tracking-[0.12em] text-white">Preferências de cookies</h2>
          <BotaoFechar onClick={() => setGerenciar(false)} />
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <Categoria titulo="Necessários" descricao="Essenciais para o funcionamento do site. Sempre ativos." ativo bloqueado />
          <Categoria titulo="Analíticos" descricao="Ajudam a medir audiência e melhorar a navegação." ativo={analiticos} onToggle={() => setAnaliticos((v) => !v)} />
          <Categoria titulo="Marketing" descricao="Permitem personalização de conteúdo e anúncios." ativo={marketing} onToggle={() => setMarketing((v) => !v)} />
        </div>
        <footer className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-white/[0.08] bg-white/[0.05] px-6 py-4">
          <button type="button" onClick={() => aplicar(false, false, "recusar")} className={btnSec}>Recusar todos</button>
          <button type="button" onClick={() => aplicar(analiticos, marketing, "personalizado")} className={btnPrim}>Salvar preferências</button>
        </footer>
      </Overlay>

      {/* ── Modal: Política de Privacidade ── */}
      <Overlay aberto={modal} onClose={() => setModal(false)} label="Política de Privacidade">
        <header className="flex shrink-0 items-center justify-between border-b border-white/[0.08] bg-white/[0.05] px-6 py-[18px]">
          <h2 className="text-[15px] font-semibold uppercase tracking-[0.12em] text-white">Política de Privacidade</h2>
          <BotaoFechar onClick={() => setModal(false)} />
        </header>
        <div
          className="overflow-y-auto px-6 py-6 text-[14px] leading-[1.8] text-white/75 [&_a]:text-white [&_a]:underline [&_em]:text-white/55 [&_h2]:mt-6 [&_h2]:text-[13px] [&_h2]:font-semibold [&_h2]:uppercase [&_h2]:tracking-[0.1em] [&_h2]:text-white [&_h3]:mt-6 [&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-[0.1em] [&_h3]:text-white [&_h3:first-child]:mt-0 [&_li]:mt-1.5 [&_p+p]:mt-4 [&_strong]:text-white [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: politicaHtml }}
        />
        <footer className="flex shrink-0 justify-end gap-3 border-t border-white/[0.08] bg-white/[0.05] px-6 py-4">
          <button type="button" onClick={() => { setModal(false); setGerenciar(true); }} className={btnSec}>Gerenciar cookies</button>
          <button type="button" onClick={() => aplicar(true, true, "aceitar_todos")} className={btnPrim}>Aceitar e fechar</button>
        </footer>
      </Overlay>
    </>
  );
}

function Overlay({ aberto, onClose, label, children }: { aberto: boolean; onClose: () => void; label: string; children: React.ReactNode }) {
  return (
    <div
      aria-hidden={!aberto}
      onClick={onClose}
      className={`fixed inset-0 z-[2147483000] transition-[opacity,visibility] duration-300 ${aberto ? "visible opacity-100" : "invisible opacity-0"}`}
      style={{ background: "rgba(0,0,0,.35)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", pointerEvents: aberto ? "auto" : "none" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className={`fixed inset-x-0 bottom-0 top-0 flex flex-col text-white transition-all duration-[350ms] ease-[cubic-bezier(.32,.72,0,1)] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[85vh] sm:w-[680px] sm:max-w-[94vw] sm:-translate-x-1/2 sm:border sm:border-white/15 ${aberto ? "translate-y-0 sm:-translate-y-1/2 sm:scale-100 sm:opacity-100" : "translate-y-full sm:-translate-y-[48%] sm:scale-95 sm:opacity-0"}`}
        style={GLASS}
      >
        {children}
      </div>
    </div>
  );
}

function BotaoFechar({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" aria-label="Fechar" onClick={onClick} className="grid h-11 w-11 place-items-center border border-white/[0.12] bg-white/[0.08] text-white/70 transition hover:border-red-500 hover:bg-red-500 hover:text-white">
      <X size={18} />
    </button>
  );
}

function Categoria({ titulo, descricao, ativo, bloqueado, onToggle }: { titulo: string; descricao: string; ativo: boolean; bloqueado?: boolean; onToggle?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] py-4 last:border-0">
      <div>
        <p className="text-[14px] font-semibold text-white">{titulo}</p>
        <p className="mt-1 text-[12px] leading-relaxed text-white/55">{descricao}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={ativo}
        aria-label={titulo}
        disabled={bloqueado}
        onClick={onToggle}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${ativo ? "bg-white" : "bg-white/20"} ${bloqueado ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full transition-transform ${ativo ? "translate-x-[22px] bg-[#14141a]" : "translate-x-0.5 bg-white"}`} />
      </button>
    </div>
  );
}

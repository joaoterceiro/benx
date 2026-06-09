"use client";

import { useEffect, useState } from "react";

// ── Pub/sub do "contexto" (nome do empreendimento) ────────────────────────
// O widget vive no layout raiz; a página de produto injeta o nome aqui para
// pré-preencher a mensagem do WhatsApp ({empreendimento}).
let contextoAtual = "";
const ouvintes = new Set<(v: string) => void>();
function definirContexto(v: string) {
  contextoAtual = v;
  ouvintes.forEach((o) => o(v));
}
export function WhatsAppContexto({ nome }: { nome: string }) {
  useEffect(() => {
    definirContexto(nome);
    return () => definirContexto("");
  }, [nome]);
  return null;
}

function montarMensagem(template: string, empreendimento: string): string {
  if (!template) return "";
  if (template.includes("{empreendimento}")) {
    return empreendimento
      ? template.replace(/\{empreendimento\}/g, empreendimento)
      : template
          .replace(/\s*(no|na|do|da)?\s*\{empreendimento\}/gi, "")
          .replace(/\s{2,}/g, " ")
          .trim();
  }
  return template;
}

export function WhatsAppFloat({
  numero,
  texto,
  mensagem,
  ativo,
}: {
  numero: string;
  texto: string;
  mensagem: string;
  ativo: boolean;
}) {
  const [ctx, setCtx] = useState("");
  useEffect(() => {
    const o = (v: string) => setCtx(v);
    ouvintes.add(o);
    setCtx(contextoAtual);
    return () => { ouvintes.delete(o); };
  }, []);

  const digits = (numero ?? "").replace(/\D/g, "");
  if (!ativo || !digits) return null;

  const msg = montarMensagem(mensagem, ctx);
  const href = `https://wa.me/${digits}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale agora no WhatsApp"
      className="group fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-full bg-[#0b141a]/95 py-2 pl-2 pr-5 shadow-xl ring-1 ring-[#25D366]/50 backdrop-blur-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:ring-2 hover:ring-[#25D366]"
    >
      <ConteudoPilula texto={texto} />
    </a>
  );
}

// Conteúdo visual da pílula (ícone + textos), compartilhado com a prévia.
function ConteudoPilula({ texto }: { texto: string }) {
  return (
    <>
      <span className="grid h-11 w-11 place-items-center rounded-full bg-[#25D366] shadow-sm transition-transform group-hover:scale-105">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[14px] font-semibold text-white">Fale agora</span>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#25D366]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#25D366] motion-safe:animate-pulse" />
          {texto || "Online · responde em minutos"}
        </span>
      </span>
    </>
  );
}

// Prévia estática usada no admin (reflete a configuração ao vivo).
export function WhatsAppPreview({ numero, texto, mensagem, ativo }: { numero: string; texto: string; mensagem: string; ativo: boolean }) {
  const digits = (numero ?? "").replace(/\D/g, "");
  const inativo = !ativo || !digits;
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground-tertiary">Prévia</p>
      <div className="mt-3 grid place-items-center rounded-lg bg-[#0e1320] py-7">
        <div className={`flex items-center gap-3 rounded-full bg-[#0b141a]/95 py-2 pl-2 pr-5 shadow-xl ring-1 ring-[#25D366]/50 ${inativo ? "opacity-40 grayscale" : ""}`}>
          <ConteudoPilula texto={texto} />
        </div>
      </div>
      <div className="mt-3 space-y-1 text-[12px] text-foreground-secondary">
        {!ativo && <p>Status: <b>desativado</b> — não aparece no site.</p>}
        {ativo && !digits && <p>Informe o número para o botão aparecer.</p>}
        {ativo && digits && <p>Link: <code>wa.me/{digits}</code></p>}
        {ativo && digits && mensagem && (
          <p>Mensagem (produto): <span className="text-foreground">&quot;{montarMensagem(mensagem, "LED Vila")}&quot;</span></p>
        )}
      </div>
    </div>
  );
}

// ── Botão "voltar ao topo" (↑), aparece após rolar a página ───────────────
export function BackToTop() {
  const [visivel, setVisivel] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisivel(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visivel) return null;
  return (
    <button
      type="button"
      aria-label="Voltar ao topo"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-5 left-5 z-[60] grid h-11 w-11 place-items-center rounded-full bg-[#0b141a]/90 text-white shadow-xl ring-1 ring-white/15 backdrop-blur-sm transition-[transform,opacity] duration-200 hover:-translate-y-0.5"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}

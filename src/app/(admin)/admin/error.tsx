"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ShieldAlert, WifiOff, LayoutDashboard } from "lucide-react";

// Boundary de erro do admin: mensagem clara + "Tentar novamente".
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Boundary de cliente: erro estruturado no console (sem PII).
    console.error("[admin] erro:", error?.message, error?.digest ?? "");
  }, [error]);

  const msg = (error?.message ?? "").toLowerCase();
  const tipo =
    /não autenticado|nao autenticado|permiss|forbidden|unauthor|sessão|sessao/.test(msg) ? "permissao" :
    /fetch|network|rede|timeout|econnrefused|failed to fetch/.test(msg) ? "rede" :
    "geral";

  const conteudo = {
    permissao: { Icon: ShieldAlert, titulo: "Acesso negado", desc: "Você não tem permissão para ver isto ou sua sessão expirou. Faça login novamente." },
    rede: { Icon: WifiOff, titulo: "Falha de conexão", desc: "Não conseguimos falar com o servidor. Verifique sua conexão e tente de novo." },
    geral: { Icon: AlertTriangle, titulo: "Algo deu errado", desc: "Ocorreu um erro inesperado ao carregar esta tela. Você pode tentar novamente." },
  }[tipo];

  const { Icon } = conteudo;

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="grid max-w-md place-items-center rounded-2xl border border-border bg-surface px-8 py-12 text-center shadow-xs">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--error)]/12 text-[var(--error)]">
          <Icon size={26} strokeWidth={1.8} />
        </span>
        <h2 className="mt-5 text-[17px] font-semibold text-foreground">{conteudo.titulo}</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-foreground-secondary">{conteudo.desc}</p>
        {error?.digest && <p className="mt-3 font-mono text-[11px] text-foreground-tertiary">ref: {error.digest}</p>}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_2px_14px_rgba(0,73,207,0.4)] transition hover:opacity-95"
          >
            <RefreshCw size={15} /> Tentar novamente
          </button>
          {tipo === "permissao" ? (
            <Link href="/login" className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-[13px] font-medium text-foreground-secondary transition hover:bg-muted hover:text-foreground">
              Ir para o login
            </Link>
          ) : (
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-[13px] font-medium text-foreground-secondary transition hover:bg-muted hover:text-foreground">
              <LayoutDashboard size={15} /> Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

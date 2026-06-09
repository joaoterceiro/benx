"use client";

import { EVENTO_GERENCIAR } from "@/components/public/cookie-consent";

// Reabre o gerenciador de cookies (revogação/alteração fácil — LGPD art. 8 §5).
export function GerenciarCookiesLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(EVENTO_GERENCIAR))}
      className={className ?? "text-left transition hover:text-white"}
    >
      GERENCIAR COOKIES
    </button>
  );
}

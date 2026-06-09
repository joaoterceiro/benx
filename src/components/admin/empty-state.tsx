import Link from "next/link";
import type { LucideIcon } from "lucide-react";

// Estado vazio padrão do admin: ícone + título + descrição + CTA opcional.
export function EmptyState({
  icon: Icon,
  titulo,
  descricao,
  acao,
}: {
  icon: LucideIcon;
  titulo: string;
  descricao?: string;
  acao?: { label: string; href?: string; onClick?: () => void };
}) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-border-emphasis bg-surface px-6 py-16 text-center shadow-xs">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent-subtle text-accent">
        <Icon size={26} strokeWidth={1.8} />
      </span>
      <h3 className="mt-5 text-[15px] font-semibold text-foreground">{titulo}</h3>
      {descricao && <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-foreground-secondary">{descricao}</p>}
      {acao && (
        acao.href ? (
          <Link
            href={acao.href}
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_2px_14px_rgba(0,73,207,0.4)] transition hover:opacity-95 hover:shadow-[0_6px_24px_rgba(0,73,207,0.6)]"
          >
            {acao.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={acao.onClick}
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_2px_14px_rgba(0,73,207,0.4)] transition hover:opacity-95"
          >
            {acao.label}
          </button>
        )
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";

export type Tone = "info" | "success" | "warning" | "danger" | "neutral";

const TONE: Record<Tone, string> = {
  info: "bg-accent/15 text-accent ring-accent/25",
  success: "bg-[var(--success)]/15 text-[var(--success)] ring-[var(--success)]/25",
  warning: "bg-[var(--warning,#d9a441)]/15 text-[var(--warning,#d9a441)] ring-[var(--warning,#d9a441)]/30",
  danger: "bg-[var(--error)]/15 text-[var(--error)] ring-[var(--error)]/30",
  neutral: "bg-white/[0.06] text-foreground-secondary ring-white/10",
};

// Mapa semântico p/ status de obra (texto livre cai em neutral).
export function toneStatusObra(valor: string): Tone {
  switch (valor) {
    case "pronto_para_morar":
    case "entregue":
      return "success";
    case "lancamento":
    case "em_construcao":
      return "info";
    case "breve_lancamento":
      return "warning";
    default:
      return "neutral";
  }
}

// Tom a partir do rótulo legível (quando só temos o label, não o valor cru).
export function toneStatusLabel(label: string): Tone {
  const n = label.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  if (/pronto|entregue|publicad|convertid|ativo/.test(n)) return "success";
  if (/lancamento|construcao|em contato/.test(n)) return "info";
  if (/breve|qualificad|rascunho|pendente/.test(n)) return "warning";
  if (/perdid|inativ|cancelad/.test(n)) return "danger";
  return "neutral";
}

export function StatusBadge({ tone = "neutral", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        TONE[tone],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {children}
    </span>
  );
}

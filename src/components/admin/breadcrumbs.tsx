import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb { label: string; href?: string }

// Trilha de navegação para páginas internas do admin.
export function Breadcrumbs({ itens }: { itens: Crumb[] }) {
  return (
    <nav aria-label="Trilha de navegação" className="flex flex-wrap items-center gap-1 text-[13px] text-foreground-tertiary">
      {itens.map((c, i) => {
        const ultimo = i === itens.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} className="text-foreground-tertiary/60" />}
            {c.href && !ultimo ? (
              <Link href={c.href} className="transition hover:text-foreground">{c.label}</Link>
            ) : (
              <span className={ultimo ? "font-medium text-foreground" : ""}>{c.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

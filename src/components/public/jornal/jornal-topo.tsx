import Link from "next/link";
import { BuscaTrigger } from "@/components/public/busca-glass";
import { MenuTrigger } from "@/components/public/menu-overlay";

// Barra de topo das páginas do Benx Jornal (faixa escura, logo + busca + menu).
export function JornalTopo({ marca = "benx", homeHref = "/" }: { marca?: "benx" | "vivabenx"; homeHref?: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-black/90 via-black/55 to-transparent">
      <div className="mx-auto flex max-w-site items-center justify-between px-6 py-4">
        {marca === "vivabenx" ? (
          <Link href={homeHref} aria-label="Viva Benx">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-vivabenx-cor.svg" alt="Viva Benx" className="h-10 w-auto" />
          </Link>
        ) : (
          <Link href={homeHref} aria-label="Benx">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-benx-branco.png" alt="Benx" className="h-9 w-auto" />
          </Link>
        )}
        <div className="flex items-center gap-3 text-white">
          <BuscaTrigger className="h-11 w-11 hover:opacity-80" />
          <MenuTrigger className="h-11 w-11 hover:opacity-80" />
        </div>
      </div>
    </header>
  );
}

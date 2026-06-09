import Link from "next/link";
import { BuscaTrigger } from "@/components/public/busca-glass";
import { MenuTrigger } from "@/components/public/menu-overlay";

const COL = "mx-auto w-full max-w-site px-6";

// Header padrão do site: faixa transparente com gradiente escuro no topo
// (logo branca + busca + menu). Fica sobreposto ao hero em todas as páginas.
export function SiteHeader({ logo = "/logo-benx-branco.png", homeHref = "/benx" }: { logo?: string; homeHref?: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-black/90 via-black/55 to-transparent">
      <div className={`${COL} flex items-center justify-between py-4`}>
        <Link href={homeHref} aria-label="Benx">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="Benx" className="h-9 w-auto" />
        </Link>
        <div className="flex items-center gap-3 text-white">
          <BuscaTrigger className="h-11 w-11 hover:opacity-80" />
          <MenuTrigger className="h-11 w-11 hover:opacity-80" />
        </div>
      </div>
    </header>
  );
}

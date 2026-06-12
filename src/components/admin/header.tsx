"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { LayoutDashboard, Building2, Newspaper, Settings, LogOut, ChevronDown, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { sair } from "@/actions/auth";
import { AdminSearch } from "@/components/admin/admin-search";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/empreendimentos", label: "Empreendimentos", icon: Building2 },
  { href: "/admin/jornal", label: "Benx Jornal", icon: Newspaper },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
] as const;

function iniciais(nome: string): string {
  return nome.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

const iconBtn =
  "grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-foreground-secondary transition hover:bg-white/10 hover:text-foreground";

export function Header({ usuario }: { usuario: { nome: string; papel: "admin" | "editor" } }) {
  const pathname = usePathname();
  const [saindo, startLogout] = useTransition();
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o menu do usuário ao clicar fora / pressionar Esc.
  useEffect(() => {
    if (!menuAberto) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuAberto(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuAberto(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, [menuAberto]);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
      <div className="mx-auto flex max-w-site items-center gap-3 px-3 py-2">
        {/* Marca */}
        <Link href="/admin/dashboard" className="flex shrink-0 items-center gap-2.5 pl-1 pr-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-benx-branco.png" alt="Benx" className="h-7 w-auto" />
        </Link>

        {/* Navegação em pílulas */}
        <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
          {NAV.map((item) => {
            const ativo = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-[background,color,box-shadow] duration-200 ease-premium",
                  ativo
                    ? "bg-accent text-white shadow-[0_2px_12px_rgba(0,73,207,0.45)]"
                    : "text-foreground-secondary hover:bg-white/[0.07] hover:text-foreground"
                )}
              >
                <Icon size={15} strokeWidth={2} />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Cluster direito */}
        <div className="ml-auto flex items-center gap-2">
          {/* Busca (Ctrl+K) */}
          <AdminSearch className={cn(iconBtn, "hidden sm:grid")} />

          {/* Usuário + dropdown */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuAberto((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuAberto}
              className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-3 transition hover:bg-white/[0.08]"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-[11px] font-bold text-white ring-2 ring-[rgba(0,73,207,0.55)]">
                {iniciais(usuario.nome) || "BX"}
              </span>
              <span className="hidden flex-col items-start leading-tight sm:flex">
                <span className="text-[10px] text-foreground-tertiary">
                  {usuario.papel === "admin" ? "Administrador" : "Editor"}
                </span>
                <span className="text-[12px] font-semibold text-foreground">{usuario.nome}</span>
              </span>
              <ChevronDown size={15} className={cn("hidden text-foreground-tertiary transition-transform duration-200 sm:block", menuAberto && "rotate-180")} strokeWidth={2} />
            </button>

            {menuAberto && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+8px)] w-60 overflow-hidden rounded-2xl border border-white/10 p-1.5 shadow-[0_20px_48px_rgba(0,0,0,0.6)]"
                style={{ background: "#1b1b1f", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
              >
                <div className="flex items-center gap-3 px-2.5 py-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-[12px] font-bold text-white ring-2 ring-[rgba(0,73,207,0.55)]">
                    {iniciais(usuario.nome) || "BX"}
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-[13px] font-semibold text-foreground">{usuario.nome}</span>
                    <span className="text-[11px] text-foreground-tertiary">{usuario.papel === "admin" ? "Administrador" : "Editor"}</span>
                  </span>
                </div>
                <div className="my-1 h-px bg-white/10" />
                <Link href="/admin/configuracoes" role="menuitem" onClick={() => setMenuAberto(false)} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-foreground-secondary transition hover:bg-white/[0.07] hover:text-foreground">
                  <Settings size={15} strokeWidth={2} /> Configurações
                </Link>
                <Link href="/admin/configuracoes/usuarios" role="menuitem" onClick={() => setMenuAberto(false)} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-foreground-secondary transition hover:bg-white/[0.07] hover:text-foreground">
                  <UserCog size={15} strokeWidth={2} /> Usuários
                </Link>
                <div className="my-1 h-px bg-white/10" />
                <button
                  type="button"
                  role="menuitem"
                  disabled={saindo}
                  onClick={() => startLogout(() => sair())}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-red-400 transition hover:bg-red-500/15 hover:text-red-300 disabled:opacity-50"
                >
                  <LogOut size={15} strokeWidth={2} /> {saindo ? "Saindo..." : "Sair"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

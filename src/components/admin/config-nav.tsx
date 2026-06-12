"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Menu, Search, MonitorPlay, Users, GalleryHorizontalEnd, PanelBottom, ScrollText, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";

// Seções de configuração. Para adicionar uma nova, crie a sub-rota em
// src/app/(admin)/admin/configuracoes/<slug>/page.tsx e some aqui.
const SECOES = [
  { href: "/admin/configuracoes/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { href: "/admin/configuracoes/menu", label: "Menu", icon: Menu },
  { href: "/admin/configuracoes/busca", label: "Busca", icon: Search },
  { href: "/admin/configuracoes/splash", label: "Splash / Home", icon: MonitorPlay },
  { href: "/admin/configuracoes/slider", label: "Hero Slider", icon: GalleryHorizontalEnd },
  { href: "/admin/configuracoes/home-cards", label: "Cards da Home", icon: ListOrdered },
  { href: "/admin/configuracoes/footer", label: "Footer", icon: PanelBottom },
  { href: "/admin/configuracoes/legal", label: "Privacidade e Termos", icon: ScrollText },
  { href: "/admin/configuracoes/usuarios", label: "Usuários", icon: Users },
] as const;

export function ConfigNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible lg:border-r lg:border-border lg:pr-4">
      {SECOES.map((s) => {
        const ativo = pathname.startsWith(s.href);
        const Icon = s.icon;
        return (
          <Link
            key={s.href}
            href={s.href}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
              ativo
                ? "bg-muted text-foreground"
                : "text-foreground-secondary hover:bg-black/[0.04] hover:text-foreground"
            )}
          >
            <Icon size={16} strokeWidth={1.7} />
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}

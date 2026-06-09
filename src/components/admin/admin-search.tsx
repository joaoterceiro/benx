"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Search, LayoutDashboard, Building2, Plus, LayoutPanelLeft, Images, Newspaper,
  Settings, MessageCircle, Menu as MenuIcon, PanelBottom, ScrollText, Users, ArrowRight, CornerDownLeft,
} from "lucide-react";

interface Destino { label: string; href: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; grupo: string }

const DESTINOS: Destino[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, grupo: "Navegação" },
  { label: "Empreendimentos", href: "/admin/empreendimentos", icon: Building2, grupo: "Navegação" },
  { label: "Novo empreendimento", href: "/admin/empreendimentos/novo", icon: Plus, grupo: "Navegação" },
  { label: "Plantas", href: "/admin/plantas", icon: LayoutPanelLeft, grupo: "Navegação" },
  { label: "Mídias", href: "/admin/midias", icon: Images, grupo: "Navegação" },
  { label: "Benx Journal", href: "/admin/jornal", icon: Newspaper, grupo: "Navegação" },
  { label: "Configurações", href: "/admin/configuracoes", icon: Settings, grupo: "Configurações" },
  { label: "WhatsApp", href: "/admin/configuracoes/whatsapp", icon: MessageCircle, grupo: "Configurações" },
  { label: "Menu", href: "/admin/configuracoes/menu", icon: MenuIcon, grupo: "Configurações" },
  { label: "Busca", href: "/admin/configuracoes/busca", icon: Search, grupo: "Configurações" },
  { label: "Footer", href: "/admin/configuracoes/footer", icon: PanelBottom, grupo: "Configurações" },
  { label: "Privacidade e Termos", href: "/admin/configuracoes/legal", icon: ScrollText, grupo: "Configurações" },
  { label: "Usuários", href: "/admin/configuracoes/usuarios", icon: Users, grupo: "Configurações" },
];

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

export function AdminSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [ativo, setAtivo] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const itens = useMemo(() => {
    const nq = norm(q.trim());
    const dest = nq ? DESTINOS.filter((d) => norm(d.label).includes(nq)) : DESTINOS;
    const acoes: { label: string; href: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; grupo: string }[] = [];
    if (nq) acoes.push({ label: `Buscar “${q.trim()}” em Empreendimentos`, href: `/admin/empreendimentos?q=${encodeURIComponent(q.trim())}`, icon: Building2, grupo: "Ação" });
    return [...acoes, ...dest];
  }, [q]);

  useEffect(() => { setAtivo(0); }, [q]);

  // Abrir com Ctrl/Cmd+K; foco ao abrir; travar scroll; navegar com setas.
  useEffect(() => {
    const onKeyGlobal = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((v) => !v); }
    };
    window.addEventListener("keydown", onKeyGlobal);
    return () => window.removeEventListener("keydown", onKeyGlobal);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQ(""); setAtivo(0);
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); setOpen(false); } };
    window.addEventListener("keydown", onEsc);
    return () => { clearTimeout(t); document.body.style.overflow = anterior; window.removeEventListener("keydown", onEsc); };
  }, [open]);

  function ir(href: string) { setOpen(false); router.push(href); }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setAtivo((i) => Math.min(i + 1, itens.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setAtivo((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && itens[ativo]) { e.preventDefault(); ir(itens[ativo].href); }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Buscar (Ctrl+K)"
        onClick={() => setOpen(true)}
        className={className}
      >
        <Search size={16} strokeWidth={2} />
      </button>

      {open && mounted && createPortal(
        <div
          className="fixed inset-0 z-[2147483500] flex justify-center px-4 pt-[12vh]"
          style={{ background: "rgba(0,0,0,.5)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Buscar"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onKey}
            className="h-fit w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 text-foreground shadow-[0_28px_64px_rgba(0,0,0,0.65)]"
            style={{ background: "#1b1b1f" }}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <Search size={18} className="text-foreground-tertiary" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar páginas, empreendimentos…"
                className="h-13 w-full bg-transparent py-4 text-[15px] text-foreground outline-none placeholder:text-foreground-tertiary"
              />
              <kbd className="hidden shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-foreground-tertiary sm:block">ESC</kbd>
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-2">
              {itens.length === 0 && <p className="px-3 py-8 text-center text-[13px] text-foreground-tertiary">Nada encontrado.</p>}
              {itens.map((it, i) => {
                const Icon = it.icon;
                const on = i === ativo;
                return (
                  <button
                    key={`${it.href}-${i}`}
                    type="button"
                    onMouseEnter={() => setAtivo(i)}
                    onClick={() => ir(it.href)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition ${on ? "bg-accent/15 text-foreground" : "text-foreground-secondary hover:bg-white/[0.05]"}`}
                  >
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${on ? "bg-accent/20 text-accent" : "bg-white/[0.05] text-foreground-tertiary"}`}>
                      <Icon size={15} strokeWidth={2} />
                    </span>
                    <span className="flex-1 truncate">{it.label}</span>
                    <span className="text-[10px] uppercase tracking-wider text-foreground-tertiary">{it.grupo}</span>
                    {on && <CornerDownLeft size={14} className="text-foreground-tertiary" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 text-[11px] text-foreground-tertiary">
              <span className="flex items-center gap-1.5"><ArrowRight size={12} /> Enter para abrir</span>
              <span>↑ ↓ navegar</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

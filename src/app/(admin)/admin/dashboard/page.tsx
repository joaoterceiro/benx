import Link from "next/link";
import {
  Building2, LayoutPanelLeft, Images, MapPin, Eye, EyeOff, Plus,
  MessageCircle, Menu as MenuIcon, Search, MonitorPlay, ArrowRight, Settings,
} from "lucide-react";
import { estatisticasDashboard } from "@/db/queries";
import { vertentePorValue } from "@/lib/ecossistema";
import { statusObraLabel } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const s = await estatisticasDashboard();

  const cards = [
    { label: "Empreendimentos", valor: s.totalEmpreendimentos, icon: Building2, href: "/admin/empreendimentos" },
    { label: "Plantas", valor: s.totalPlantas, icon: LayoutPanelLeft, href: "/admin/plantas" },
    { label: "Mídias", valor: s.totalMidias, icon: Images, href: "/admin/midias" },
    { label: "Cidades", valor: s.totalCidades, icon: MapPin, href: "/admin/empreendimentos" },
  ];

  const atalhos = [
    { label: "Novo empreendimento", icon: Plus, href: "/admin/empreendimentos/novo", destaque: true },
    { label: "Empreendimentos", icon: Building2, href: "/admin/empreendimentos" },
    { label: "Plantas", icon: LayoutPanelLeft, href: "/admin/plantas" },
    { label: "Mídias", icon: Images, href: "/admin/midias" },
    { label: "WhatsApp", icon: MessageCircle, href: "/admin/configuracoes/whatsapp" },
    { label: "Menu", icon: MenuIcon, href: "/admin/configuracoes/menu" },
    { label: "Busca", icon: Search, href: "/admin/configuracoes/busca" },
    { label: "Splash / Home", icon: MonitorPlay, href: "/admin/configuracoes/splash" },
  ];

  const maxVert = Math.max(1, ...s.porVertente.map((v) => v.total));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-foreground-secondary">Visão geral do portfólio e atalhos de gestão.</p>
        </div>
        <Link href="/admin/empreendimentos/novo" className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-white transition hover:brightness-110">
          <Plus size={16} /> Novo empreendimento
        </Link>
      </div>

      {/* Cards de números */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} href={c.href} className="zen-card group rounded-xl p-5 shadow-xs transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent-subtle text-accent"><Icon size={18} strokeWidth={1.8} /></span>
                <ArrowRight size={16} className="text-foreground-tertiary opacity-0 transition group-hover:opacity-100" />
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">{c.valor}</p>
              <p className="text-[13px] text-foreground-secondary">{c.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Por vertente */}
        <section className="zen-card rounded-xl p-6 shadow-xs">
          <h2 className="text-[15px] font-semibold">Empreendimentos por vertente</h2>
          <div className="mt-4 flex flex-col gap-3">
            {s.porVertente.length === 0 && <p className="text-[13px] text-foreground-tertiary">Sem dados.</p>}
            {s.porVertente.map((v) => {
              const info = vertentePorValue(v.value);
              const cor = info?.cor ?? "#64748b";
              return (
                <div key={v.value} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-[13px] font-medium" style={{ color: cor }}>{info?.label ?? v.value}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${(v.total / maxVert) * 100}%`, background: cor }} />
                  </div>
                  <span className="w-8 shrink-0 text-right text-[13px] font-semibold tabular-nums">{v.total}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex items-center gap-4 border-t border-border pt-4 text-[12px] text-foreground-secondary">
            <span className="inline-flex items-center gap-1.5"><Eye size={14} /> {s.visiveis} visíveis</span>
            <span className="inline-flex items-center gap-1.5"><EyeOff size={14} /> {s.ocultos} ocultos</span>
          </div>
        </section>

        {/* Por status */}
        <section className="zen-card rounded-xl p-6 shadow-xs">
          <h2 className="text-[15px] font-semibold">Por status da obra</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {s.porStatus.length === 0 && <p className="text-[13px] text-foreground-tertiary">Sem dados.</p>}
            {s.porStatus.map((st) => (
              <span key={st.status} className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-[13px]">
                {statusObraLabel(st.status)}
                <span className="rounded-full bg-foreground/10 px-1.5 text-[12px] font-semibold tabular-nums">{st.total}</span>
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* Atalhos */}
      <section>
        <h2 className="mb-3 text-[15px] font-semibold">Atalhos</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {atalhos.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.label}
                href={a.href}
                className={`flex items-center gap-3 rounded-xl border p-4 text-[13px] font-medium transition hover:shadow-md ${a.destaque ? "border-accent/30 bg-accent/[0.06] text-accent hover:border-accent/50" : "border-border bg-surface text-foreground hover:border-border-emphasis"}`}
              >
                <span className={`grid h-9 w-9 place-items-center rounded-lg ${a.destaque ? "bg-accent text-white" : "bg-muted text-foreground-secondary"}`}><Icon size={18} strokeWidth={1.8} /></span>
                {a.label}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recentes */}
      <section className="rounded-xl border border-border bg-surface shadow-xs">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-[15px] font-semibold">Atualizados recentemente</h2>
          <Link href="/admin/empreendimentos" className="inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {s.recentes.length === 0 && <li className="px-6 py-5 text-[13px] text-foreground-tertiary">Nenhum empreendimento ainda.</li>}
          {s.recentes.map((r) => {
            const info = vertentePorValue(r.vertenteValue);
            return (
              <li key={r.id}>
                <Link href={`/admin/empreendimentos/${r.id}`} className="flex items-center gap-3 px-6 py-3.5 transition hover:bg-muted/40">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: info?.cor ?? "#94a3b8" }} />
                  <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{r.nome}</span>
                  <span className="hidden text-[12px] text-foreground-tertiary sm:inline">{info?.label ?? r.vertenteValue}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground-secondary">{statusObraLabel(r.statusObra)}</span>
                  {!r.visivel && <span className="inline-flex items-center gap-1 text-[11px] text-foreground-tertiary"><EyeOff size={13} /> oculto</span>}
                  <ArrowRight size={15} className="shrink-0 text-foreground-tertiary" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[12px] text-foreground-tertiary">
        <Settings size={13} /> Mais ajustes em <Link href="/admin/configuracoes" className="text-accent hover:underline">Configurações</Link>.
      </p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Star, Copy, Loader2, Newspaper } from "lucide-react";
import { toast } from "sonner";
import { removerPost, duplicarPost, alternarDestaque } from "@/actions/jornal";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusBadge } from "@/components/admin/status-badge";

interface Row {
  id: string; titulo: string; categoria: string; fonte: string | null;
  publicado: boolean; destaque: boolean; dataPublicacao: string;
}

export function JornalTable({ posts }: { posts: Row[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const confirmar = useConfirm();
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [destOverride, setDestOverride] = useState<Record<string, boolean>>({});
  const ehDestaque = (p: Row) => (p.id in destOverride ? destOverride[p.id] : p.destaque);

  function alternar(p: Row) {
    const novo = !ehDestaque(p);
    setDestOverride((s) => ({ ...s, [p.id]: novo }));
    start(async () => {
      const r = await alternarDestaque(p.id, novo);
      if (!r.ok) { setDestOverride((s) => ({ ...s, [p.id]: !novo })); toast.error(r.erro ?? "Falha ao alterar destaque."); }
      else toast.success(novo ? "Marcado como destaque." : "Destaque removido.");
    });
  }

  async function remover(id: string, titulo: string) {
    const ok = await confirmar({ titulo: `Remover "${titulo}"?`, descricao: "O post será removido permanentemente." });
    if (!ok) return;
    setExcluindoId(id);
    start(async () => { await removerPost(id); router.refresh(); setExcluindoId(null); toast.success("Post removido."); });
  }

  function duplicar(id: string) {
    start(async () => {
      const r = await duplicarPost(id);
      if (r.ok) { router.refresh(); toast.success("Post duplicado (rascunho)."); }
      else toast.error(r.erro ?? "Falha ao duplicar.");
    });
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={Newspaper}
        titulo="Nenhum post ainda"
        descricao="Crie a primeira matéria do Benx Journal para publicá-la no site."
        acao={{ label: "Novo post", href: "/admin/jornal/novo" }}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-xs">
      <table className="w-full min-w-[640px] text-left text-[13px]">
        <thead className="border-b border-border bg-muted/40 text-[11px] uppercase tracking-wide text-foreground-tertiary">
          <tr>
            <th className="px-5 py-3 font-semibold">Título</th>
            <th className="px-5 py-3 font-semibold">Categoria</th>
            <th className="hidden px-5 py-3 font-semibold sm:table-cell">Fonte</th>
            <th className="px-5 py-3 font-semibold">Data</th>
            <th className="px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {posts.map((p) => (
            <tr key={p.id} className="transition-colors hover:bg-muted/30">
              <td className="px-5 py-3">
                <Link href={`/admin/jornal/${p.id}`} className="font-medium text-foreground transition-colors hover:text-accent">
                  {p.titulo}
                </Link>
              </td>
              <td className="px-5 py-3 text-foreground-secondary">{p.categoria}</td>
              <td className="hidden px-5 py-3 text-foreground-secondary sm:table-cell">{p.fonte ?? "—"}</td>
              <td className="px-5 py-3 text-foreground-secondary tabular-nums">{new Date(p.dataPublicacao).toLocaleDateString("pt-BR")}</td>
              <td className="px-5 py-3">
                <StatusBadge tone={p.publicado ? "success" : "neutral"}>{p.publicado ? "Publicado" : "Rascunho"}</StatusBadge>
              </td>
              <td className="px-5 py-3 text-right">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    title={ehDestaque(p) ? "Remover destaque" : "Marcar destaque"}
                    aria-pressed={ehDestaque(p)}
                    onClick={() => alternar(p)}
                    disabled={pending}
                    className={`grid h-8 w-8 place-items-center rounded-md transition disabled:opacity-40 ${ehDestaque(p) ? "text-amber-400 hover:bg-amber-400/10" : "text-foreground-tertiary hover:bg-muted hover:text-foreground"}`}
                  >
                    <Star size={15} className={ehDestaque(p) ? "fill-amber-400" : ""} />
                  </button>
                  <button type="button" title="Duplicar" onClick={() => duplicar(p.id)} disabled={pending} className="grid h-8 w-8 place-items-center rounded-md text-foreground-tertiary transition hover:bg-muted hover:text-foreground disabled:opacity-40">
                    <Copy size={15} />
                  </button>
                  <button type="button" title="Remover" onClick={() => remover(p.id, p.titulo)} disabled={pending} className="grid h-8 w-8 place-items-center rounded-md text-foreground-tertiary transition hover:bg-error/10 hover:text-error disabled:opacity-40">
                    {excluindoId === p.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

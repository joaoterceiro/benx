"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, LayoutPanelLeft } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { excluirPlantaGlobal } from "@/actions/plantas";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import type { PlantaAdmin } from "@/db/queries";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

export function PlantasTable({ plantas }: { plantas: PlantaAdmin[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [q, setQ] = useState("");
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const confirmar = useConfirm();

  const filtradas = useMemo(() => {
    const nq = norm(q.trim());
    if (!nq) return plantas;
    return plantas.filter((p) => norm(`${p.nome} ${p.empreendimentos.join(" ")}`).includes(nq));
  }, [plantas, q]);

  async function excluir(id: string, nome: string) {
    const ok = await confirmar({
      titulo: `Excluir a planta "${nome}"?`,
      descricao: "Será desvinculada de todos os empreendimentos. Não pode ser desfeito.",
    });
    if (!ok) return;
    setExcluindoId(id);
    start(async () => {
      const r = await excluirPlantaGlobal(id);
      if (r.ok) { toast.success("Planta excluída."); router.refresh(); }
      else toast.error(r.erro ?? "Falha ao excluir.");
      setExcluindoId(null);
    });
  }

  if (plantas.length === 0) {
    return (
      <EmptyState
        icon={LayoutPanelLeft}
        titulo="Nenhuma planta cadastrada"
        descricao="As plantas são criadas e vinculadas na aba Plantas de cada empreendimento."
        acao={{ label: "Ver empreendimentos", href: "/admin/empreendimentos" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative max-w-sm">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou empreendimento…" />
      </div>
      <p className="text-[12px] text-foreground-tertiary">{filtradas.length} de {plantas.length}</p>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-xs">
        <table className="w-full min-w-[680px] text-[13px]">
          <thead>
            <tr className="border-b border-border text-left text-foreground-tertiary">
              <th className="px-4 py-2.5 font-medium" />
              <th className="px-4 py-2.5 font-medium">Nome</th>
              <th className="px-4 py-2.5 font-medium">Metragem</th>
              <th className="px-4 py-2.5 font-medium">Dorm.</th>
              <th className="px-4 py-2.5 font-medium">Vagas</th>
              <th className="px-4 py-2.5 font-medium">Empreendimentos</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {filtradas.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="py-2 pl-4 pr-0">
                  <div className="grid h-11 w-14 place-items-center overflow-hidden rounded-md bg-muted">
                    {p.imagemUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imagemUrl} alt="" className="h-full w-full object-contain p-0.5" />
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-2.5 font-medium">{p.nome}</td>
                <td className="px-4 py-2.5 text-foreground-secondary">{p.metragem ? `${p.metragem} m²` : "—"}</td>
                <td className="px-4 py-2.5 text-foreground-secondary">{p.dormitorios ?? "—"}</td>
                <td className="px-4 py-2.5 text-foreground-secondary">{p.vagas ?? "—"}</td>
                <td className="px-4 py-2.5 text-foreground-secondary">
                  {p.empreendimentos.length ? (
                    <span className="line-clamp-1">{p.empreendimentos.join(", ")}</span>
                  ) : <span className="text-foreground-tertiary">não vinculada</span>}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button type="button" title="Excluir" onClick={() => excluir(p.id, p.nome)} disabled={pending} className="grid h-8 w-8 place-items-center rounded-md text-foreground-tertiary transition hover:bg-error/10 hover:text-error disabled:opacity-40">
                    {excluindoId === p.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

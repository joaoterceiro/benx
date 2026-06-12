"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { salvarOrdemHome, type OrdemHomeInput } from "@/actions/home-cards";
import { statusObraLabel } from "@/lib/labels";

type Item = { id: string; nome: string; ordemHome: number; statusObra: string };
type Grupo = { value: string; label: string; slug: string; items: Item[] };
type Modo = "manual" | "aleatorio";

export function HomeCardsForm({ grupos, modos: modosIniciais }: { grupos: Grupo[]; modos: Record<string, Modo> }) {
  const [modos, setModos] = useState<Record<string, Modo>>(modosIniciais);
  const [ordens, setOrdens] = useState<Record<string, number>>(() => {
    const o: Record<string, number> = {};
    grupos.forEach((g) => g.items.forEach((i) => { o[i.id] = i.ordemHome; }));
    return o;
  });
  const [pending, start] = useTransition();

  function salvar() {
    const ordensArr = Object.entries(ordens).map(([id, ordem]) => ({ id, ordem }));
    start(async () => {
      const r = await salvarOrdemHome({ ordens: ordensArr, modos: modos as OrdemHomeInput["modos"] });
      if (r.ok) toast.success("Ordenação da home salva.");
      else toast.error(r.erro ?? "Falha ao salvar.");
    });
  }

  // Numera 1..N seguindo a ordem atual exibida (útil depois de ajustar à mão).
  function renumerar(g: Grupo) {
    const ordenados = [...g.items].sort(
      (a, b) => (ordens[a.id] ?? 0) - (ordens[b.id] ?? 0) || a.nome.localeCompare(b.nome, "pt-BR")
    );
    setOrdens((prev) => {
      const next = { ...prev };
      ordenados.forEach((i, idx) => { next[i.id] = idx + 1; });
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[18px] font-semibold">Cards da Home</h1>
        <p className="mt-0.5 text-[13px] text-foreground-secondary">
          Ordem da faixa de empreendimentos em cada home. Menor número aparece primeiro. No modo aleatório a ordem muda a cada visita.
        </p>
      </div>

      {grupos.map((g) => {
        const modo = modos[g.value] ?? "manual";
        const ordenados = [...g.items].sort(
          (a, b) => (ordens[a.id] ?? 0) - (ordens[b.id] ?? 0) || a.nome.localeCompare(b.nome, "pt-BR")
        );
        return (
          <div key={g.value} className="rounded-xl border border-border bg-surface p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h2 className="text-[15px] font-semibold">Home {g.label}</h2>
                <p className="mt-0.5 text-[13px] text-foreground-secondary">/{g.slug} · {g.items.length} empreendimentos</p>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-border p-1">
                {(["manual", "aleatorio"] as Modo[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setModos((p) => ({ ...p, [g.value]: m }))}
                    className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                      modo === m ? "bg-foreground text-background" : "text-foreground-secondary hover:bg-black/[0.04]"
                    }`}
                  >
                    {m === "manual" ? "Manual" : "Aleatório"}
                  </button>
                ))}
              </div>
            </div>

            {modo === "aleatorio" ? (
              <p className="mt-4 text-[13px] text-foreground-tertiary">
                A faixa exibe estes {g.items.length} empreendimentos em ordem aleatória, reembaralhada a cada carregamento.
              </p>
            ) : g.items.length === 0 ? (
              <p className="mt-4 text-[13px] text-foreground-tertiary">Nenhum empreendimento visível nesta linha.</p>
            ) : (
              <div className="mt-4">
                <div className="mb-3 flex justify-end">
                  <Button variant="outline" onClick={() => renumerar(g)} disabled={pending}>Renumerar 1..N</Button>
                </div>
                <ul className="flex flex-col divide-y divide-border">
                  {ordenados.map((i) => (
                    <li key={i.id} className="flex items-center gap-4 py-2.5">
                      <Input
                        type="number"
                        value={ordens[i.id] ?? 0}
                        onChange={(e) => setOrdens((p) => ({ ...p, [i.id]: parseInt(e.target.value, 10) || 0 }))}
                        className="w-20"
                        aria-label={`Posição de ${i.nome}`}
                      />
                      <span className="flex-1 text-[14px] font-medium">{i.nome}</span>
                      <span className="text-[12px] text-foreground-tertiary">{statusObraLabel(i.statusObra)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}

      <div className="sticky bottom-0 flex items-center gap-3 border-t border-border bg-background/90 py-3 backdrop-blur">
        <Button variant="primary" onClick={salvar} disabled={pending}>{pending ? "Salvando..." : "Salvar ordenação"}</Button>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Download, Loader2, Images } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { removerMidia } from "@/actions/midias";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import type { BibliotecaMidia } from "@/db/queries";

const TIPO_LABEL: Record<string, string> = {
  imagem: "Imagem", video: "Vídeo", planta: "Planta",
  fachada: "Fachada", area_comum: "Área comum", obra: "Obra",
};
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

export function MidiasLibrary({ midias }: { midias: BibliotecaMidia[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const confirmar = useConfirm();

  const tipos = useMemo(() => [...new Set(midias.map((m) => m.tipo))], [midias]);
  const filtradas = useMemo(() => {
    const nq = norm(q.trim());
    return midias.filter((m) => {
      if (tipo && m.tipo !== tipo) return false;
      if (nq && !norm(`${m.empreendimento} ${m.alt}`).includes(nq)) return false;
      return true;
    });
  }, [midias, q, tipo]);

  async function excluir(m: BibliotecaMidia) {
    const ok = await confirmar({
      titulo: "Excluir esta mídia?",
      descricao: `Será removida de "${m.empreendimento}" e também do armazenamento (MinIO). Não pode ser desfeito.`,
    });
    if (!ok) return;
    setExcluindoId(m.id);
    start(async () => {
      const r = await removerMidia(m.id, m.empreendimentoId);
      if (r.ok) { toast.success("Mídia excluída."); router.refresh(); }
      else toast.error(r.erro ?? "Falha ao excluir.");
      setExcluindoId(null);
    });
  }

  async function baixar(m: BibliotecaMidia) {
    try {
      const res = await fetch(m.url);
      const blob = await res.blob();
      const ext = (m.url.split("?")[0].split(".").pop() || "jpg").slice(0, 5);
      const nome = `${(m.empreendimento || "midia").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${m.id.slice(0, 6)}.${ext}`;
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href; a.download = nome;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(href);
    } catch {
      toast.error("Falha ao baixar.");
    }
  }

  if (midias.length === 0) {
    return (
      <EmptyState
        icon={Images}
        titulo="Nenhuma mídia enviada"
        descricao="As mídias são enviadas pelas galerias de cada empreendimento (aba Mídias do cadastro)."
        acao={{ label: "Ver empreendimentos", href: "/admin/empreendimentos" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por empreendimento…" className="min-w-[220px] flex-1" />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="h-9 rounded-lg border border-border bg-surface px-2 text-[13px] outline-none focus:border-accent">
          <option value="">Todos os tipos</option>
          {tipos.map((t) => <option key={t} value={t}>{TIPO_LABEL[t] ?? t}</option>)}
        </select>
        {(q || tipo) && <button onClick={() => { setQ(""); setTipo(""); }} className="text-[12px] font-medium text-accent hover:underline">Limpar</button>}
      </div>
      <p className="text-[12px] text-foreground-tertiary">{filtradas.length} de {midias.length}</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {filtradas.map((m) => (
          <div key={m.id} className="group relative overflow-hidden rounded-lg border border-border bg-surface shadow-xs">
            <div className="aspect-square bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.alt} className="h-full w-full object-cover" />
            </div>
            <div className="p-2">
              <p className="truncate text-[11px] font-medium">{m.empreendimento}</p>
              <p className="text-[10px] text-foreground-tertiary">{TIPO_LABEL[m.tipo] ?? m.tipo}</p>
            </div>
            <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                onClick={() => baixar(m)}
                aria-label="Baixar mídia"
                title="Baixar"
                className="grid h-7 w-7 place-items-center rounded-full bg-black/55 text-white transition hover:bg-accent"
              >
                <Download size={14} />
              </button>
              <button
                type="button"
                onClick={() => excluir(m)}
                disabled={pending}
                aria-label="Excluir mídia"
                title="Excluir"
                className="grid h-7 w-7 place-items-center rounded-full bg-black/55 text-white transition hover:bg-error disabled:opacity-40"
              >
                {excluindoId === m.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

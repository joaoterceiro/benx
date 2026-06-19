"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Loader2, Copy, Check, Trash2, Film, Music, FileText, File as FileIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { uploadBiblioteca, excluirMidiaBiblioteca } from "@/actions/midia";
import type { MidiaItem } from "@/lib/storage";

type Tipo = "image" | "video" | "audio" | "pdf" | "file";

function tipoDe(chave: string): Tipo {
  const ext = chave.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "webp", "gif", "svg", "avif", "bmp"].includes(ext)) return "image";
  if (["mp4", "webm", "mov", "m4v", "avi", "mkv"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "m4a", "aac"].includes(ext)) return "audio";
  if (ext === "pdf") return "pdf";
  return "file";
}

function nomeDe(chave: string): string {
  return chave.split("/").pop() || chave;
}

function fmtTamanho(n: number): string {
  if (!n) return "0 B";
  const u = ["B", "KB", "MB", "GB"];
  const i = Math.min(u.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  return `${(n / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${u[i]}`;
}

export function MidiaBiblioteca({ itens }: { itens: MidiaItem[] }) {
  const router = useRouter();
  const confirmar = useConfirm();
  const inputFile = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [q, setQ] = useState("");
  const [copiada, setCopiada] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [, start] = useTransition();

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? itens.filter((i) => i.chave.toLowerCase().includes(t)) : itens;
  }, [itens, q]);

  async function aoEnviar(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setEnviando(true);
    let okCount = 0;
    for (const file of files) {
      const fd = new FormData();
      fd.append("arquivo", file);
      const r = await uploadBiblioteca(fd);
      if (r.ok) okCount++;
      else toast.error(`${file.name}: ${r.erro}`);
    }
    setEnviando(false);
    if (inputFile.current) inputFile.current.value = "";
    if (okCount > 0) { toast.success(`${okCount} arquivo(s) enviado(s).`); router.refresh(); }
  }

  async function copiar(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiada(url);
      setTimeout(() => setCopiada((c) => (c === url ? null : c)), 1800);
    } catch {
      toast.error("Não foi possível copiar.");
    }
  }

  async function excluir(item: MidiaItem) {
    const nome = nomeDe(item.chave);
    const ok = await confirmar({
      titulo: `Excluir "${nome}"?`,
      descricao: "O arquivo será removido do storage permanentemente. Páginas que o usam ficarão sem a mídia.",
      digitar: false,
      tom: "perigo",
      confirmLabel: "Excluir",
    });
    if (!ok) return;
    setExcluindo(item.chave);
    start(async () => {
      const r = await excluirMidiaBiblioteca(item.chave);
      setExcluindo(null);
      if (r.ok) { toast.success("Mídia excluída."); router.refresh(); }
      else toast.error(r.erro ?? "Falha ao excluir.");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* barra: upload + busca */}
      <div className="flex flex-wrap items-center gap-3">
        <input ref={inputFile} type="file" multiple accept="image/*,video/*,audio/*,application/pdf" onChange={aoEnviar} className="hidden" />
        <Button variant="primary" onClick={() => inputFile.current?.click()} disabled={enviando}>
          {enviando ? <Loader2 size={15} className="mr-1.5 animate-spin" /> : <Upload size={15} className="mr-1.5" />}
          {enviando ? "Enviando..." : "Adicionar mídia"}
        </Button>
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome do arquivo…" className="pl-9" />
        </div>
        <span className="text-[12px] text-foreground-tertiary">{filtrados.length} de {itens.length}</span>
      </div>

      {filtrados.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed border-border py-20 text-center">
          <p className="text-[14px] text-foreground-secondary">{itens.length === 0 ? "Nenhuma mídia no storage ainda." : "Nenhum arquivo corresponde à busca."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtrados.map((item) => {
            const tipo = tipoDe(item.chave);
            const nome = nomeDe(item.chave);
            return (
              <div key={item.chave} className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
                <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-muted">
                  {tipo === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={nome} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <Preview tipo={tipo} />
                  )}
                  <button
                    type="button"
                    onClick={() => excluir(item)}
                    aria-label="Excluir"
                    className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-md bg-black/55 text-white opacity-0 transition group-hover:opacity-100 hover:bg-error"
                  >
                    {excluindo === item.chave ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-medium" title={nome}>{nome}</p>
                    <p className="text-[11px] text-foreground-tertiary">{fmtTamanho(item.tamanho)} · {tipo}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copiar(item.url)}
                    className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[12px] font-medium transition hover:bg-muted"
                  >
                    {copiada === item.url ? <><Check size={13} className="text-success" /> Copiado</> : <><Copy size={13} /> Copiar link</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Preview({ tipo }: { tipo: Tipo }) {
  const Icone = tipo === "video" ? Film : tipo === "audio" ? Music : tipo === "pdf" ? FileText : FileIcon;
  return (
    <div className="flex flex-col items-center gap-2 text-foreground-tertiary">
      <Icone size={34} strokeWidth={1.4} />
      <span className="text-[11px] font-medium uppercase tracking-wide">{tipo}</span>
    </div>
  );
}

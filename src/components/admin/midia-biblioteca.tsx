"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Copy, Check, Trash2, Download, Loader2, Film, Music, FileText, File as FileIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MidiaUploadModal } from "@/components/admin/midia-upload-modal";
import { MidiaExcluirModal } from "@/components/admin/midia-excluir-modal";
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
  const [q, setQ] = useState("");
  const [copiada, setCopiada] = useState<string | null>(null);
  const [baixando, setBaixando] = useState<string | null>(null);
  const [modalUpload, setModalUpload] = useState(false);
  const [itemExcluir, setItemExcluir] = useState<MidiaItem | null>(null);

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? itens.filter((i) => i.chave.toLowerCase().includes(t)) : itens;
  }, [itens, q]);

  async function copiar(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiada(url);
      setTimeout(() => setCopiada((c) => (c === url ? null : c)), 1800);
    } catch {
      toast.error("Não foi possível copiar.");
    }
  }

  async function baixar(item: MidiaItem) {
    setBaixando(item.chave);
    try {
      const res = await fetch(item.url);
      if (!res.ok) throw new Error("fetch falhou");
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = nomeDe(item.chave);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch {
      window.open(item.url, "_blank", "noopener");
    } finally {
      setBaixando(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* barra: upload + busca */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={() => setModalUpload(true)}>
          <Upload size={15} className="mr-1.5" /> Adicionar mídia
        </Button>
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome do arquivo…" className="pl-9" />
        </div>
        <span className="text-[12px] text-foreground-tertiary">{filtrados.length} de {itens.length}</span>
      </div>

      {filtrados.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed border-border py-20 text-center">
          <p className="text-[14px] text-foreground-secondary">{itens.length === 0 ? "Nenhuma mídia na biblioteca ainda." : "Nenhum arquivo corresponde à busca."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtrados.map((item) => {
            const tipo = tipoDe(item.chave);
            const nome = nomeDe(item.chave);
            return (
              <div key={item.chave} className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
                <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-muted">
                  {tipo === "image" ? <Thumb url={item.url} nome={nome} /> : <Preview tipo={tipo} />}
                  <button
                    type="button"
                    onClick={() => setItemExcluir(item)}
                    aria-label="Excluir"
                    className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-md bg-black/55 text-white opacity-0 transition group-hover:opacity-100 hover:bg-error"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-medium" title={nome}>{nome}</p>
                    <p className="text-[11px] text-foreground-tertiary">{fmtTamanho(item.tamanho)} · {tipo}</p>
                  </div>
                  <div className="mt-auto flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => copiar(item.url)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[12px] font-medium transition hover:bg-muted"
                    >
                      {copiada === item.url ? <><Check size={13} className="text-success" /> Copiado</> : <><Copy size={13} /> Copiar</>}
                    </button>
                    <button
                      type="button"
                      onClick={() => baixar(item)}
                      disabled={baixando === item.chave}
                      aria-label="Baixar arquivo"
                      title="Baixar"
                      className="grid h-[30px] w-[34px] shrink-0 place-items-center rounded-md border border-border transition hover:bg-muted disabled:opacity-50"
                    >
                      {baixando === item.chave ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MidiaUploadModal aberto={modalUpload} onFechar={() => setModalUpload(false)} onConcluido={() => router.refresh()} />
      <MidiaExcluirModal item={itemExcluir} onFechar={() => setItemExcluir(null)} onExcluido={() => { setItemExcluir(null); router.refresh(); }} />
    </div>
  );
}

// Miniatura de imagem com skeleton (pulsar) até carregar.
function Thumb({ url, nome }: { url: string; nome: string }) {
  const [carregada, setCarregada] = useState(false);
  return (
    <>
      {!carregada && <div className="absolute inset-0 animate-pulse bg-foreground/[0.08]" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={nome}
        loading="lazy"
        onLoad={() => setCarregada(true)}
        onError={() => setCarregada(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${carregada ? "opacity-100" : "opacity-0"}`}
      />
    </>
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

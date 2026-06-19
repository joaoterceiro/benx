"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Upload, X, Loader2, Check, AlertCircle, Trash2, ImageDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { comprimirImagem, ehImagemComprimivel, type NivelCompressao } from "@/lib/comprimir-imagem";

type Status = "pendente" | "comprimindo" | "enviando" | "ok" | "erro";
interface Item {
  id: string;
  file: File;
  status: Status;
  pct: number;
  erro?: string;
  tamanhoFinal?: number;
}

const TIPOS_OK = ["image/", "video/", "audio/", "application/pdf"];

function fmt(n: number): string {
  if (!n) return "0 B";
  const u = ["B", "KB", "MB", "GB"];
  const i = Math.min(u.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  return `${(n / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${u[i]}`;
}

const NIVEIS: { value: NivelCompressao; label: string; nota: string }[] = [
  { value: "otimizada", label: "Otimizada (recomendado)", nota: "Redimensiona até 1920px e converte para WebP." },
  { value: "maxima", label: "Máxima compressão", nota: "Até 1280px, menor arquivo. Use para web leve." },
  { value: "original", label: "Sem compressão", nota: "Envia o arquivo exatamente como está." },
];

function enviarComProgresso(file: File, onProg: (pct: number) => void): Promise<{ ok: boolean; erro?: string }> {
  return new Promise((resolve) => {
    const fd = new FormData();
    fd.append("arquivo", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/midias/upload");
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProg(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => {
      try {
        const r = JSON.parse(xhr.responseText);
        resolve(r.ok ? { ok: true } : { ok: false, erro: r.erro || "Falha no upload" });
      } catch {
        resolve({ ok: xhr.status < 300, erro: xhr.status < 300 ? undefined : "Falha no upload" });
      }
    };
    xhr.onerror = () => resolve({ ok: false, erro: "Falha de rede" });
    xhr.send(fd);
  });
}

export function MidiaUploadModal({ aberto, onFechar, onConcluido }: { aberto: boolean; onFechar: () => void; onConcluido: () => void }) {
  const [montado, setMontado] = useState(false);
  const [itens, setItens] = useState<Item[]>([]);
  const [nivel, setNivel] = useState<NivelCompressao>("otimizada");
  const [enviando, setEnviando] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputFile = useRef<HTMLInputElement>(null);

  useEffect(() => setMontado(true), []);
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !enviando) onFechar(); };
    document.addEventListener("keydown", onKey);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = anterior; };
  }, [aberto, enviando, onFechar]);

  // Reseta a lista quando reabre.
  useEffect(() => { if (aberto) setItens([]); }, [aberto]);

  function adicionar(files: File[]) {
    const validos = files.filter((f) => f.size > 0 && TIPOS_OK.some((t) => f.type.startsWith(t)));
    const novos: Item[] = validos.map((file, i) => ({ id: `${Date.now()}-${i}-${file.name}`, file, status: "pendente", pct: 0 }));
    setItens((c) => [...c, ...novos]);
  }

  function remover(id: string) { setItens((c) => c.filter((i) => i.id !== id)); }

  async function enviarTodos() {
    setEnviando(true);
    let sucesso = 0;
    const lista = itens.filter((i) => i.status === "pendente" || i.status === "erro");
    for (const it of lista) {
      let arquivo = it.file;
      if (ehImagemComprimivel(it.file) && nivel !== "original") {
        setItens((c) => c.map((x) => (x.id === it.id ? { ...x, status: "comprimindo", pct: 0 } : x)));
        arquivo = await comprimirImagem(it.file, nivel);
        setItens((c) => c.map((x) => (x.id === it.id ? { ...x, tamanhoFinal: arquivo.size } : x)));
      }
      setItens((c) => c.map((x) => (x.id === it.id ? { ...x, status: "enviando", pct: 0 } : x)));
      const r = await enviarComProgresso(arquivo, (pct) => setItens((c) => c.map((x) => (x.id === it.id ? { ...x, pct } : x))));
      setItens((c) => c.map((x) => (x.id === it.id ? { ...x, status: r.ok ? "ok" : "erro", pct: r.ok ? 100 : x.pct, erro: r.erro } : x)));
      if (r.ok) sucesso++;
    }
    setEnviando(false);
    if (sucesso > 0) onConcluido();
  }

  if (!aberto || !montado) return null;

  const pendentes = itens.filter((i) => i.status === "pendente" || i.status === "erro").length;
  const concluidos = itens.filter((i) => i.status === "ok").length;

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483600] grid place-items-center p-4"
      style={{ background: "rgba(5,8,15,.6)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
      onClick={() => { if (!enviando) onFechar(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Adicionar mídia"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/10 text-foreground shadow-[0_28px_64px_rgba(0,0,0,0.6)]"
        style={{ background: "#16171b" }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-[15px] font-semibold">Adicionar mídia</h2>
          <button type="button" aria-label="Fechar" disabled={enviando} onClick={onFechar} className="grid h-8 w-8 place-items-center rounded-lg text-foreground-tertiary transition hover:bg-white/[0.07] hover:text-foreground disabled:opacity-40">
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
          {/* dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); adicionar(Array.from(e.dataTransfer.files)); }}
            onClick={() => inputFile.current?.click()}
            className={`grid cursor-pointer place-items-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition ${dragOver ? "border-accent bg-accent/[0.06]" : "border-white/15 hover:border-white/30"}`}
          >
            <input ref={inputFile} type="file" multiple accept="image/*,video/*,audio/*,application/pdf" className="hidden" onChange={(e) => { adicionar(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
            <Upload size={24} className="text-foreground-tertiary" />
            <p className="mt-2 text-[13px] font-medium">Arraste arquivos aqui ou clique para escolher</p>
            <p className="mt-0.5 text-[12px] text-foreground-tertiary">Imagem, vídeo, áudio ou PDF</p>
          </div>

          {/* compressão */}
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2">
              <ImageDown size={15} className="text-foreground-secondary" />
              <span className="text-[13px] font-medium">Compressão de imagens</span>
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              {NIVEIS.map((n) => (
                <label key={n.value} className="flex cursor-pointer items-start gap-2.5 rounded-lg p-1.5 transition hover:bg-white/[0.04]">
                  <input type="radio" name="nivel" checked={nivel === n.value} onChange={() => setNivel(n.value)} className="mt-0.5" disabled={enviando} />
                  <span className="leading-tight">
                    <span className="block text-[13px] font-medium">{n.label}</span>
                    <span className="block text-[12px] text-foreground-tertiary">{n.nota}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-foreground-tertiary">Vídeos, áudios e PDFs são enviados sem compressão.</p>
          </div>

          {/* lista de arquivos */}
          {itens.length > 0 && (
            <div className="flex flex-col gap-2">
              {itens.map((it) => (
                <div key={it.id} className="rounded-lg border border-border bg-surface p-3">
                  <div className="flex items-center gap-3">
                    <StatusIcon status={it.status} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium" title={it.file.name}>{it.file.name}</p>
                      <p className="text-[11px] text-foreground-tertiary">
                        {fmt(it.file.size)}{it.tamanhoFinal ? ` → ${fmt(it.tamanhoFinal)}` : ""}
                        {it.status === "erro" && it.erro ? ` · ${it.erro}` : ""}
                      </p>
                    </div>
                    {!enviando && it.status !== "ok" && (
                      <button type="button" onClick={() => remover(it.id)} aria-label="Remover" className="grid h-7 w-7 place-items-center rounded-md text-foreground-tertiary transition hover:bg-white/[0.07] hover:text-error">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  {(it.status === "enviando" || it.status === "comprimindo" || (it.status === "ok")) && (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                      <div className="h-full rounded-full bg-accent transition-[width] duration-200" style={{ width: `${it.status === "comprimindo" ? 30 : it.pct}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
          <span className="text-[12px] text-foreground-tertiary">
            {concluidos > 0 ? `${concluidos} enviado(s). ` : ""}{pendentes > 0 ? `${pendentes} na fila.` : itens.length === 0 ? "Nenhum arquivo." : ""}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onFechar} disabled={enviando}>{concluidos > 0 && pendentes === 0 ? "Fechar" : "Cancelar"}</Button>
            <Button variant="primary" onClick={enviarTodos} disabled={enviando || pendentes === 0}>
              {enviando ? <><Loader2 size={15} className="mr-1.5 animate-spin" /> Enviando...</> : `Enviar ${pendentes > 0 ? `(${pendentes})` : ""}`}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function StatusIcon({ status }: { status: Status }) {
  if (status === "ok") return <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-success/15 text-success"><Check size={14} /></span>;
  if (status === "erro") return <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-error/15 text-error"><AlertCircle size={14} /></span>;
  if (status === "enviando" || status === "comprimindo") return <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-accent/15 text-accent"><Loader2 size={14} className="animate-spin" /></span>;
  return <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white/[0.06] text-foreground-tertiary"><Upload size={13} /></span>;
}

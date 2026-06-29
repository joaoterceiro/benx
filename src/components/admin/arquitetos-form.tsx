"use client";

import { useRef, useState, useTransition } from "react";
import { ChevronUp, ChevronDown, Trash2, Plus, Upload, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { salvarArquitetos } from "@/actions/mentes";
import { uploadSplashMidia } from "@/actions/splash";
import type { ArquitetoConfig } from "@/lib/mentes";

type Item = ArquitetoConfig & { preview: string };

export function ArquitetosForm({ inicial, previews }: { inicial: ArquitetoConfig[]; previews: string[] }) {
  const [itens, setItens] = useState<Item[]>(() => inicial.map((a, i) => ({ ...a, preview: previews[i] ?? "" })));
  const [pending, start] = useTransition();

  const set = (i: number, patch: Partial<Item>) => setItens((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const add = () => setItens((arr) => [...arr, { nome: "", descricao: "", projeto: "", imagem: "", preview: "" }]);
  const remove = (i: number) => setItens((arr) => arr.filter((_, idx) => idx !== i));
  const mover = (i: number, dir: -1 | 1) =>
    setItens((arr) => {
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      const n = [...arr];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  function salvar() {
    const lista = itens.map((it) => ({ nome: it.nome, descricao: it.descricao, projeto: it.projeto, imagem: it.imagem }));
    start(async () => {
      const r = await salvarArquitetos(lista);
      if (r.ok) toast.success("Arquitetos salvos.");
      else toast.error(r.erro ?? "Falha ao salvar.");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[18px] font-semibold">Arquitetos</h1>
        <p className="mt-0.5 text-[13px] text-foreground-secondary">
          Gerencie os arquitetos da página &ldquo;Arquitetos que inspiram&rdquo; (/mentes-criativas): nome, texto, empreendimento e foto.
        </p>
      </div>

      {itens.map((a, i) => (
        <div key={i} className="rounded-xl border border-border bg-surface p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-[14px] font-semibold">{a.nome.trim() || `Arquiteto ${i + 1}`}</h2>
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Subir" onClick={() => mover(i, -1)} disabled={i === 0} className="text-foreground-tertiary hover:text-foreground disabled:opacity-30"><ChevronUp size={16} /></button>
              <button type="button" aria-label="Descer" onClick={() => mover(i, 1)} disabled={i === itens.length - 1} className="text-foreground-tertiary hover:text-foreground disabled:opacity-30"><ChevronDown size={16} /></button>
              <button type="button" aria-label="Remover" onClick={() => remove(i)} className="ml-1 text-foreground-tertiary hover:text-error"><Trash2 size={15} /></button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium">Nome</span>
              <Input value={a.nome} onChange={(e) => set(i, { nome: e.target.value })} placeholder="Jacobsen Arquitetura" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium">Empreendimento (linha abaixo do texto)</span>
              <Input value={a.projeto} onChange={(e) => set(i, { projeto: e.target.value })} placeholder="Projetista de Arquitetura do empreendimento ..." />
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-[12px] font-medium">Descrição</span>
              <textarea
                value={a.descricao}
                onChange={(e) => set(i, { descricao: e.target.value })}
                rows={6}
                className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-foreground shadow-xs outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
              />
            </label>
            <div className="sm:col-span-2">
              <CampoImagem
                valor={a.imagem}
                preview={a.preview}
                onChange={(v) => set(i, { imagem: v })}
                onUpload={(c, u) => set(i, { imagem: c, preview: u })}
              />
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={add}><Plus size={15} className="mr-1" /> Adicionar arquiteto</Button>

      <div className="sticky bottom-0 flex items-center gap-3 border-t border-border bg-background/90 py-3 backdrop-blur">
        <Button variant="primary" onClick={salvar} disabled={pending}>{pending ? "Salvando..." : "Salvar arquitetos"}</Button>
      </div>
    </div>
  );
}

// Upload da foto direto para o MinIO (reusa a action de mídia do splash) + URL manual + prévia.
function CampoImagem({
  valor, preview, onChange, onUpload,
}: {
  valor: string;
  preview: string;
  onChange: (v: string) => void;
  onUpload: (chave: string, url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aoSelecionar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro(null);
    setEnviando(true);
    const fd = new FormData();
    fd.append("arquivo", file);
    const r = await uploadSplashMidia(fd);
    setEnviando(false);
    if (r.ok && r.chave && r.url) onUpload(r.chave, r.url);
    else setErro(r.erro ?? "Falha no upload");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12px] font-medium">Foto</span>
      <div className="flex items-start gap-3">
        <div className="grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-muted">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] text-foreground-tertiary">vazio</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Input value={valor} onChange={(e) => onChange(e.target.value)} placeholder="/mentes/arq-1.jpg ou URL" />
          <div className="flex items-center gap-2">
            <input ref={inputRef} type="file" accept="image/*" onChange={aoSelecionar} className="hidden" />
            <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={enviando}>
              {enviando ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Upload size={14} className="mr-1.5" />}
              {enviando ? "Enviando..." : "Enviar foto"}
            </Button>
            {erro && <span className="text-[12px] text-error">{erro}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

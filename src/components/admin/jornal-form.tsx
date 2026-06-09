"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, Plus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { salvarPost, uploadJornalImagem, type PostInput } from "@/actions/jornal";
import { RichText } from "@/components/admin/rich-text";

interface Props {
  inicial?: Partial<PostInput> & { id?: string };
  imagemPreview?: string | null;
  categorias: string[];
}

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export function JornalForm({ inicial, imagemPreview, categorias }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [enviando, setEnviando] = useState(false);
  const inputFile = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  const [f, setF] = useState<PostInput>({
    id: inicial?.id,
    titulo: inicial?.titulo ?? "",
    slug: inicial?.slug ?? "",
    categoria: inicial?.categoria ?? "Sem categoria",
    fonte: inicial?.fonte ?? "",
    fonteUrl: inicial?.fonteUrl ?? "",
    resumo: inicial?.resumo ?? "",
    conteudo: inicial?.conteudo ?? "",
    imagem: inicial?.imagem ?? "",
    seoTitulo: inicial?.seoTitulo ?? "",
    seoDescricao: inicial?.seoDescricao ?? "",
    dataPublicacao: inicial?.dataPublicacao ?? hoje(),
    destaque: inicial?.destaque ?? false,
    publicado: inicial?.publicado ?? true,
  });
  const [preview, setPreview] = useState<string | null>(imagemPreview ?? null);

  const set = <K extends keyof PostInput>(k: K, v: PostInput[K]) => setF((c) => ({ ...c, [k]: v }));

  async function aoEnviarImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg(null);
    setEnviando(true);
    const fd = new FormData();
    fd.append("arquivo", file);
    const r = await uploadJornalImagem(fd);
    setEnviando(false);
    if (r.ok && r.chave && r.url) { set("imagem", r.chave); setPreview(r.url); }
    else setMsg({ tipo: "erro", texto: r.erro ?? "Falha no upload" });
    if (inputFile.current) inputFile.current.value = "";
  }

  function salvar() {
    setMsg(null);
    start(async () => {
      const r = await salvarPost(f);
      if (r.ok) { toast.success("Post salvo."); router.push("/admin/jornal"); router.refresh(); }
      else { setMsg({ tipo: "erro", texto: r.erro ?? "Falha ao salvar" }); toast.error(r.erro ?? "Falha ao salvar."); }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* coluna principal */}
        <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-6 shadow-xs">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Título</span>
            <Input value={f.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Título da matéria" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Slug (URL)</span>
            <Input value={f.slug} onChange={(e) => set("slug", e.target.value)} placeholder="gerado do título se vazio" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Resumo / chamada</span>
            <textarea value={f.resumo} onChange={(e) => set("resumo", e.target.value)} rows={2}
              className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-[13px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/15" />
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Conteúdo</span>
            <RichText value={f.conteudo} onChange={(html) => set("conteudo", html)} placeholder="Escreva o corpo do post…" />
          </div>

          <SeoBlock f={f} set={set} />
        </div>

        {/* coluna lateral */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium">Publicado</span>
              <Toggle valor={f.publicado} onChange={(v) => set("publicado", v)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium">Destaque (topo)</span>
              <Toggle valor={f.destaque} onChange={(v) => set("destaque", v)} />
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Data de publicação</span>
              <Input type="date" value={f.dataPublicacao.slice(0, 10)} onChange={(e) => set("dataPublicacao", e.target.value)} />
            </label>
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Categoria</span>
              <CategoriaCombobox value={f.categoria} categorias={categorias} onChange={(v) => set("categoria", v)} />
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Fonte / veículo</span>
              <Input value={f.fonte} onChange={(e) => set("fonte", e.target.value)} placeholder="O Estado de S. Paulo" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Link da matéria original</span>
              <Input value={f.fonteUrl} onChange={(e) => set("fonteUrl", e.target.value)} placeholder="https://..." />
            </label>
          </div>

          {/* imagem destaque */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-xs">
            <span className="text-[13px] font-medium">Imagem de destaque</span>
            <div className="aspect-[16/10] w-full overflow-hidden rounded-lg border border-border bg-muted">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : <div className="grid h-full place-items-center text-[12px] text-foreground-tertiary">sem imagem</div>}
            </div>
            <Input value={f.imagem} onChange={(e) => set("imagem", e.target.value)} placeholder="chave MinIO ou URL" />
            <input ref={inputFile} type="file" accept="image/*" onChange={aoEnviarImagem} className="hidden" />
            <Button variant="outline" onClick={() => inputFile.current?.click()} disabled={enviando}>
              {enviando ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Upload size={14} className="mr-1.5" />}
              {enviando ? "Enviando..." : "Enviar imagem"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={salvar} disabled={pending}>{pending ? "Salvando..." : "Salvar post"}</Button>
        <Button variant="ghost" onClick={() => router.push("/admin/jornal")}>Cancelar</Button>
        {msg && <span className={`text-[13px] font-medium ${msg.tipo === "ok" ? "text-success" : "text-error"}`}>{msg.texto}</span>}
      </div>
    </div>
  );
}

function Toggle({ valor, onChange }: { valor: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={valor} onClick={() => onChange(!valor)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${valor ? "bg-accent" : "bg-border-emphasis"}`}>
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${valor ? "translate-x-[20px]" : "translate-x-0"}`} />
    </button>
  );
}

// Bloco de SEO: usa título/resumo como fallback automático e mostra prévia do Google.
function SeoBlock({ f, set }: { f: PostInput; set: <K extends keyof PostInput>(k: K, v: PostInput[K]) => void }) {
  const tituloFinal = (f.seoTitulo || f.titulo || "Título da matéria").trim();
  const descFinal = (f.seoDescricao || f.resumo || "Adicione um resumo ou descrição SEO.").trim();
  const slug = (f.slug || "").trim();
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-xs">
      <div className="border-b border-border pb-3">
        <h2 className="text-[15px] font-semibold">SEO</h2>
        <p className="mt-0.5 text-[12px] text-foreground-tertiary">Como o post aparece no Google e ao compartilhar. Deixe vazio para usar título e resumo automaticamente.</p>
      </div>

      {/* prévia Google */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="truncate text-[12px] text-[#1a7f37]">benx.com.br › benx-journal › {slug || "slug"}</p>
        <p className="mt-0.5 line-clamp-1 text-[16px] text-[#1a0dab]">{tituloFinal}</p>
        <p className="mt-0.5 line-clamp-2 text-[12px] text-foreground-secondary">{descFinal}</p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="flex items-center justify-between text-[13px] font-medium">
          Título SEO <span className={`text-[11px] ${(f.seoTitulo.length || f.titulo.length) > 60 ? "text-error" : "text-foreground-tertiary"}`}>{f.seoTitulo.length || f.titulo.length}/60</span>
        </span>
        <Input value={f.seoTitulo} onChange={(e) => set("seoTitulo", e.target.value)} placeholder={f.titulo || "Usa o título do post"} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="flex items-center justify-between text-[13px] font-medium">
          Descrição SEO <span className={`text-[11px] ${(f.seoDescricao.length || f.resumo.length) > 160 ? "text-error" : "text-foreground-tertiary"}`}>{f.seoDescricao.length || f.resumo.length}/160</span>
        </span>
        <textarea value={f.seoDescricao} onChange={(e) => set("seoDescricao", e.target.value)} rows={2}
          placeholder={f.resumo || "Usa o resumo do post"}
          className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-[13px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/15" />
      </label>
    </div>
  );
}

// Combobox de categoria: lista as existentes e permite criar uma nova.
function CategoriaCombobox({ value, categorias, onChange }: { value: string; categorias: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const termo = q.trim();
  const filtradas = categorias.filter((c) => c.toLowerCase().includes(termo.toLowerCase()));
  const jaExiste = categorias.some((c) => c.toLowerCase() === termo.toLowerCase());

  function escolher(c: string) { onChange(c); setOpen(false); setQ(""); }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-full items-center justify-between rounded-lg border border-border bg-surface px-3 text-left text-[13px] outline-none transition focus:border-accent"
      >
        <span className={value ? "" : "text-foreground-tertiary"}>{value || "Selecione ou crie uma categoria"}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-foreground-tertiary transition-transform ${open ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          <div className="border-b border-border p-2">
            <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar ou nova categoria…" className="h-8" />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {termo && !jaExiste && (
              <button type="button" onMouseDown={(e) => { e.preventDefault(); escolher(termo); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] text-accent transition hover:bg-muted">
                <Plus size={14} /> Criar “{termo}”
              </button>
            )}
            {filtradas.map((c) => (
              <button key={c} type="button" onMouseDown={(e) => { e.preventDefault(); escolher(c); }} className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-[13px] transition hover:bg-muted ${value === c ? "font-medium text-accent" : ""}`}>
                {c}{value === c ? <Check size={14} /> : null}
              </button>
            ))}
            {filtradas.length === 0 && !termo && <p className="px-2.5 py-2 text-[12px] text-foreground-tertiary">Nenhuma categoria ainda. Digite para criar.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

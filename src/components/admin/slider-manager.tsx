"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, Trash2, Pencil, Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { salvarSlide, removerSlide, reordenarSlides, uploadSlideMidia, type SlideInput } from "@/actions/slider";
import type { SlideAdmin, OpcaoSlideEmpreendimento } from "@/db/queries";

interface LocalOpt { value: string; label: string }

const SUGESTOES_BOTAO = ["Conheça", "Saiba mais", "Ver detalhes", "Quero conhecer", "Agende uma visita"];

const vazio: SlideInput = {
  titulo: "", imagem: "", videoUrl: "", link: "", botaoTexto: "Conheça",
  tags: [], locais: [], ordem: 0, duracao: 6, ativo: true,
};

export function SliderManager({ slides, locais, empreendimentos }: { slides: SlideAdmin[]; locais: LocalOpt[]; empreendimentos: OpcaoSlideEmpreendimento[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editando, setEditando] = useState<SlideInput | null>(null);
  const [tagsRaw, setTagsRaw] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<{ t: "ok" | "erro"; s: string } | null>(null);
  const [sugOpen, setSugOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sugestões de empreendimento conforme o título digitado.
  const sugestoes = (() => {
    const q = (editando?.titulo ?? "").trim().toLowerCase();
    const base = q ? empreendimentos.filter((e) => e.nome.toLowerCase().includes(q)) : empreendimentos;
    return base.slice(0, 8);
  })();

  function aplicarEmpreendimento(e: OpcaoSlideEmpreendimento) {
    setEditando((c) => c && ({
      ...c,
      titulo: e.nome,
      link: e.link || c.link,
      imagem: e.imagem ?? c.imagem,
      tags: e.tags,
      locais: e.vertente && !c.locais.includes(e.vertente) ? [...c.locais, e.vertente] : c.locais,
    }));
    setTagsRaw(e.tags.join(", "));
    if (e.imagemUrl) setPreview(e.imagemUrl);
    setSugOpen(false);
  }

  function novo() { setEditando({ ...vazio }); setTagsRaw(""); setPreview(null); setMsg(null); }
  function editar(s: SlideAdmin) {
    setEditando({ id: s.id, titulo: s.titulo, imagem: s.imagem ?? "", videoUrl: s.videoUrl ?? "", link: s.link ?? "", botaoTexto: s.botaoTexto, tags: s.tags, locais: s.locais, ordem: s.ordem, duracao: s.duracao, ativo: s.ativo });
    setTagsRaw(s.tags.join(", "));
    setPreview(s.imagemPreview); setMsg(null);
  }
  function fechar() { setEditando(null); setPreview(null); }

  const set = <K extends keyof SlideInput>(k: K, v: SlideInput[K]) => setEditando((c) => (c ? { ...c, [k]: v } : c));

  async function aoEnviarArquivo(file: File) {
    setEnviando(true); setMsg(null);
    const fd = new FormData(); fd.append("arquivo", file);
    const r = await uploadSlideMidia(fd);
    setEnviando(false);
    if (r.ok && r.chave && r.url) {
      if (r.tipo === "video") { set("videoUrl", r.chave); }
      else { set("imagem", r.chave); }
      setPreview(r.url);
    } else { setMsg({ t: "erro", s: r.erro ?? "Falha no upload" }); toast.error(r.erro ?? "Falha no upload"); }
    if (fileRef.current) fileRef.current.value = "";
  }
  function aoEnviar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) aoEnviarArquivo(file);
  }

  function toggleLocal(v: string) {
    setEditando((c) => {
      if (!c) return c;
      const has = c.locais.includes(v);
      return { ...c, locais: has ? c.locais.filter((x) => x !== v) : [...c.locais, v] };
    });
  }

  function salvar() {
    if (!editando) return;
    setMsg(null);
    start(async () => {
      const r = await salvarSlide(editando);
      if (r.ok) { fechar(); router.refresh(); toast.success("Slide salvo."); }
      else { setMsg({ t: "erro", s: r.erro ?? "Falha" }); toast.error(r.erro ?? "Falha ao salvar."); }
    });
  }

  function remover(id: string, titulo: string) {
    if (!window.confirm(`Remover o slide "${titulo}"?`)) return;
    start(async () => { await removerSlide(id); router.refresh(); toast.success("Slide removido."); });
  }

  // Reordena dentro de uma home: troca o slide com o vizinho e grava a nova ordem.
  function mover(grupoIds: string[], i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= grupoIds.length) return;
    const next = [...grupoIds];
    [next[i], next[j]] = [next[j], next[i]];
    start(async () => {
      const r = await reordenarSlides(next);
      if (r.ok) router.refresh();
      else toast.error(r.erro ?? "Falha ao reordenar.");
    });
  }

  const rotulo = (v: string) => locais.find((l) => l.value === v)?.label ?? v;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold">Slides do hero</h2>
          <p className="mt-0.5 text-[13px] text-foreground-secondary">Topo das páginas. Marque em quais homes cada slide aparece.</p>
        </div>
        <Button variant="primary" onClick={novo}><Plus size={15} className="mr-1" /> Novo slide</Button>
      </div>

      {/* editor */}
      {editando && (
        <div className="rounded-xl border border-accent/30 bg-surface p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-[14px] font-semibold">{editando.id ? "Editar slide" : "Novo slide"}</h3>
            <button type="button" onClick={fechar} className="text-foreground-tertiary hover:text-foreground"><X size={18} /></button>
          </div>
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-4">
              <div className="relative flex flex-col gap-1.5">
                <span className="text-[13px] font-medium">Título</span>
                <Input
                  value={editando.titulo}
                  onChange={(e) => { set("titulo", e.target.value); setSugOpen(true); }}
                  onFocus={() => setSugOpen(true)}
                  onBlur={() => setTimeout(() => setSugOpen(false), 150)}
                  placeholder="Buscar empreendimento ou digitar título…"
                  autoComplete="off"
                />
                {sugOpen && sugestoes.length > 0 && (
                  <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 max-h-72 overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-lg">
                    <p className="px-3 py-1.5 text-[11px] uppercase tracking-wide text-foreground-tertiary">Empreendimentos</p>
                    {sugestoes.map((e) => (
                      <button
                        key={e.nome + e.link}
                        type="button"
                        onMouseDown={(ev) => { ev.preventDefault(); aplicarEmpreendimento(e); }}
                        className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition hover:bg-muted"
                      >
                        <span className="h-9 w-12 shrink-0 overflow-hidden rounded bg-muted">
                          {e.imagemUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={e.imagemUrl} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium">{e.nome}</span>
                          <span className="block truncate text-[11px] text-foreground-tertiary">{e.tags.join(" · ") || e.link}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                <span className="text-[11px] text-foreground-tertiary">Selecione um empreendimento para preencher imagem, link, tags e local automaticamente.</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium">Texto do botão</span>
                  <Input value={editando.botaoTexto} onChange={(e) => set("botaoTexto", e.target.value)} placeholder="Conheça" />
                  <span className="flex flex-wrap gap-1.5 pt-1">
                    {SUGESTOES_BOTAO.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => set("botaoTexto", s)}
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] transition ${editando.botaoTexto === s ? "border-accent bg-accent/10 text-accent" : "border-border text-foreground-secondary hover:bg-muted"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] font-medium">Ordem</span>
                    <Input type="number" value={editando.ordem} onChange={(e) => set("ordem", parseInt(e.target.value, 10) || 0)} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] font-medium">Duração (s)</span>
                    <Input type="number" min={1} max={60} value={editando.duracao} onChange={(e) => set("duracao", parseInt(e.target.value, 10) || 6)} />
                  </label>
                </div>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium">Link do botão</span>
                <Input value={editando.link} onChange={(e) => set("link", e.target.value)} placeholder="/iconicos/slug ou https://..." />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium">Tags (separe por vírgula)</span>
                <Input
                  value={tagsRaw}
                  onChange={(e) => { setTagsRaw(e.target.value); set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean)); }}
                  placeholder="Em Obras, Jardim Europa"
                />
              </label>
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium">Exibir em</span>
                <div className="flex flex-wrap gap-3">
                  {locais.map((l) => (
                    <label key={l.value} className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-[13px]">
                      <input type="checkbox" checked={editando.locais.includes(l.value)} onChange={() => toggleLocal(l.value)} />
                      {l.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
                <div>
                  <p className="text-[13px] font-medium">{editando.ativo ? "Slide ativo" : "Slide inativo"}</p>
                  <p className="text-[12px] text-foreground-tertiary">{editando.ativo ? "Aparece no carrossel do hero." : "Oculto do site (rascunho)."}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={editando.ativo}
                  onClick={() => set("ativo", !editando.ativo)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${editando.ativo ? "bg-success" : "bg-border-emphasis"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${editando.ativo ? "translate-x-[20px]" : "translate-x-0"}`} />
                </button>
              </div>
            </div>

            {/* mídia */}
            <div className="flex flex-col gap-3">
              <span className="text-[13px] font-medium">Imagem / vídeo de fundo</span>
              <input ref={fileRef} type="file" accept="image/*,video/mp4" onChange={aoEnviar} className="hidden" />
              <div
                onClick={() => !enviando && fileRef.current?.click()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) aoEnviarArquivo(f); }}
                onDragOver={(e) => e.preventDefault()}
                className="group relative grid aspect-[16/10] w-full cursor-pointer place-items-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/40 transition hover:border-accent hover:bg-muted"
              >
                {editando.videoUrl && preview ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video src={preview} muted className="absolute inset-0 h-full w-full object-cover" />
                ) : preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : null}

                {/* overlay de instrução / troca */}
                <div className={`relative z-10 flex flex-col items-center gap-1 text-center text-[12px] ${preview ? "opacity-0 transition group-hover:opacity-100" : "text-foreground-tertiary"}`}>
                  {preview && <div className="absolute inset-0 -z-10 bg-black/40" />}
                  {enviando ? (
                    <Loader2 size={20} className={preview ? "animate-spin text-white" : "animate-spin"} />
                  ) : (
                    <Upload size={20} className={preview ? "text-white" : ""} />
                  )}
                  <span className={preview ? "font-medium text-white" : ""}>
                    {enviando ? "Enviando..." : preview ? "Trocar arquivo" : "Arraste ou clique para enviar"}
                  </span>
                  {!preview && <span className="text-foreground-tertiary">Imagem (8MB) ou vídeo MP4 (60MB)</span>}
                </div>

                {/* remover */}
                {preview && !enviando && (
                  <button
                    type="button"
                    aria-label="Remover mídia"
                    onClick={(e) => { e.stopPropagation(); set("imagem", ""); set("videoUrl", ""); setPreview(null); }}
                    className="absolute right-2 top-2 z-20 grid h-7 w-7 place-items-center rounded-full bg-black/55 text-white transition hover:bg-error"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              <Input value={editando.imagem} onChange={(e) => set("imagem", e.target.value)} placeholder="chave/URL da imagem (opcional)" />

              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-[13px] font-medium">Vídeo de fundo (opcional)</span>
                <Input
                  value={editando.videoUrl}
                  onChange={(e) => { set("videoUrl", e.target.value); if (e.target.value) setPreview(e.target.value); }}
                  placeholder="chave/URL do vídeo .mp4"
                />
                <span className="text-[12px] text-foreground-tertiary">
                  Se houver vídeo, ele é exibido no lugar da imagem (a imagem vira o poster/fallback). Envie pelo campo acima ou cole a URL aqui.
                </span>
                {editando.videoUrl && (
                  <button
                    type="button"
                    onClick={() => { set("videoUrl", ""); setPreview(editando.imagem && /^https?:\/\//.test(editando.imagem) ? editando.imagem : null); }}
                    className="self-start text-[12px] font-medium text-error hover:underline"
                  >
                    Remover vídeo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
            <Button variant="primary" onClick={salvar} disabled={pending}>{pending ? "Salvando..." : "Salvar slide"}</Button>
            <Button variant="ghost" onClick={fechar}>Cancelar</Button>
            {msg && <span className={`text-[13px] font-medium ${msg.t === "ok" ? "text-success" : "text-error"}`}>{msg.s}</span>}
          </div>
        </div>
      )}

      {/* lista agrupada por home: ↑↓ reordena dentro de cada home */}
      <div className="flex flex-col gap-8">
        {slides.length === 0 && <p className="rounded-xl border border-border bg-surface p-8 text-center text-[13px] text-foreground-tertiary">Nenhum slide. Clique em &quot;Novo slide&quot;.</p>}
        {locais.map((local) => {
          const grupo = slides.filter((s) => s.locais.includes(local.value)).sort((a, b) => a.ordem - b.ordem);
          if (grupo.length === 0) return null;
          const grupoIds = grupo.map((s) => s.id);
          return (
            <div key={local.value} className="flex flex-col gap-2">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-foreground-tertiary">
                {local.label} · {grupo.length} slide{grupo.length > 1 ? "s" : ""}
              </h3>
              {grupo.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 shadow-xs">
                  <div className="flex flex-col gap-0.5">
                    <button type="button" aria-label="Subir" onClick={() => mover(grupoIds, i, -1)} disabled={i === 0 || pending} className="grid h-6 w-7 place-items-center rounded border border-border text-foreground-tertiary transition hover:bg-muted hover:text-foreground disabled:opacity-30"><ArrowUp size={13} /></button>
                    <button type="button" aria-label="Descer" onClick={() => mover(grupoIds, i, 1)} disabled={i === grupo.length - 1 || pending} className="grid h-6 w-7 place-items-center rounded border border-border text-foreground-tertiary transition hover:bg-muted hover:text-foreground disabled:opacity-30"><ArrowDown size={13} /></button>
                  </div>
                  <div className="h-16 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                    {s.imagemPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.imagemPreview} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium">{s.titulo}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {s.locais.filter((l) => l !== local.value).map((l) => <span key={l} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-foreground-secondary">+ {rotulo(l)}</span>)}
                      {!s.ativo && <span className="rounded-full bg-error/10 px-2 py-0.5 text-[11px] text-error">inativo</span>}
                      <span className="text-[11px] text-foreground-tertiary">ordem {i + 1}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => editar(s)} className="grid h-8 w-8 place-items-center rounded-md text-foreground-tertiary hover:bg-muted hover:text-foreground"><Pencil size={15} /></button>
                  <button type="button" onClick={() => remover(s.id, s.titulo)} disabled={pending} className="grid h-8 w-8 place-items-center rounded-md text-foreground-tertiary hover:bg-error/10 hover:text-error disabled:opacity-40"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

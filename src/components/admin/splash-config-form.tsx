"use client";

import { useRef, useState, useTransition } from "react";
import { ChevronUp, ChevronDown, Trash2, Plus, Upload, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { salvarSplashConfig, uploadSplashMidia } from "@/actions/splash";
import type { SplashConfig, SplashBotao, SplashLogoKey } from "@/lib/splash";

const LOGO_OPCOES: { value: SplashLogoKey; label: string }[] = [
  { value: "benx", label: "Benx" },
  { value: "viva", label: "Viva Benx" },
  { value: "extra", label: "Extra" },
];

type Previews = { video: string; benx: string; viva: string; extra: string };

export function SplashConfigForm({ inicial, previews: previewsIniciais }: { inicial: SplashConfig; previews: Previews }) {
  const [cfg, setCfg] = useState<SplashConfig>(inicial);
  const [previews, setPreviews] = useState<Previews>(previewsIniciais);
  const [estado, setEstado] = useState<"idle" | "ok" | "erro">("idle");
  const [pending, start] = useTransition();

  const set = <K extends keyof SplashConfig>(k: K, v: SplashConfig[K]) => setCfg((c) => ({ ...c, [k]: v }));
  const setPreview = (k: keyof Previews, v: string) => setPreviews((p) => ({ ...p, [k]: v }));

  function setBotao(i: number, patch: Partial<SplashBotao>) {
    setCfg((c) => ({ ...c, botoes: c.botoes.map((b, idx) => (idx === i ? { ...b, ...patch } : b)) }));
  }
  function addBotao() {
    setCfg((c) => ({ ...c, botoes: [...c.botoes, { label: "Novo Link", logoKey: "benx", href: "#", showLabel: true, subtitle: "", logoSize: 40 }] }));
  }
  function removerBotao(i: number) {
    setCfg((c) => ({ ...c, botoes: c.botoes.filter((_, idx) => idx !== i) }));
  }
  function moverBotao(i: number, dir: -1 | 1) {
    setCfg((c) => {
      const j = i + dir;
      if (j < 0 || j >= c.botoes.length) return c;
      const arr = [...c.botoes];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...c, botoes: arr };
    });
  }

  function previewDoBotao(b: SplashBotao): string {
    return b.logoKey === "viva" ? previews.viva : b.logoKey === "extra" ? previews.extra : previews.benx;
  }

  function salvar() {
    setEstado("idle");
    start(async () => {
      const r = await salvarSplashConfig(cfg);
      setEstado(r.ok ? "ok" : "erro");
      if (r.ok) toast.success("Splash page salva.");
      else toast.error(r.erro ?? "Falha ao salvar.");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho + ativar como home */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-[15px] font-semibold">Splash page</h2>
            <p className="mt-0.5 text-[13px] text-foreground-secondary">Tela de entrada com vídeo de fundo e seleção das marcas.</p>
          </div>
          <label className="flex items-center gap-2 text-[13px] font-medium">
            Usar como página inicial
            <button
              type="button"
              role="switch"
              aria-checked={cfg.usarComoHome}
              onClick={() => set("usarComoHome", !cfg.usarComoHome)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${cfg.usarComoHome ? "bg-accent" : "bg-border-emphasis"}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${cfg.usarComoHome ? "translate-x-[20px]" : "translate-x-0"}`} />
            </button>
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-5">
          <CampoMidia
            titulo="Vídeo de fundo (.mp4)"
            tipo="video"
            valor={cfg.videoUrl}
            preview={previews.video}
            onChange={(v) => set("videoUrl", v)}
            onUpload={(chave, url) => { set("videoUrl", chave); setPreview("video", url); }}
          />
          <div className="grid gap-5 sm:grid-cols-3">
            <CampoMidia titulo="Logo Benx" tipo="imagem" valor={cfg.logoBenx} preview={previews.benx}
              onChange={(v) => set("logoBenx", v)} onUpload={(c, u) => { set("logoBenx", c); setPreview("benx", u); }} />
            <CampoMidia titulo="Logo Viva Benx" tipo="imagem" valor={cfg.logoViva} preview={previews.viva}
              onChange={(v) => set("logoViva", v)} onUpload={(c, u) => { set("logoViva", c); setPreview("viva", u); }} />
            <CampoMidia titulo="Logo Extra" tipo="imagem" valor={cfg.logoExtra} preview={previews.extra}
              onChange={(v) => set("logoExtra", v)} onUpload={(c, u) => { set("logoExtra", c); setPreview("extra", u); }} />
          </div>
        </div>
      </div>

      {/* Pré-visualização */}
      <div className="overflow-hidden rounded-xl border border-border shadow-xs">
        <div className="border-b border-border bg-surface px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-foreground-tertiary">Prévia</div>
        <div className="relative flex min-h-[220px] items-center justify-center gap-6 overflow-hidden bg-[hsl(0,0%,5%)] p-6">
          {previews.video ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={previews.video} autoPlay muted loop playsInline className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60" />
          ) : null}
          <div className="pointer-events-none absolute inset-0" style={{ background: "rgba(13,13,13,.6)" }} />
          {cfg.botoes.map((b, i) => (
            <div key={i} className="relative flex items-center gap-6">
              {i > 0 && <span className="h-16 w-px" style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,.25), transparent)" }} />}
              <div className="flex flex-col items-center px-4 text-center">
                {previewDoBotao(b) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewDoBotao(b)} alt={b.label} style={{ height: `${Math.min(120, b.logoSize)}px` }} className="w-auto object-contain" />
                ) : <span className="text-[12px] text-white/40">sem logo</span>}
                {b.showLabel && b.label && <span className="mt-2 text-[9px] uppercase tracking-[0.3em] text-white">{b.label}</span>}
                {b.subtitle && <span className="mt-3 max-w-[160px] whitespace-pre-line text-[11px] leading-snug text-white/60">{b.subtitle}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botões de navegação */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-[15px] font-semibold">Botões de navegação</h2>
          <Button variant="outline" onClick={addBotao}><Plus size={15} className="mr-1" /> Botão</Button>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {cfg.botoes.map((b, i) => (
            <div key={i} className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[13px] font-semibold">Botão {i + 1}</h3>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moverBotao(i, -1)} disabled={i === 0} className="text-foreground-tertiary hover:text-foreground disabled:opacity-30"><ChevronUp size={16} /></button>
                  <button type="button" onClick={() => moverBotao(i, 1)} disabled={i === cfg.botoes.length - 1} className="text-foreground-tertiary hover:text-foreground disabled:opacity-30"><ChevronDown size={16} /></button>
                  <button type="button" onClick={() => removerBotao(i)} className="ml-1 text-foreground-tertiary hover:text-error"><Trash2 size={15} /></button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-medium">Label</span>
                  <Input value={b.label} onChange={(e) => setBotao(i, { label: e.target.value })} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-medium">Link (URL)</span>
                  <Input value={b.href} onChange={(e) => setBotao(i, { href: e.target.value })} placeholder="/iconicos" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-medium">Logo</span>
                  <select value={b.logoKey} onChange={(e) => setBotao(i, { logoKey: e.target.value as SplashLogoKey })} className="h-9 rounded-lg border border-border bg-surface px-2 text-[13px] outline-none focus:border-accent">
                    {LOGO_OPCOES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-medium">Tamanho do logo (px)</span>
                  <Input type="number" min={10} max={400} value={b.logoSize} onChange={(e) => setBotao(i, { logoSize: parseInt(e.target.value, 10) || 40 })} />
                </label>
                <label className="flex flex-col gap-1.5 sm:col-span-2">
                  <span className="text-[12px] font-medium">Subtítulo</span>
                  <textarea
                    value={b.subtitle}
                    onChange={(e) => setBotao(i, { subtitle: e.target.value })}
                    rows={2}
                    className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-foreground shadow-xs outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                  />
                </label>
                <label className="flex items-center gap-2 text-[12px] font-medium sm:col-span-2">
                  <input type="checkbox" checked={b.showLabel} onChange={(e) => setBotao(i, { showLabel: e.target.checked })} />
                  Exibir label
                </label>
              </div>
            </div>
          ))}
          {cfg.botoes.length === 0 && <p className="py-6 text-center text-[13px] text-foreground-tertiary">Nenhum botão. Clique em &quot;Botão&quot; para adicionar.</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={salvar} disabled={pending}>{pending ? "Salvando..." : "Salvar splash"}</Button>
        {estado === "ok" && <span className="text-[13px] font-medium text-success">Salvo.</span>}
        {estado === "erro" && <span className="text-[13px] font-medium text-error">Falha ao salvar.</span>}
        {!cfg.usarComoHome && <span className="text-[12px] text-foreground-tertiary">A splash não está ativa como home.</span>}
      </div>
    </div>
  );
}

// Campo de mídia: upload direto para o MinIO + URL manual + prévia.
function CampoMidia({
  titulo, tipo, valor, preview, onChange, onUpload,
}: {
  titulo: string;
  tipo: "imagem" | "video";
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
      <span className="text-[13px] font-medium">{titulo}</span>
      <div className="flex items-start gap-3">
        {/* prévia */}
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-muted">
          {preview ? (
            tipo === "video" ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={preview} muted className="h-full w-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full w-full object-contain p-1" />
            )
          ) : (
            <span className="text-[10px] text-foreground-tertiary">vazio</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Input value={valor} onChange={(e) => onChange(e.target.value)} placeholder={tipo === "video" ? "/bg-hero.mp4 ou URL" : "/logo.svg ou URL"} />
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={tipo === "video" ? "video/mp4,video/webm" : "image/*"}
              onChange={aoSelecionar}
              className="hidden"
            />
            <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={enviando}>
              {enviando ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Upload size={14} className="mr-1.5" />}
              {enviando ? "Enviando..." : "Enviar arquivo"}
            </Button>
            {erro && <span className="text-[12px] text-error">{erro}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

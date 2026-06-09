"use client";

import { useRef, useState, useTransition } from "react";
import { Trash2, Plus, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { salvarFooterConfig, uploadFooterMidia } from "@/actions/footer";
import type { FooterConfig, FooterLink } from "@/lib/footer-config";

export function FooterConfigForm({ inicial, previews }: { inicial: FooterConfig; previews: { logo: string; bg: string } }) {
  const [cfg, setCfg] = useState<FooterConfig>(inicial);
  const [prevLogo, setPrevLogo] = useState(previews.logo);
  const [prevBg, setPrevBg] = useState(previews.bg);
  const [pending, start] = useTransition();
  const set = <K extends keyof FooterConfig>(k: K, v: FooterConfig[K]) => setCfg((c) => ({ ...c, [k]: v }));
  const setRede = (k: keyof FooterConfig["redes"], v: string) => setCfg((c) => ({ ...c, redes: { ...c.redes, [k]: v } }));

  function salvar() {
    start(async () => {
      const r = await salvarFooterConfig(cfg);
      if (r.ok) toast.success("Footer salvo.");
      else toast.error(r.erro ?? "Falha ao salvar.");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Marca + contato */}
      <Card titulo="Marca e contato">
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoMidia label="Logo" tipo="logo" valor={cfg.logo} preview={prevLogo}
            onChange={(v) => set("logo", v)} onUpload={(c, u) => { set("logo", c); setPrevLogo(u); }} onLimpar={() => { set("logo", ""); setPrevLogo(""); }} />
          <CampoMidia label="Imagem de fundo" tipo="bg" valor={cfg.bgUrl} preview={prevBg}
            onChange={(v) => set("bgUrl", v)} onUpload={(c, u) => { set("bgUrl", c); setPrevBg(u); }} onLimpar={() => { set("bgUrl", ""); setPrevBg(""); }} />
        </div>
        <CampoArea label="Frase" value={cfg.frase} onChange={(v) => set("frase", v)} rows={2} hint="Uma linha por quebra." />
        <CampoTexto label="Link do botão “Sobre a Benx”" value={cfg.sobreUrl} onChange={(v) => set("sobreUrl", v)} placeholder="/sobre" />
        <CampoArea label="Endereço" value={cfg.endereco} onChange={(v) => set("endereco", v)} rows={2} />
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto label="Telefone (exibido)" value={cfg.telefone} onChange={(v) => set("telefone", v)} placeholder="0800 729 1981" />
          <CampoTexto label="Telefone (link)" value={cfg.telefoneLink} onChange={(v) => set("telefoneLink", v)} placeholder="tel:08007291981" />
        </div>
      </Card>

      {/* Redes sociais */}
      <Card titulo="Redes sociais (URLs)">
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto label="Facebook" value={cfg.redes.facebook} onChange={(v) => setRede("facebook", v)} />
          <CampoTexto label="X (Twitter)" value={cfg.redes.x} onChange={(v) => setRede("x", v)} />
          <CampoTexto label="YouTube" value={cfg.redes.youtube} onChange={(v) => setRede("youtube", v)} />
          <CampoTexto label="Instagram" value={cfg.redes.instagram} onChange={(v) => setRede("instagram", v)} />
          <CampoTexto label="Pinterest" value={cfg.redes.pinterest} onChange={(v) => setRede("pinterest", v)} />
        </div>
        <p className="text-[12px] text-foreground-tertiary">Deixe em branco para ocultar a rede.</p>
      </Card>

      {/* Colunas de links */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card titulo="Coluna de links">
          <ListaLinks lista={cfg.paginas} onChange={(v) => set("paginas", v)} />
        </Card>
        <Card titulo="Links institucionais">
          <ListaLinks lista={cfg.institucional} onChange={(v) => set("institucional", v)} />
        </Card>
      </div>

      {/* Rodapé inferior */}
      <Card titulo="Barra inferior">
        <CampoTexto label="Copyright" value={cfg.copyright} onChange={(v) => set("copyright", v)} />
        <CampoTexto label="Design by" value={cfg.designBy} onChange={(v) => set("designBy", v)} />
      </Card>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={salvar} disabled={pending}>{pending ? "Salvando..." : "Salvar footer"}</Button>
      </div>
    </div>
  );
}

function ListaLinks({ lista, onChange }: { lista: FooterLink[]; onChange: (v: FooterLink[]) => void }) {
  const upd = (i: number, patch: Partial<FooterLink>) => onChange(lista.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const mover = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= lista.length) return;
    const arr = [...lista]; [arr[i], arr[j]] = [arr[j], arr[i]]; onChange(arr);
  };
  return (
    <div className="flex flex-col gap-2">
      {lista.map((l, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col">
            <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} className="text-foreground-tertiary hover:text-foreground disabled:opacity-30">▲</button>
            <button type="button" onClick={() => mover(i, 1)} disabled={i === lista.length - 1} className="text-foreground-tertiary hover:text-foreground disabled:opacity-30">▼</button>
          </div>
          <Input value={l.label} onChange={(e) => upd(i, { label: e.target.value })} placeholder="Texto" className="flex-1" />
          <Input value={l.href} onChange={(e) => upd(i, { href: e.target.value })} placeholder="/url" className="w-40" />
          <button type="button" onClick={() => onChange(lista.filter((_, idx) => idx !== i))} className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-foreground-tertiary hover:bg-error/10 hover:text-error"><Trash2 size={15} /></button>
        </div>
      ))}
      <Button variant="outline" onClick={() => onChange([...lista, { label: "", href: "#" }])}><Plus size={14} className="mr-1" /> Link</Button>
    </div>
  );
}

function CampoMidia({
  label, tipo, valor, preview, onChange, onUpload, onLimpar,
}: {
  label: string;
  tipo: "logo" | "bg";
  valor: string;
  preview: string;
  onChange: (v: string) => void;
  onUpload: (chave: string, url: string) => void;
  onLimpar: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);

  async function aoSelecionar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEnviando(true);
    const fd = new FormData(); fd.append("arquivo", file);
    const r = await uploadFooterMidia(fd);
    setEnviando(false);
    if (r.ok && r.chave && r.url) onUpload(r.chave, r.url);
    else toast.error(r.erro ?? "Falha no upload");
    if (ref.current) ref.current.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-medium">{label}</span>
      <input ref={ref} type="file" accept="image/*" onChange={aoSelecionar} className="hidden" />
      <div
        onClick={() => !enviando && ref.current?.click()}
        className={`group relative grid h-28 w-full cursor-pointer place-items-center overflow-hidden rounded-lg border-2 border-dashed border-border transition hover:border-accent ${tipo === "logo" ? "bg-[#1b2435]" : "bg-muted/40"}`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className={tipo === "logo" ? "max-h-16 w-auto object-contain" : "absolute inset-0 h-full w-full object-cover"} />
        ) : null}
        <div className={`relative z-10 flex flex-col items-center gap-1 text-[12px] ${preview ? "opacity-0 transition group-hover:opacity-100" : tipo === "logo" ? "text-white/60" : "text-foreground-tertiary"}`}>
          {preview && <div className="absolute inset-0 -z-10 bg-black/45" />}
          {enviando ? <Loader2 size={18} className={`animate-spin ${preview ? "text-white" : ""}`} /> : <Upload size={18} className={preview ? "text-white" : ""} />}
          <span className={preview ? "font-medium text-white" : ""}>{enviando ? "Enviando..." : preview ? "Trocar" : "Arraste ou clique"}</span>
        </div>
        {preview && !enviando && (
          <button type="button" aria-label="Remover" onClick={(e) => { e.stopPropagation(); onLimpar(); }} className="absolute right-2 top-2 z-20 grid h-7 w-7 place-items-center rounded-full bg-black/55 text-white transition hover:bg-error">
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <Input value={valor} onChange={(e) => onChange(e.target.value)} placeholder={tipo === "logo" ? "/logo-benx-branco.png ou URL" : "/footer-bg.jpg ou URL"} />
    </div>
  );
}

function Card({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-xs">
      <h2 className="border-b border-border pb-3 text-[15px] font-semibold">{titulo}</h2>
      {children}
    </div>
  );
}
function CampoTexto({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium">{label}</span>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}
function CampoArea({ label, value, onChange, rows = 2, hint }: { label: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
        className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-[13px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/15" />
      {hint ? <span className="text-[12px] text-foreground-tertiary">{hint}</span> : null}
    </label>
  );
}

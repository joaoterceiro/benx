"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, X, Loader2, Copy, Check, Building2 } from "lucide-react";
import { toast } from "sonner";
import { verificarUsoMidia, excluirMidiaBiblioteca } from "@/actions/midia";
import type { MidiaItem } from "@/lib/storage";

function nomeDe(chave: string): string {
  return chave.split("/").pop() || chave;
}

export function MidiaExcluirModal({ item, onFechar, onExcluido }: { item: MidiaItem | null; onFechar: () => void; onExcluido: () => void }) {
  const [carregando, setCarregando] = useState(false);
  const [usos, setUsos] = useState<{ nome: string; slug: string }[]>([]);
  const [texto, setTexto] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  // Carrega os vínculos sempre que abre para um item.
  useEffect(() => {
    if (!item) return;
    setTexto("");
    setCopiado(false);
    setUsos([]);
    setCarregando(true);
    let vivo = true;
    verificarUsoMidia(item.chave).then((r) => { if (vivo) { setUsos(r.empreendimentos); setCarregando(false); } });
    return () => { vivo = false; };
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !excluindo) onFechar(); };
    document.addEventListener("keydown", onKey);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = anterior; };
  }, [item, excluindo, onFechar]);

  if (!item) return null;

  const nome = nomeDe(item.chave);
  const confere = texto.trim() === nome;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(nome);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      toast.error("Não foi possível copiar.");
    }
  }

  async function excluir() {
    if (!confere || !item) return;
    setExcluindo(true);
    const r = await excluirMidiaBiblioteca(item.chave);
    setExcluindo(false);
    if (r.ok) { toast.success("Mídia excluída."); onExcluido(); }
    else toast.error(r.erro ?? "Falha ao excluir.");
  }

  return (
    <div
      className="fixed inset-0 z-[2147483600] grid place-items-center p-4"
      style={{ background: "rgba(5,8,15,.6)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
      onClick={() => { if (!excluindo) onFechar(); }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label="Excluir mídia"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 text-foreground shadow-[0_28px_64px_rgba(0,0,0,0.65)]"
        style={{ background: "#1b1b1f" }}
      >
        <div className="flex items-start gap-3 px-6 pt-6">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "rgba(225,29,42,0.14)", color: "#F2555A" }}>
            <AlertTriangle size={20} strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-semibold leading-tight">Excluir esta mídia?</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-foreground-secondary">
              Ação permanente. O arquivo será apagado e qualquer página que o utilize ficará sem a imagem (links e galerias quebram).
            </p>
          </div>
          <button type="button" aria-label="Fechar" disabled={excluindo} onClick={onFechar} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-foreground-tertiary transition hover:bg-white/[0.07] hover:text-foreground disabled:opacity-40">
            <X size={16} />
          </button>
        </div>

        {/* vínculo com empreendimento */}
        <div className="px-6 pt-4">
          {carregando ? (
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-3 text-[12px] text-foreground-tertiary">
              <Loader2 size={14} className="animate-spin" /> Verificando vínculos...
            </div>
          ) : usos.length > 0 ? (
            <div className="rounded-lg border border-[#F2555A]/30 bg-[#F2555A]/[0.08] px-3.5 py-3">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-[#F2555A]">
                <Building2 size={14} /> Vinculada a {usos.length === 1 ? "um empreendimento" : `${usos.length} empreendimentos`}
              </p>
              <ul className="mt-1.5 flex flex-col gap-1">
                {usos.map((e) => (
                  <li key={e.slug}>
                    <Link href={`/admin/empreendimentos`} className="text-[13px] font-medium text-foreground underline-offset-2 hover:underline">{e.nome}</Link>
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-[11px] text-foreground-tertiary">Excluir vai deixar {usos.length === 1 ? "esse empreendimento" : "esses empreendimentos"} sem essa mídia.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-3 text-[12px] text-foreground-tertiary">
              Nenhum vínculo direto com empreendimento encontrado. Ainda assim, confirme com atenção: a mídia pode ser usada em outros lugares (slides, blog, ESG).
            </div>
          )}
        </div>

        {/* confirmação copiar e colar */}
        <div className="px-6 pb-2 pt-5">
          <p className="text-[12px] text-foreground-secondary">
            Para confirmar, copie o nome do arquivo e cole abaixo:
          </p>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2">
            <code className="min-w-0 flex-1 truncate text-[12px] text-foreground" title={nome}>{nome}</code>
            <button type="button" onClick={copiar} className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/12 px-2 py-1 text-[11px] font-medium text-foreground-secondary transition hover:bg-white/10 hover:text-foreground">
              {copiado ? <><Check size={12} className="text-success" /> Copiado</> : <><Copy size={12} /> Copiar</>}
            </button>
          </div>
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && confere) excluir(); }}
            placeholder="Cole o nome do arquivo aqui"
            autoComplete="off"
            spellCheck={false}
            className="mt-2 h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 text-[13px] text-foreground outline-none transition focus:border-[#E11D2A]/60 focus:bg-white/[0.06]"
          />
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6 pt-4">
          <button type="button" onClick={onFechar} disabled={excluindo} className="rounded-lg border border-white/12 bg-white/[0.04] px-5 py-2.5 text-[13px] font-medium text-foreground-secondary transition hover:bg-white/10 hover:text-foreground disabled:opacity-40">
            Cancelar
          </button>
          <button
            type="button"
            disabled={!confere || excluindo}
            onClick={excluir}
            className="inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: confere ? "#E11D2A" : "#7a1f25", boxShadow: confere ? "0 4px 18px rgba(225,29,42,0.45)" : "none" }}
          >
            {excluindo ? <><Loader2 size={14} className="animate-spin" /> Excluindo...</> : "Excluir mídia"}
          </button>
        </div>
      </div>
    </div>
  );
}

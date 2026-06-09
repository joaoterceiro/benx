"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { salvarConfiguracoes } from "@/actions/configuracoes";
import { WhatsAppPreview } from "@/components/public/whatsapp-float";

interface Cfg { whatsappNumero: string; whatsappAtivo: boolean; whatsappTexto: string; whatsappMensagem: string }

export function ConfiguracoesForm({ inicial }: { inicial: Cfg }) {
  const [numero, setNumero] = useState(inicial.whatsappNumero);
  const [ativo, setAtivo] = useState(inicial.whatsappAtivo);
  const [texto, setTexto] = useState(inicial.whatsappTexto);
  const [mensagem, setMensagem] = useState(inicial.whatsappMensagem);
  const [estado, setEstado] = useState<"idle" | "ok" | "erro">("idle");
  const [pending, start] = useTransition();

  const digits = numero.replace(/\D/g, "");

  function salvar() {
    setEstado("idle");
    start(async () => {
      const r = await salvarConfiguracoes({ whatsappNumero: numero, whatsappAtivo: ativo, whatsappTexto: texto, whatsappMensagem: mensagem });
      setEstado(r.ok ? "ok" : "erro");
      if (r.ok) toast.success("Configurações do WhatsApp salvas.");
      else toast.error(r.erro ?? "Falha ao salvar.");
    });
  }

  return (
    <div className="max-w-xl rounded-xl border border-border bg-surface p-6 shadow-xs">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-[15px] font-semibold">Botão de WhatsApp</h2>
          <p className="mt-0.5 text-[13px] text-foreground-secondary">Botão flutuante &quot;Fale agora&quot; exibido em todas as páginas.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={ativo}
          onClick={() => setAtivo((v) => !v)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${ativo ? "bg-[#25D366]" : "bg-border-emphasis"}`}
        >
          <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${ativo ? "translate-x-[20px]" : "translate-x-0"}`} />
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Número do WhatsApp</span>
          <Input
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="5511999999999"
            inputMode="tel"
          />
          <span className="text-[12px] text-foreground-tertiary">
            Com código do país e DDD, só números. Ex.: 55 + 11 + 99999-9999 → <code>5511999999999</code>.
            {digits ? <> Link: <code>wa.me/{digits}</code></> : null}
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Texto de status</span>
          <Input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Online · responde em minutos" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Mensagem pré-preenchida</span>
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            rows={2}
            placeholder="Olá! Tenho interesse no {empreendimento} e gostaria de mais informações."
            className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-foreground shadow-xs outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
          <span className="text-[12px] text-foreground-tertiary">
            Use <code>{"{empreendimento}"}</code> para inserir o nome do empreendimento nas páginas de produto (removido nas demais páginas).
          </span>
        </label>
      </div>

      <div className="mt-5">
        <WhatsAppPreview numero={numero} texto={texto} mensagem={mensagem} ativo={ativo} />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="primary" onClick={salvar} disabled={pending}>
          {pending ? "Salvando..." : "Salvar configurações"}
        </Button>
        {estado === "ok" && <span className="text-[13px] font-medium text-success">Salvo.</span>}
        {estado === "erro" && <span className="text-[13px] font-medium text-error">Falha ao salvar.</span>}
        {!ativo && <span className="text-[12px] text-foreground-tertiary">O botão está desativado.</span>}
      </div>
    </div>
  );
}

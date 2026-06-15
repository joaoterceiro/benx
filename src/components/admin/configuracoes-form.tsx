"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { salvarConfiguracoes } from "@/actions/configuracoes";

interface Cfg {
  whatsappNumero: string;
  whatsappAtivo: boolean;
  whatsappTexto: string;
  whatsappMensagem: string;
  atendStatus: string;
  atendTelefone: string;
  atendEmail: string;
  atendCanal: string;
  atendCanalHorario: string;
}

export function ConfiguracoesForm({ inicial }: { inicial: Cfg }) {
  const [c, setC] = useState<Cfg>(inicial);
  const [pending, start] = useTransition();
  const set = <K extends keyof Cfg>(k: K, v: Cfg[K]) => setC((p) => ({ ...p, [k]: v }));
  const digits = c.whatsappNumero.replace(/\D/g, "");

  function salvar() {
    start(async () => {
      const r = await salvarConfiguracoes(c);
      if (r.ok) toast.success("Configurações de atendimento salvas.");
      else toast.error(r.erro ?? "Falha ao salvar.");
    });
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-[15px] font-semibold">Botão de Atendimento</h2>
            <p className="mt-0.5 text-[13px] text-foreground-secondary">Launcher flutuante &quot;Atendimento&quot; com os canais, exibido em todas as páginas.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={c.whatsappAtivo}
            onClick={() => set("whatsappAtivo", !c.whatsappAtivo)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${c.whatsappAtivo ? "bg-emerald-500" : "bg-border-emphasis"}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${c.whatsappAtivo ? "translate-x-[20px]" : "translate-x-0"}`} />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Texto de status</span>
            <Input value={c.atendStatus} onChange={(e) => set("atendStatus", e.target.value)} placeholder="Online · Equipe disponível agora" />
          </label>
        </div>
      </div>

      {/* WhatsApp */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
        <h2 className="border-b border-border pb-4 text-[15px] font-semibold">Canal WhatsApp</h2>
        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Número do WhatsApp</span>
            <Input value={c.whatsappNumero} onChange={(e) => set("whatsappNumero", e.target.value)} placeholder="5511999999999" inputMode="tel" />
            <span className="text-[12px] text-foreground-tertiary">
              Com código do país e DDD, só números. Ex.: 55 + 11 + 99999-9999 → <code>5511999999999</code>.
              {digits ? <> Link: <code>wa.me/{digits}</code></> : null}
            </span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Mensagem pré-preenchida</span>
            <textarea
              value={c.whatsappMensagem}
              onChange={(e) => set("whatsappMensagem", e.target.value)}
              rows={2}
              placeholder="Olá! Tenho interesse no {empreendimento} e gostaria de mais informações."
              className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-foreground shadow-xs outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
            <span className="text-[12px] text-foreground-tertiary">
              Use <code>{"{empreendimento}"}</code> para inserir o nome do empreendimento nas páginas de produto (removido nas demais).
            </span>
          </label>
        </div>
      </div>

      {/* Outros canais */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
        <h2 className="border-b border-border pb-4 text-[15px] font-semibold">Outros canais</h2>
        <p className="mt-2 text-[12px] text-foreground-tertiary">Deixe um campo vazio para ocultar aquele canal no launcher.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Central de vendas (telefone)</span>
            <Input value={c.atendTelefone} onChange={(e) => set("atendTelefone", e.target.value)} placeholder="0800 729 1981" inputMode="tel" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">E-mail de vendas</span>
            <Input value={c.atendEmail} onChange={(e) => set("atendEmail", e.target.value)} placeholder="vendas@benx.com.br" inputMode="email" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Canal de Atendimento (telefone)</span>
            <Input value={c.atendCanal} onChange={(e) => set("atendCanal", e.target.value)} placeholder="4003-8503" inputMode="tel" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Horário do canal</span>
            <Input value={c.atendCanalHorario} onChange={(e) => set("atendCanalHorario", e.target.value)} placeholder="Seg - Sex · 9:00 às 17:00" />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={salvar} disabled={pending}>{pending ? "Salvando..." : "Salvar configurações"}</Button>
        {!c.whatsappAtivo && <span className="text-[12px] text-foreground-tertiary">O botão de atendimento está desativado.</span>}
      </div>
    </div>
  );
}

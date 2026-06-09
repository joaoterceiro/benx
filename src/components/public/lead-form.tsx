"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { criarLead } from "@/actions/leads";

export function LeadForm({
  empreendimentoId,
  origem,
  cor,
}: {
  empreendimentoId: string;
  origem: string;
  cor: string;
}) {
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", mensagem: "" });
  const [consentido, setConsentido] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviado, setEnviado] = useState(false);
  const [pending, startTransition] = useTransition();

  function enviar() {
    setErros({});
    startTransition(async () => {
      const r = await criarLead({ ...form, empreendimentoId, origem, consentimento: consentido });
      if (r.ok) setEnviado(true);
      else setErros(r.campos ?? { _: r.erro });
    });
  }

  if (enviado) {
    return (
      <div className="border border-success/30 bg-success/5 p-5 text-[14px] text-foreground">
        Recebemos seu contato. Em breve falaremos com você.
      </div>
    );
  }

  return (
    <div className="border border-border bg-surface p-5 shadow-xs">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nome" required error={erros.nome} className="sm:col-span-2">
          <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        </Field>
        <Field label="E-mail" error={erros.email}>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Telefone">
          <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
        </Field>
        <Field label="Mensagem" className="sm:col-span-2">
          <Textarea value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} />
        </Field>
      </div>
      <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[12px] leading-relaxed text-foreground-secondary">
        <input
          type="checkbox"
          checked={consentido}
          onChange={(e) => setConsentido(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#0a2a66]"
        />
        <span>
          Li e concordo com a{" "}
          <a href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-2 hover:opacity-80">
            Política de Privacidade
          </a>{" "}
          e autorizo o contato e o tratamento dos meus dados para esta finalidade.
        </span>
      </label>
      {erros.consentimento ? <p className="mt-1 text-[12px] text-error">{erros.consentimento}</p> : null}
      {erros._ ? <p className="mt-2 text-[12px] text-error">{erros._}</p> : null}
      <button
        type="button"
        onClick={enviar}
        disabled={pending}
        className="mt-4 inline-flex h-10 items-center px-5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: cor }}
      >
        {pending ? "Enviando..." : "Tenho interesse"}
      </button>
    </div>
  );
}

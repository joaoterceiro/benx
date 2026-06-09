"use client";

import { useState, useTransition } from "react";
import { criarLead } from "@/actions/leads";

const VERDE = "#5bbf6a";

export function CorretorForm({ empreendimentoId, origem }: { empreendimentoId: string; origem: string }) {
  const [form, setForm] = useState({ nome: "", email: "", telefone: "" });
  const [consentido, setConsentido] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviado, setEnviado] = useState(false);
  const [pending, start] = useTransition();

  function enviar() {
    setErros({});
    start(async () => {
      const r = await criarLead({ ...form, empreendimentoId, origem, consentimento: consentido });
      if (r.ok) setEnviado(true);
      else setErros(r.campos ?? { _: r.erro });
    });
  }

  if (enviado) {
    return (
      <div className="border border-white/20 bg-white/10 p-6 text-[15px] text-white">
        Recebemos seu contato. Em breve falaremos com você.
      </div>
    );
  }

  const input =
    "w-full bg-white px-5 py-3.5 text-[15px] text-[#1a2230] outline-none transition placeholder:text-[#9aa0ab] focus:ring-2 focus:ring-white/50";

  return (
    <div className="flex flex-col gap-3.5">
      <input
        className={input}
        placeholder="Nome completo"
        value={form.nome}
        onChange={(e) => setForm({ ...form, nome: e.target.value })}
      />
      {erros.nome && <p className="-mt-2 text-[12px] text-red-300">{erros.nome}</p>}
      <input
        type="email"
        className={input}
        placeholder="Seu melhor e-mail"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      {erros.email && <p className="-mt-2 text-[12px] text-red-300">{erros.email}</p>}
      <input
        className={input}
        placeholder="Celular/WhatsApp"
        value={form.telefone}
        onChange={(e) => setForm({ ...form, telefone: e.target.value })}
      />
      {erros._ && <p className="text-[12px] text-red-300">{erros._}</p>}
      <label className="flex cursor-pointer items-start gap-2.5 text-[12px] leading-relaxed text-white/80">
        <input
          type="checkbox"
          checked={consentido}
          onChange={(e) => setConsentido(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-white"
        />
        <span>
          Li e concordo com a{" "}
          <a href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-2 hover:opacity-80">
            Política de Privacidade
          </a>{" "}
          e autorizo o contato.
        </span>
      </label>
      {erros.consentimento && <p className="-mt-1 text-[12px] text-red-300">{erros.consentimento}</p>}
      <button
        type="button"
        onClick={enviar}
        disabled={pending}
        className="w-full py-4 text-[14px] font-semibold text-white transition hover:brightness-105 disabled:opacity-60"
        style={{ background: VERDE }}
      >
        {pending ? "Enviando..." : "Enviar mensagem"}
      </button>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RichText } from "@/components/admin/rich-text";
import { salvarLegal, type LegalInput } from "@/actions/legal";

export function LegalConfigForm({ inicial }: { inicial: LegalInput }) {
  const [f, setF] = useState<LegalInput>(inicial);
  const [pending, start] = useTransition();
  const set = <K extends keyof LegalInput>(k: K, v: LegalInput[K]) => setF((s) => ({ ...s, [k]: v }));

  function salvar() {
    start(async () => {
      const r = await salvarLegal(f);
      if (r.ok) toast.success("Textos legais salvos.");
      else toast.error(r.erro ?? "Falha ao salvar.");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Section titulo="Política de Privacidade" hint="Exibida em /politica-de-privacidade e no modal de privacidade.">
        <RichText value={f.politica} onChange={(html) => set("politica", html)} placeholder="Conteúdo da Política de Privacidade…" />
      </Section>

      <Section titulo="Termos de Uso" hint="Exibidos em /termos-de-uso.">
        <RichText value={f.termos} onChange={(html) => set("termos", html)} placeholder="Conteúdo dos Termos de Uso…" />
      </Section>

      <Section titulo="Banner de cookies" hint="Texto curto exibido no aviso de cookies (sem formatação).">
        <textarea
          value={f.cookiesTexto}
          onChange={(e) => set("cookiesTexto", e.target.value)}
          rows={3}
          className="w-full resize-y rounded-md border border-border bg-muted px-3 py-2 text-[14px] text-foreground outline-none transition placeholder:text-foreground-tertiary focus:border-foreground/30"
          placeholder="Utilizamos cookies para melhorar sua experiência…"
        />
      </Section>

      <div className="flex justify-end">
        <Button onClick={salvar} disabled={pending}>{pending ? "Salvando…" : "Salvar alterações"}</Button>
      </div>
    </div>
  );
}

function Section({ titulo, hint, children }: { titulo: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border p-5">
      <h2 className="text-[15px] font-semibold text-foreground">{titulo}</h2>
      {hint && <p className="mt-1 text-[12px] text-foreground-tertiary">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

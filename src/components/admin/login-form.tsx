"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { entrar } from "@/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    startTransition(async () => {
      const r = await entrar({ email, senha });
      if (r.ok) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        setErro(r.erro);
      }
    });
  }

  return (
    <form onSubmit={submeter} className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-md">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Benx Admin</h1>
        <p className="text-[13px] text-foreground-secondary">Entre para gerenciar o portal.</p>
      </div>
      <Field label="E-mail">
        <Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Senha" error={erro ?? undefined}>
        <Input type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
      </Field>
      <Button type="submit" variant="primary" size="lg" disabled={pending}>
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}

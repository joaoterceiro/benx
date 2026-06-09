"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, KeyRound, ShieldCheck, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { criarUsuario, removerUsuario, alterarPapel, redefinirSenha, alterarMinhaSenha, type UsuarioDTO, type Papel } from "@/actions/usuarios";
import { useConfirm } from "@/components/admin/confirm-dialog";

export function UsuariosManager({ usuarios, sessaoId, ehAdmin }: { usuarios: UsuarioDTO[]; sessaoId: string; ehAdmin: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const confirmar = useConfirm();

  // form de criação
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [papel, setPapel] = useState<Papel>("editor");
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [ve, setVe] = useState<{ nome?: string; email?: string; senha?: string }>({});

  function validarCampo(campo: "nome" | "email" | "senha"): string | undefined {
    if (campo === "nome") return nome.trim().length < 2 ? "Informe o nome completo." : undefined;
    if (campo === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? undefined : "E-mail inválido.";
    return senha.length < 8 ? "Mínimo 8 caracteres." : undefined;
  }

  // minha senha
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");

  function trocarMinhaSenha() {
    start(async () => {
      const r = await alterarMinhaSenha(atual, nova);
      if (r.ok) { toast.success("Sua senha foi alterada."); setAtual(""); setNova(""); }
      else toast.error(r.erro ?? "Falha ao alterar senha.");
    });
  }

  function criar() {
    const erros = { nome: validarCampo("nome"), email: validarCampo("email"), senha: validarCampo("senha") };
    setVe(erros);
    const primeiro = (["nome", "email", "senha"] as const).find((c) => erros[c]);
    if (primeiro) { document.getElementById(`u-${primeiro}`)?.focus(); return; }
    setMsg(null);
    start(async () => {
      const r = await criarUsuario({ nome, email, senha, papel });
      if (r.ok) {
        setMsg({ tipo: "ok", texto: "Usuário criado." });
        setNome(""); setEmail(""); setSenha(""); setPapel("editor"); setVe({});
        router.refresh();
        toast.success("Usuário criado.");
      } else {
        setMsg({ tipo: "erro", texto: r.erro ?? "Falha." });
        toast.error(r.erro ?? "Falha ao criar usuário.");
      }
    });
  }

  function acao(fn: () => Promise<{ ok: boolean; erro?: string }>) {
    start(async () => {
      const r = await fn();
      if (!r.ok) { setMsg({ tipo: "erro", texto: r.erro ?? "Falha." }); toast.error(r.erro ?? "Falha."); }
      else { setMsg(null); router.refresh(); toast.success("Atualizado."); }
    });
  }

  async function removerU(u: UsuarioDTO) {
    const ok = await confirmar({
      titulo: `Remover o usuário "${u.nome}"?`,
      descricao: `O acesso de ${u.email} será revogado permanentemente.`,
    });
    if (ok) acao(() => removerUsuario(u.id));
  }

  function pedirSenha(id: string) {
    const nova = window.prompt("Nova senha (mín. 8 caracteres):");
    if (nova == null) return;
    start(async () => {
      const r = await redefinirSenha(id, nova);
      setMsg(r.ok ? { tipo: "ok", texto: "Senha redefinida." } : { tipo: "erro", texto: r.erro ?? "Falha." });
      if (r.ok) toast.success("Senha redefinida.");
      else toast.error(r.erro ?? "Falha ao redefinir senha.");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Minha senha (qualquer usuário) */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <KeyRound size={18} className="text-foreground-secondary" />
          <h2 className="text-[15px] font-semibold">Minha senha</h2>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Senha atual</span>
            <Input type="password" value={atual} onChange={(e) => setAtual(e.target.value)} placeholder="••••••••" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Nova senha</span>
            <Input type="password" value={nova} onChange={(e) => setNova(e.target.value)} placeholder="Mín. 8 caracteres" />
          </label>
        </div>
        <div className="mt-5">
          <Button variant="primary" onClick={trocarMinhaSenha} disabled={pending || !atual || nova.length < 8}>Alterar minha senha</Button>
        </div>
      </div>

      {/* Criar usuário */}
      {ehAdmin && (
        <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <UserPlus size={18} className="text-foreground-secondary" />
            <h2 className="text-[15px] font-semibold">Novo usuário</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Nome</span>
              <Input id="u-nome" value={nome} aria-invalid={!!ve.nome} onChange={(e) => { setNome(e.target.value); if (ve.nome) setVe((v) => ({ ...v, nome: undefined })); }} onBlur={() => setVe((v) => ({ ...v, nome: validarCampo("nome") }))} placeholder="Nome completo" />
              {ve.nome && <span className="text-[12px] text-error">{ve.nome}</span>}
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">E-mail</span>
              <Input id="u-email" type="email" value={email} aria-invalid={!!ve.email} onChange={(e) => { setEmail(e.target.value); if (ve.email) setVe((v) => ({ ...v, email: undefined })); }} onBlur={() => setVe((v) => ({ ...v, email: validarCampo("email") }))} placeholder="pessoa@benx.com.br" />
              {ve.email && <span className="text-[12px] text-error">{ve.email}</span>}
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Senha</span>
              <Input id="u-senha" type="password" value={senha} aria-invalid={!!ve.senha} onChange={(e) => { setSenha(e.target.value); if (ve.senha) setVe((v) => ({ ...v, senha: undefined })); }} onBlur={() => setVe((v) => ({ ...v, senha: validarCampo("senha") }))} placeholder="Mín. 8 caracteres" />
              {ve.senha && <span className="text-[12px] text-error">{ve.senha}</span>}
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Papel</span>
              <select value={papel} onChange={(e) => setPapel(e.target.value as Papel)} className="h-9 rounded-lg border border-border bg-surface px-2 text-[13px] outline-none focus:border-accent">
                <option value="editor">Editor</option>
                <option value="admin">Administrador</option>
              </select>
            </label>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <Button variant="primary" onClick={criar} loading={pending}>Criar usuário</Button>
            {msg && <span className={`text-[13px] font-medium ${msg.tipo === "ok" ? "text-success" : "text-error"}`}>{msg.texto}</span>}
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-[15px] font-semibold">Usuários ({usuarios.length})</h2>
          {!ehAdmin && <p className="mt-0.5 text-[12px] text-foreground-tertiary">Apenas administradores podem criar, alterar ou remover usuários.</p>}
        </div>
        <ul className="divide-y divide-border">
          {usuarios.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-3 px-6 py-4">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/10 text-[12px] font-bold text-accent">
                {u.nome.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">
                  {u.nome}
                  {u.id === sessaoId && <span className="ml-2 text-[11px] text-foreground-tertiary">(você)</span>}
                </p>
                <p className="truncate text-[12px] text-foreground-tertiary">{u.email}</p>
              </div>

              {ehAdmin ? (
                <select
                  value={u.papel}
                  onChange={(e) => acao(() => alterarPapel(u.id, e.target.value as Papel))}
                  disabled={pending}
                  className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] outline-none focus:border-accent"
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Administrador</option>
                </select>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground-secondary">
                  <ShieldCheck size={13} /> {u.papel === "admin" ? "Administrador" : "Editor"}
                </span>
              )}

              {ehAdmin && (
                <div className="flex items-center gap-1">
                  <button type="button" title="Redefinir senha" onClick={() => pedirSenha(u.id)} disabled={pending} className="grid h-8 w-8 place-items-center rounded-md text-foreground-tertiary transition hover:bg-muted hover:text-foreground">
                    <KeyRound size={15} />
                  </button>
                  <button type="button" title="Remover" onClick={() => removerU(u)} disabled={pending || u.id === sessaoId} className="grid h-8 w-8 place-items-center rounded-md text-foreground-tertiary transition hover:bg-error/10 hover:text-error disabled:opacity-30">
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </li>
          ))}
          {usuarios.length === 0 && <li className="px-6 py-5 text-[13px] text-foreground-tertiary">Nenhum usuário.</li>}
        </ul>
      </div>
    </div>
  );
}

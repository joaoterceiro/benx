"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, Trash2, Loader2, Building2, SearchX } from "lucide-react";
import { excluirEmpreendimento, duplicarEmpreendimento, definirVisibilidadeEmLote, excluirEmLote } from "@/actions/empreendimentos";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusBadge, toneStatusLabel } from "@/components/admin/status-badge";

export interface LinhaTabela {
  id: string;
  nome: string;
  slug: string;
  statusLabel: string;
  vertenteLabel: string;
  vertenteCor: string;
  cidade: string;
  visivel: boolean;
  imagemUrl: string | null;
}

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

export function EmpreendimentosTable({ itens }: { itens: LinhaTabela[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(() => searchParams.get("q") ?? "");
  const [status, setStatus] = useState("");
  const [vis, setVis] = useState<"" | "sim" | "nao">("");
  const [ordem, setOrdem] = useState<{ campo: "nome" | "cidade" | "statusLabel" | "vertenteLabel"; dir: 1 | -1 }>({ campo: "nome", dir: 1 });
  const [pagina, setPagina] = useState(1);
  const PER_PAGE = 15;

  const statusOpcoes = useMemo(
    () => [...new Set(itens.map((i) => i.statusLabel).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [itens]
  );

  const filtrados = useMemo(() => {
    const nq = norm(q.trim());
    const lista = itens.filter((e) => {
      if (status && e.statusLabel !== status) return false;
      if (vis === "sim" && !e.visivel) return false;
      if (vis === "nao" && e.visivel) return false;
      if (nq && !norm(`${e.nome} ${e.slug} ${e.cidade}`).includes(nq)) return false;
      return true;
    });
    return [...lista].sort((a, b) => a[ordem.campo].localeCompare(b[ordem.campo], "pt-BR") * ordem.dir);
  }, [itens, q, status, vis, ordem]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PER_PAGE));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const paginados = filtrados.slice((paginaAtual - 1) * PER_PAGE, paginaAtual * PER_PAGE);

  function ordenarPor(campo: typeof ordem.campo) {
    setOrdem((o) => ({ campo, dir: o.campo === campo ? (o.dir === 1 ? -1 : 1) : 1 }));
    setPagina(1);
  }
  const seta = (campo: typeof ordem.campo) => (ordem.campo === campo ? (ordem.dir === 1 ? " ↑" : " ↓") : "");

  const temFiltro = !!(q || status || vis);
  const limpar = () => { setQ(""); setStatus(""); setVis(""); setPagina(1); };

  const [sel, setSel] = useState<Set<string>>(new Set());
  const idsPagina = paginados.map((p) => p.id);
  const todosNaPagina = idsPagina.length > 0 && idsPagina.every((id) => sel.has(id));
  const selecionados = [...sel];

  function toggle(id: string) {
    setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  function toggleTodos() {
    setSel((s) => {
      const n = new Set(s);
      if (todosNaPagina) idsPagina.forEach((id) => n.delete(id));
      else idsPagina.forEach((id) => n.add(id));
      return n;
    });
  }

  const confirmar = useConfirm();
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [visOverride, setVisOverride] = useState<Record<string, boolean>>({});
  const ehVisivel = (e: LinhaTabela) => (e.id in visOverride ? visOverride[e.id] : e.visivel);

  // Optimistic: alterna visibilidade na hora; reverte com toast se falhar.
  function alternarVisivel(e: LinhaTabela) {
    const novo = !ehVisivel(e);
    setVisOverride((p) => ({ ...p, [e.id]: novo }));
    startTransition(async () => {
      const r = await definirVisibilidadeEmLote([e.id], novo);
      if (!r.ok) {
        setVisOverride((p) => ({ ...p, [e.id]: !novo }));
        toast.error(r.erro ?? "Não foi possível alterar a visibilidade.");
      } else {
        toast.success(novo ? "Empreendimento visível." : "Empreendimento oculto.");
      }
    });
  }

  async function excluir(id: string, nome: string) {
    const ok = await confirmar({
      titulo: `Excluir "${nome}"?`,
      descricao: "Esta ação é permanente e não pode ser desfeita.",
    });
    if (!ok) return;
    setExcluindoId(id);
    startTransition(async () => {
      await excluirEmpreendimento(id);
      router.refresh();
      setExcluindoId(null);
      toast.success(`"${nome}" excluído.`);
    });
  }

  function duplicar(id: string) {
    startTransition(async () => {
      const r = await duplicarEmpreendimento(id);
      if (r.ok) { router.refresh(); toast.success("Empreendimento duplicado (oculto)."); }
      else toast.error(r.erro ?? "Falha ao duplicar.");
    });
  }

  function visibilidadeLote(visivel: boolean) {
    startTransition(async () => {
      const r = await definirVisibilidadeEmLote(selecionados, visivel);
      if (r.ok) { setSel(new Set()); router.refresh(); toast.success(visivel ? "Marcados como visíveis." : "Marcados como ocultos."); }
      else toast.error(r.erro ?? "Falha.");
    });
  }
  async function excluirLote() {
    const ok = await confirmar({
      titulo: `Excluir ${selecionados.length} empreendimento(s)?`,
      descricao: "Todos os selecionados serão removidos permanentemente.",
    });
    if (!ok) return;
    startTransition(async () => {
      const r = await excluirEmLote(selecionados);
      if (r.ok) { setSel(new Set()); router.refresh(); toast.success("Excluídos."); }
      else toast.error(r.erro ?? "Falha.");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar: busca + filtros (instantâneo, no cliente) */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          <Input
            placeholder="Buscar por nome, slug ou cidade…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
            aria-label="Buscar empreendimentos"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full sm:w-48" aria-label="Filtrar por status">
          <option value="">Todos os status</option>
          {statusOpcoes.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select value={vis} onChange={(e) => setVis(e.target.value as "" | "sim" | "nao")} className="w-full sm:w-44" aria-label="Filtrar por visibilidade">
          <option value="">Visíveis e ocultos</option>
          <option value="sim">Só visíveis</option>
          <option value="nao">Só ocultos</option>
        </Select>
        {temFiltro && (
          <button onClick={limpar} className="text-[12px] font-medium text-accent hover:underline">Limpar</button>
        )}
      </div>

      {selecionados.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-accent/30 bg-accent/[0.06] px-3 py-2">
          <span className="text-[13px] font-medium text-accent">{selecionados.length} selecionado(s)</span>
          <span className="mx-1 h-4 w-px bg-border" />
          <button onClick={() => visibilidadeLote(true)} disabled={pending} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-[12px] font-medium transition hover:bg-muted disabled:opacity-40"><Eye size={14} /> Publicar</button>
          <button onClick={() => visibilidadeLote(false)} disabled={pending} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-[12px] font-medium transition hover:bg-muted disabled:opacity-40"><EyeOff size={14} /> Ocultar</button>
          <button onClick={excluirLote} disabled={pending} className="inline-flex items-center gap-1.5 rounded-md border border-error/30 bg-surface px-2.5 py-1 text-[12px] font-medium text-error transition hover:bg-error/10 disabled:opacity-40"><Trash2 size={14} /> Excluir</button>
          <button onClick={() => setSel(new Set())} className="ml-auto text-[12px] font-medium text-accent hover:underline">Limpar seleção</button>
        </div>
      ) : (
        <p className="text-[12px] text-foreground-tertiary">
          {filtrados.length} {filtrados.length === 1 ? "resultado" : "resultados"}
          {temFiltro ? ` de ${itens.length}` : ""}
        </p>
      )}

      {itens.length === 0 ? (
        <EmptyState
          icon={Building2}
          titulo="Nenhum empreendimento ainda"
          descricao="Cadastre o primeiro empreendimento para começar a montar o portfólio."
          acao={{ label: "Novo empreendimento", href: "/admin/empreendimentos/novo" }}
        />
      ) : filtrados.length === 0 ? (
        <EmptyState
          icon={SearchX}
          titulo="Nenhum resultado"
          descricao="Nenhum empreendimento corresponde à busca ou aos filtros aplicados."
          acao={{ label: "Limpar filtros", onClick: limpar }}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-xs">
          <table className="w-full min-w-[680px] text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-foreground-tertiary">
                <th className="px-4 py-2.5"><input type="checkbox" checked={todosNaPagina} onChange={toggleTodos} aria-label="Selecionar todos" /></th>
                <th className="px-4 py-2.5 font-medium" />
                <th className="cursor-pointer select-none px-4 py-2.5 font-medium hover:text-foreground" onClick={() => ordenarPor("nome")}>Nome{seta("nome")}</th>
                <th className="cursor-pointer select-none px-4 py-2.5 font-medium hover:text-foreground" onClick={() => ordenarPor("vertenteLabel")}>Vertente{seta("vertenteLabel")}</th>
                <th className="cursor-pointer select-none px-4 py-2.5 font-medium hover:text-foreground" onClick={() => ordenarPor("cidade")}>Cidade{seta("cidade")}</th>
                <th className="cursor-pointer select-none px-4 py-2.5 font-medium hover:text-foreground" onClick={() => ordenarPor("statusLabel")}>Status{seta("statusLabel")}</th>
                <th className="px-4 py-2.5 font-medium">Visível</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {paginados.map((e) => (
                <tr key={e.id} className={`border-b border-border last:border-0 ${sel.has(e.id) ? "bg-accent/[0.04]" : ""}`}>
                  <td className="px-4 py-2.5"><input type="checkbox" checked={sel.has(e.id)} onChange={() => toggle(e.id)} aria-label={`Selecionar ${e.nome}`} /></td>
                  <td className="py-2 pl-4 pr-0">
                    <div className="h-11 w-16 overflow-hidden rounded-md bg-muted">
                      {e.imagemUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={e.imagemUrl} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-medium">{e.nome}</td>
                  <td className="px-4 py-2.5">
                    <Badge style={{ color: e.vertenteCor, background: `${e.vertenteCor}1a` }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: e.vertenteCor }} />
                      {e.vertenteLabel}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-foreground-secondary">{e.cidade || "—"}</td>
                  <td className="px-4 py-2.5"><StatusBadge tone={toneStatusLabel(e.statusLabel)}>{e.statusLabel}</StatusBadge></td>
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => alternarVisivel(e)}
                      disabled={pending}
                      title={ehVisivel(e) ? "Clique para ocultar" : "Clique para tornar visível"}
                      aria-pressed={ehVisivel(e)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset transition disabled:opacity-50 ${ehVisivel(e) ? "bg-[var(--success)]/15 text-[var(--success)] ring-[var(--success)]/25" : "bg-white/[0.06] text-foreground-tertiary ring-white/10 hover:text-foreground"}`}
                    >
                      {ehVisivel(e) ? <Eye size={13} /> : <EyeOff size={13} />}
                      {ehVisivel(e) ? "Visível" : "Oculto"}
                    </button>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/empreendimentos/${e.id}`}>
                        <Button variant="outline" size="sm">Editar</Button>
                      </Link>
                      <button type="button" title="Duplicar" disabled={pending} onClick={() => duplicar(e.id)} className="grid h-8 w-8 place-items-center rounded-md text-foreground-tertiary transition hover:bg-muted hover:text-foreground disabled:opacity-40">
                        <Copy size={15} />
                      </button>
                      <button type="button" title="Excluir" disabled={pending} onClick={() => excluir(e.id, e.nome)} className="grid h-8 w-8 place-items-center rounded-md text-foreground-tertiary transition hover:bg-error/10 hover:text-error disabled:opacity-40">
                        {excluindoId === e.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-3 pt-1 text-[13px]">
          <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={paginaAtual <= 1} className="rounded-md border border-border px-3 py-1.5 transition hover:bg-muted disabled:opacity-40">Anterior</button>
          <span className="text-foreground-secondary">Página {paginaAtual} de {totalPaginas}</span>
          <button onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={paginaAtual >= totalPaginas} className="rounded-md border border-border px-3 py-1.5 transition hover:bg-muted disabled:opacity-40">Próxima</button>
        </div>
      )}
    </div>
  );
}

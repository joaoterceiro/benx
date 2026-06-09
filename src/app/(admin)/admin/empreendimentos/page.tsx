import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { listarVertentes, vertentePorValue, type VertenteValue } from "@/lib/ecossistema";
import { listarEmpreendimentosAdmin } from "@/db/queries";
import { getUrl } from "@/lib/storage";
import { statusObraLabel } from "@/lib/labels";
import {
  EmpreendimentosTable,
  type LinhaTabela,
} from "@/components/admin/empreendimentos-table";

const VALORES_VALIDOS = new Set(["benx_iconicos", "benx", "vivabenx"]);

export default async function EmpreendimentosPage({
  searchParams,
}: {
  searchParams: Promise<{ vertente?: string }>;
}) {
  const { vertente } = await searchParams;
  const escopo =
    vertente && VALORES_VALIDOS.has(vertente) ? (vertente as VertenteValue) : undefined;

  const rows = await listarEmpreendimentosAdmin(escopo);
  const itens: LinhaTabela[] = await Promise.all(
    rows.map(async (e) => {
      const info = e.linhaProduto ? vertentePorValue(e.linhaProduto.slug) : undefined;
      return {
        id: e.id,
        nome: e.nome,
        slug: e.slug,
        statusLabel: statusObraLabel(e.statusObra),
        vertenteLabel: info?.label ?? "—",
        vertenteCor: info?.cor ?? "#9B9BA3",
        cidade: e.cidade?.nome ?? "",
        visivel: e.visivel,
        imagemUrl: e.imagemPrincipal ? await getUrl(e.imagemPrincipal) : null,
      };
    })
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Empreendimentos</h1>
          <p className="text-sm text-foreground-secondary">
            {itens.length} {itens.length === 1 ? "resultado" : "resultados"}
            {escopo ? ` no ecossistema ${vertentePorValue(escopo)?.label}` : " em todas as vertentes"}
          </p>
        </div>
        <Link href="/admin/empreendimentos/novo">
          <Button variant="primary">Novo empreendimento</Button>
        </Link>
      </div>

      {/* Pills de vertente (filtro de 1º nível) */}
      <div className="flex flex-wrap gap-2">
        <Pill href="/admin/empreendimentos" ativo={!escopo} label="Todas" />
        {listarVertentes().map((v) => (
          <Pill
            key={v.value}
            href={`/admin/empreendimentos?vertente=${v.value}`}
            ativo={escopo === v.value}
            label={v.label}
            cor={v.cor}
          />
        ))}
      </div>

      <EmpreendimentosTable itens={itens} />
    </div>
  );
}

function Pill({ href, ativo, label, cor }: { href: string; ativo: boolean; label: string; cor?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
        ativo
          ? "border-border-emphasis bg-surface text-foreground shadow-xs"
          : "border-border bg-canvas text-foreground-secondary hover:bg-muted"
      )}
      style={ativo && cor ? { color: cor, borderColor: cor } : undefined}
    >
      {cor ? <span className="h-1.5 w-1.5 rounded-full" style={{ background: cor }} /> : null}
      {label}
    </Link>
  );
}

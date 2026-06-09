"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { menuItens, configuracoes } from "@/db/schema";
import { getSessao } from "@/lib/auth";
import { logError } from "@/lib/log-context";

export interface MenuItemInput {
  key: string; // identificador local (cliente) para vincular pai/filho
  texto: string;
  url: string;
  ordem: number;
  parentKey: string | null; // chave local do pai (null = item raiz)
  ativo: boolean;
}

export interface MenuConfigInput {
  footerLogo: string;
  footerTitulo: string;
  footerContato: string;
  rootSize: number;
  rootWeight: number;
  subSize: number;
  subWeight: number;
}

type Resultado = { ok: boolean; erro?: string };

// Salva a lista inteira de itens (substitui tudo): mais simples para o editor do admin.
export async function salvarMenuItens(itens: MenuItemInput[]): Promise<Resultado> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };

  const limpos = itens
    .map((i, idx) => ({ ...i, texto: (i.texto ?? "").trim(), url: (i.url ?? "").trim(), ordem: Number.isFinite(i.ordem) ? i.ordem : idx + 1 }))
    .filter((i) => i.texto.length > 0 && i.url.length > 0);

  try {
    await db.transaction(async (tx) => {
      await tx.delete(menuItens);
      // 1ª passada: raízes (mapeia chave local -> id real gerado)
      const mapa = new Map<string, string>();
      const raizes = limpos.filter((i) => !i.parentKey);
      for (const r of raizes) {
        const [row] = await tx
          .insert(menuItens)
          .values({ texto: r.texto, url: r.url, ordem: r.ordem, parentId: null, ativo: r.ativo })
          .returning({ id: menuItens.id });
        mapa.set(r.key, row.id);
      }
      // 2ª passada: filhos (resolve parentKey -> id real; órfãos viram raiz)
      const filhos = limpos.filter((i) => i.parentKey);
      for (const f of filhos) {
        const pid = (f.parentKey && mapa.get(f.parentKey)) || null;
        await tx
          .insert(menuItens)
          .values({ texto: f.texto, url: f.url, ordem: f.ordem, parentId: pid, ativo: f.ativo });
      }
    });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "menu" }, "Falha ao salvar itens do menu");
    return { ok: false, erro: "Falha ao salvar itens do menu" };
  }
}

export async function salvarMenuConfig(input: MenuConfigInput): Promise<Resultado> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };

  const pares: [string, string][] = [
    ["menu_footer_logo", (input.footerLogo ?? "").trim()],
    ["menu_footer_title", (input.footerTitulo ?? "").trim()],
    ["menu_footer_contact", (input.footerContato ?? "").trim()],
    ["menu_root_size", String(input.rootSize ?? 16)],
    ["menu_root_weight", String(input.rootWeight ?? 500)],
    ["menu_sub_size", String(input.subSize ?? 14)],
    ["menu_sub_weight", String(input.subWeight ?? 400)],
  ];
  try {
    for (const [chave, valor] of pares) {
      await db
        .insert(configuracoes)
        .values({ chave, valor })
        .onConflictDoUpdate({ target: configuracoes.chave, set: { valor, atualizadoEm: new Date() } });
    }
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "menu" }, "Falha ao salvar configurações do menu");
    return { ok: false, erro: "Falha ao salvar configurações do menu" };
  }
}

// Reservado caso o editor remova um único item via id (não usado pelo editor em lote).
export async function removerMenuItem(id: string): Promise<Resultado> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };
  try {
    await db.delete(menuItens).where(eq(menuItens.id, id));
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "menu" }, "Falha ao remover item");
    return { ok: false, erro: "Falha ao remover item" };
  }
}

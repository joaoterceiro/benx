"use server";

import { revalidatePath } from "next/cache";
import { eq, and, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { postsJornal } from "@/db/schema";
import { getSessao } from "@/lib/auth";
import { uploadMidia, getUrl } from "@/lib/storage";
import { logError } from "@/lib/log-context";
import { sanitizarHtml } from "@/lib/sanitize";

export interface PostInput {
  id?: string;
  titulo: string;
  slug: string;
  categoria: string;
  fonte: string;
  fonteUrl: string;
  resumo: string;
  conteudo: string;
  imagem: string;       // chave MinIO ou path/URL
  seoTitulo: string;
  seoDescricao: string;
  dataPublicacao: string; // ISO (yyyy-mm-dd ou completo)
  destaque: boolean;
  publicado: boolean;
}

type Resultado = { ok: boolean; erro?: string; id?: string };

function slugify(s: string): string {
  return s
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

async function slugUnico(base: string, ignorarId?: string): Promise<string> {
  const raiz = slugify(base) || "post";
  let slug = raiz;
  let n = 1;
  // garante unicidade
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existe = await db.query.postsJornal.findFirst({
      where: ignorarId ? and(eq(postsJornal.slug, slug), ne(postsJornal.id, ignorarId)) : eq(postsJornal.slug, slug),
    });
    if (!existe) return slug;
    n += 1;
    slug = `${raiz}-${n}`;
  }
}

export async function salvarPost(input: PostInput): Promise<Resultado> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };

  const titulo = (input.titulo ?? "").trim();
  if (titulo.length < 3) return { ok: false, erro: "Informe o título" };

  const slug = await slugUnico(input.slug?.trim() || titulo, input.id);
  const data = input.dataPublicacao ? new Date(input.dataPublicacao) : new Date();
  const valores = {
    titulo,
    slug,
    categoria: (input.categoria ?? "").trim() || "Sem categoria",
    fonte: (input.fonte ?? "").trim() || null,
    fonteUrl: (input.fonteUrl ?? "").trim() || null,
    resumo: (input.resumo ?? "").trim() || null,
    conteudo: ((c) => (c ? sanitizarHtml(c) : null))((input.conteudo ?? "").trim() || null),
    imagem: (input.imagem ?? "").trim() || null,
    seoTitulo: (input.seoTitulo ?? "").trim() || null,
    seoDescricao: (input.seoDescricao ?? "").trim() || null,
    dataPublicacao: isNaN(data.getTime()) ? new Date() : data,
    destaque: !!input.destaque,
    publicado: !!input.publicado,
    atualizadoEm: new Date(),
  };

  try {
    let id = input.id;
    if (id) {
      await db.update(postsJornal).set(valores).where(eq(postsJornal.id, id));
    } else {
      const [row] = await db.insert(postsJornal).values(valores).returning({ id: postsJornal.id });
      id = row.id;
    }
    revalidatePath("/benx-journal");
    revalidatePath("/admin/jornal");
    return { ok: true, id };
  } catch (err) {
    await logError({ err, action: "jornal" }, "Falha ao salvar o post");
    return { ok: false, erro: "Falha ao salvar o post" };
  }
}

export async function duplicarPost(id: string): Promise<Resultado> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };
  const orig = await db.query.postsJornal.findFirst({ where: eq(postsJornal.id, id) });
  if (!orig) return { ok: false, erro: "Post não encontrado" };
  const titulo = `${orig.titulo} (cópia)`;
  const slug = await slugUnico(titulo);
  try {
    const [row] = await db.insert(postsJornal).values({
      titulo, slug, categoria: orig.categoria, fonte: orig.fonte, fonteUrl: orig.fonteUrl,
      resumo: orig.resumo, conteudo: orig.conteudo, imagem: orig.imagem,
      seoTitulo: orig.seoTitulo, seoDescricao: orig.seoDescricao,
      dataPublicacao: new Date(), destaque: false, publicado: false,
    }).returning({ id: postsJornal.id });
    revalidatePath("/admin/jornal");
    return { ok: true, id: row.id };
  } catch (err) {
    await logError({ err, action: "jornal" }, "Falha ao duplicar");
    return { ok: false, erro: "Falha ao duplicar" };
  }
}

export async function alternarDestaque(id: string, destaque: boolean): Promise<Resultado> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };
  try {
    await db.update(postsJornal).set({ destaque }).where(eq(postsJornal.id, id));
    revalidatePath("/benx-journal");
    revalidatePath("/admin/jornal");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "jornal" }, "Falha ao alterar destaque");
    return { ok: false, erro: "Falha ao alterar destaque" };
  }
}

export async function removerPost(id: string): Promise<Resultado> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };
  try {
    await db.delete(postsJornal).where(eq(postsJornal.id, id));
    revalidatePath("/benx-journal");
    revalidatePath("/admin/jornal");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "jornal" }, "Falha ao remover");
    return { ok: false, erro: "Falha ao remover" };
  }
}

export async function uploadJornalImagem(
  formData: FormData
): Promise<{ ok: boolean; chave?: string; url?: string; erro?: string }> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };
  const file = formData.get("arquivo");
  if (!(file instanceof File) || file.size === 0) return { ok: false, erro: "Arquivo inválido" };
  if (!file.type.startsWith("image/")) return { ok: false, erro: "Envie uma imagem" };
  if (file.size > 8 * 1024 * 1024) return { ok: false, erro: "Imagem acima de 8MB" };

  const nome = (file.name || "img").replace(/[^a-zA-Z0-9.\-_]/g, "-").toLowerCase();
  const chave = `jornal/${Date.now().toString(36)}-${nome}`;
  try {
    await uploadMidia(chave, Buffer.from(await file.arrayBuffer()), file.type);
    return { ok: true, chave, url: await getUrl(chave) };
  } catch (err) {
    await logError({ err, action: "jornal" }, "Falha no upload");
    return { ok: false, erro: "Falha no upload" };
  }
}

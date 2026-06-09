import { NextResponse } from "next/server";
import { buscarGlass } from "@/db/queries";
import { logError } from "@/lib/log-context";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const get = (k: string) => sp.get(k)?.trim() || undefined;
  try {
    const r = await buscarGlass({
      q: get("q"),
      tipo: get("tipo"),
      categoria: get("categoria"),
      cidade: get("cidade"),
      bairro: get("bairro"),
      status: get("status"),
    });
    return NextResponse.json(r);
  } catch (err) {
    await logError({ err, action: "api_busca", q: get("q") }, "falha na busca");
    return NextResponse.json({ items: [], total: 0, erro: true }, { status: 500 });
  }
}

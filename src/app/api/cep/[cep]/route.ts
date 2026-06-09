import { NextResponse } from "next/server";
import { cacheGet, cacheSet } from "@/lib/cache";
import { logWarn } from "@/lib/log-context";

// Proxy ViaCEP com cache Redis (CEP muda pouco; TTL longo).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ cep: string }> }
) {
  const { cep: bruto } = await params;
  const cep = bruto.replace(/\D/g, "");
  if (cep.length !== 8) {
    return NextResponse.json({ erro: "CEP inválido" }, { status: 400 });
  }

  const chave = `cep:${cep}`;
  const cacheado = await cacheGet<unknown>(chave);
  if (cacheado) return NextResponse.json(cacheado);

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = (await res.json()) as { erro?: boolean };
    if (data.erro) {
      return NextResponse.json({ erro: "CEP não encontrado" }, { status: 404 });
    }
    await cacheSet(chave, data, 60 * 60 * 24 * 7); // 7 dias
    return NextResponse.json(data);
  } catch (err) {
    await logWarn({ err, action: "api_cep", cep }, "viacep indisponível");
    return NextResponse.json({ erro: "Falha ao consultar o CEP" }, { status: 502 });
  }
}

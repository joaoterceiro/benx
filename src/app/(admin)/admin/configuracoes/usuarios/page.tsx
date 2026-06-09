import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { listarUsuarios } from "@/actions/usuarios";
import { UsuariosManager } from "@/components/admin/usuarios-manager";

export const dynamic = "force-dynamic";

export default async function UsuariosConfigPage() {
  const sessao = await getSessao();
  if (!sessao) redirect("/login");
  const usuarios = await listarUsuarios();
  return <UsuariosManager usuarios={usuarios} sessaoId={sessao.id} ehAdmin={sessao.papel === "admin"} />;
}

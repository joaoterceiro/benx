import { redirect } from "next/navigation";

// Índice de configurações: leva à primeira seção.
export default function ConfiguracoesPage() {
  redirect("/admin/configuracoes/whatsapp");
}

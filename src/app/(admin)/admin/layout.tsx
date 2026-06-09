import { redirect } from "next/navigation";
import { Header } from "@/components/admin/header";
import { ConfirmProvider } from "@/components/admin/confirm-dialog";
import { getSessao } from "@/lib/auth";

// O admin é sempre data-driven: nunca pré-renderizar estático.
export const dynamic = "force-dynamic";

// Shell do admin: header fixo no topo + área de conteúdo.
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Guarda real: valida a sessão no banco (o middleware só checa o cookie).
  const sessao = await getSessao();
  if (!sessao) redirect("/login");

  return (
    <div id="admin-root" className="theme-dark theme-zen min-h-screen bg-canvas text-foreground">
      <Header usuario={{ nome: sessao.nome, papel: sessao.papel }} />
      <main>
        <div className="mx-auto max-w-site px-8 py-8">
          <ConfirmProvider>{children}</ConfirmProvider>
        </div>
      </main>
    </div>
  );
}

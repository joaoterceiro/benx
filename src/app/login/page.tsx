import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Já autenticado vai direto ao admin.
  const sessao = await getSessao();
  if (sessao) redirect("/admin/dashboard");

  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-6">
      <LoginForm />
    </main>
  );
}

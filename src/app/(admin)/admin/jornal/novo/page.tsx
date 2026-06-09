import { categoriasJornal } from "@/db/queries";
import { JornalForm } from "@/components/admin/jornal-form";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";

export const dynamic = "force-dynamic";

export default async function NovoPostPage() {
  const categorias = await categoriasJornal();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Breadcrumbs itens={[{ label: "Benx Jornal", href: "/admin/jornal" }, { label: "Novo post" }]} />
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Novo post</h1>
      </div>
      <JornalForm categorias={categorias} />
    </div>
  );
}

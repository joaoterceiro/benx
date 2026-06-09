import { CadastroEmpreendimento } from "@/components/admin/cadastro-empreendimento";
import { listarCidades, listarEmpreendimentosResumo } from "@/db/queries";

export default async function NovoEmpreendimentoPage() {
  const [cidades, disponiveis] = await Promise.all([listarCidades(), listarEmpreendimentosResumo()]);
  return (
    <CadastroEmpreendimento
      cidadesExistentes={cidades.map((c) => ({ nome: c.nome, uf: c.estado }))}
      relacionadosDisponiveis={disponiveis}
    />
  );
}

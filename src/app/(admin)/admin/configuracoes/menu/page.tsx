import { listarMenuFlat, lerMenuConfig } from "@/lib/menu";
import { MenuEditor } from "@/components/admin/menu-editor";

export default async function MenuConfigPage() {
  const [itens, config] = await Promise.all([listarMenuFlat(), lerMenuConfig()]);
  return (
    <MenuEditor
      itensIniciais={itens.map((i) => ({ id: i.id, texto: i.texto, url: i.url, parentId: i.parentId, ativo: i.ativo, ordem: i.ordem }))}
      configInicial={config}
    />
  );
}

import { ConfigNav } from "@/components/admin/config-nav";

export default function ConfiguracoesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[220px_1fr]">
      {/* esquerda: título + navegação (fixo ao rolar, abaixo do header de 56px) */}
      <aside className="lg:sticky lg:top-[72px] lg:self-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
          <p className="text-sm text-foreground-secondary">Ajustes globais do site.</p>
        </div>
        <div className="mt-6">
          <ConfigNav />
        </div>
      </aside>

      {/* direita: configuração ativa (rola) */}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

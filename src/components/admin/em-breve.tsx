// Placeholder de página do admin. Casca navegável, sem lógica de domínio (Fase 1).
export function EmBreve({ titulo, descricao }: { titulo: string; descricao?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
      {descricao ? (
        <p className="text-sm text-foreground-secondary">{descricao}</p>
      ) : null}
      <div className="mt-6 grid place-items-center rounded-xl border border-dashed border-border-emphasis bg-surface py-20 text-sm text-foreground-tertiary shadow-xs">
        Em breve. Funcionalidade entra nas próximas fases.
      </div>
    </div>
  );
}

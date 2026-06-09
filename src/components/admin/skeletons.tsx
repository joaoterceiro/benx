// Skeletons que imitam o layout real de cada tipo de tela do admin.
// Usados nos loading.tsx de rota (Suspense do App Router).

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />;
}

function Cabecalho() {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-2">
        <Bar className="h-7 w-48" />
        <Bar className="h-4 w-64" />
      </div>
      <Bar className="h-9 w-40 rounded-lg" />
    </div>
  );
}

export function TableSkeleton({ linhas = 8 }: { linhas?: number }) {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Carregando">
      <Cabecalho />
      <Bar className="h-10 w-full max-w-md rounded-lg" />
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="h-11 border-b border-border bg-muted/40" />
        {Array.from({ length: linhas }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0">
            <Bar className="h-11 w-16 rounded-md" />
            <Bar className="h-4 flex-1" />
            <Bar className="h-4 w-24" />
            <Bar className="h-4 w-20" />
            <Bar className="h-8 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GridSkeleton({ itens = 12 }: { itens?: number }) {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Carregando">
      <Cabecalho />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: itens }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
            <Bar className="aspect-[4/3] w-full rounded-none" />
            <div className="flex flex-col gap-2 p-3">
              <Bar className="h-3.5 w-3/4" />
              <Bar className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Carregando">
      <Cabecalho />
      <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Bar className="h-3.5 w-32" />
            <Bar className="h-10 w-full rounded-lg" />
          </div>
        ))}
        <Bar className="h-10 w-40 self-end rounded-lg" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Carregando">
      <Cabecalho />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Bar key={i} className="h-28 rounded-xl" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Bar className="h-52 rounded-xl" />
        <Bar className="h-52 rounded-xl" />
      </div>
    </div>
  );
}

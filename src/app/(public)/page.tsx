import Link from "next/link";
import { listarVertentes } from "@/lib/ecossistema";
import { lerSplashConfigResolvida } from "@/lib/splash";
import { Splash } from "@/components/public/splash";

// Portal de entrada: seletor de ecossistema (vertente). Escolher uma define o
// escopo de toda a navegação pública seguinte. Quando a splash está ativada
// como página inicial, ela substitui este portal.
export default async function PortalPage() {
  const splash = await lerSplashConfigResolvida();
  if (splash.usarComoHome) return <Splash config={splash} />;

  const vertentes = listarVertentes();
  return (
    <main className="mx-auto flex min-h-screen max-w-site flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Benx</h1>
      <p className="mt-2 text-foreground-secondary">
        Escolha um ecossistema para começar.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {vertentes.map((v) => (
          <Link
            key={v.value}
            href={`/${v.slug}`}
            className="group flex flex-col gap-2 rounded-xl border border-border bg-surface p-5 shadow-xs transition-[box-shadow,border-color] duration-200 ease-premium hover:border-border-emphasis hover:shadow-md"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: v.cor }}
            />
            <span className="text-lg font-semibold tracking-tight" style={{ color: v.cor }}>
              {v.label}
            </span>
            <span className="text-sm text-foreground-secondary">{v.nota}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}

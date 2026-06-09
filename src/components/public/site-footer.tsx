import { unstable_cache } from "next/cache";
import { lerFooterConfig, resolverFooterMidia } from "@/lib/footer-config";
import { GerenciarCookiesLink } from "@/components/public/gerenciar-cookies-link";

// Config do footer cacheada (lida em todas as páginas).
const lerFooterCache = unstable_cache(lerFooterConfig, ["pub-footer"], { revalidate: 60, tags: ["footer"] });

// SVGs fixos das redes (só as URLs são configuráveis).
const REDES_SVG: Record<string, { vb: string; d: string }> = {
  facebook: { vb: "0 0 512 512", d: "M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z" },
  x: { vb: "0 0 512 512", d: "M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" },
  youtube: { vb: "0 0 576 512", d: "M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" },
  instagram: { vb: "0 0 448 512", d: "M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" },
  pinterest: { vb: "0 0 496 512", d: "M496 256c0 137-111 248-248 248-25.6 0-50.2-3.9-73.4-11.1 10.1-16.5 25.2-43.5 30.8-65 3-11.6 15.4-59 15.4-59 8.1 15.4 31.7 28.5 56.8 28.5 74.8 0 128.7-68.8 128.7-154.3 0-81.9-66.9-143.2-152.9-143.2-107 0-163.9 71.8-163.9 150.1 0 36.4 19.4 81.7 50.3 96.1 4.7 2.2 7.2 1.2 8.3-3.3.8-3.4 5-20.3 6.9-28.1.6-2.5.3-4.7-1.7-7.1-10.1-12.5-18.3-35.3-18.3-56.6 0-54.7 41.4-107.6 112-107.6 60.9 0 103.6 41.5 103.6 100.9 0 67.1-33.9 113.6-78 113.6-24.3 0-42.6-20.1-36.7-44.8 7-29.5 20.5-61.3 20.5-82.6 0-19-10.2-34.9-31.4-34.9-24.9 0-44.9 25.7-44.9 60.2 0 22 7.4 36.8 7.4 36.8s-24.5 103.8-29 123.2c-5 21.4-3 51.6-.9 71.2C65.4 450.9 0 361.1 0 256 0 119 111 8 248 8s248 111 248 248z" },
};
const ORDEM_REDES = ["facebook", "x", "youtube", "instagram", "pinterest"] as const;

export async function SiteFooter({ variant = "padrao" }: { variant?: "padrao" | "vivabenx" }) {
  const cfg = await lerFooterCache();
  const ehViva = variant === "vivabenx";
  const [logoUrl, bgResolvido] = await Promise.all([
    resolverFooterMidia(cfg.logo),
    resolverFooterMidia(cfg.bgUrl),
  ]);
  const img = bgResolvido || "/footer-bg.jpg";
  return (
    <footer
      className="relative bg-cover bg-center text-white/80"
      style={ehViva
        ? { background: "linear-gradient(135deg, #1AA0DF 0%, #1577C0 100%)" }
        : { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.30), rgba(0,0,0,0.55)), url('${img}')` }}
    >
      <div className="mx-auto grid max-w-site items-start gap-10 px-6 py-16 lg:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          {ehViva ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/logo-vivabenx-cor.svg" alt="Viva Benx" className="h-12 w-auto" />
          ) : logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Benx" className="h-12 w-auto" />
          ) : null}
          <p className="mt-6 whitespace-pre-line text-[22px] font-light leading-snug text-white">{ehViva ? "Viva Benx Viva sua Conquista" : cfg.frase}</p>
          <a href={cfg.sobreUrl || "#"} className="mt-6 inline-block border border-white/40 px-6 py-2.5 text-[12px] font-semibold uppercase tracking-wide text-white transition hover:bg-white/10">Sobre a Benx</a>
          <p className="mt-7 whitespace-pre-line text-[14px] leading-relaxed text-white/70">{cfg.endereco}</p>
          {cfg.telefone ? (
            <a href={cfg.telefoneLink || "#"} className="mt-4 inline-block text-[18px] font-medium text-white transition hover:text-white/80">{cfg.telefone}</a>
          ) : null}
        </div>

        <nav className="flex flex-col gap-4 text-[14px]">
          {cfg.paginas.map((m) => (
            <a key={m.label} href={m.href} className="transition hover:text-white">{m.label}</a>
          ))}
        </nav>

        <div className="flex flex-col gap-7">
          <div className="flex flex-wrap gap-2.5">
            {ORDEM_REDES.map((rede) => {
              const url = cfg.redes[rede];
              if (!url) return null;
              const svg = REDES_SVG[rede];
              return (
                <a key={rede} href={url} target="_blank" rel="noopener noreferrer" aria-label={rede} className="grid h-9 w-9 place-items-center rounded-full border border-white/25 text-white transition hover:bg-white/10">
                  <svg width="16" height="16" viewBox={svg.vb} fill="currentColor" aria-hidden><path d={svg.d} /></svg>
                </a>
              );
            })}
          </div>
          <nav className="flex flex-col gap-4 text-[14px]">
            {cfg.institucional.map((m) => (
              <a key={m.label} href={m.href} className="transition hover:text-white">{m.label}</a>
            ))}
            <a href="/termos-de-uso" className="transition hover:text-white">TERMOS DE USO</a>
            <GerenciarCookiesLink />
          </nav>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-site flex-col items-center justify-between gap-6 px-6 py-6 sm:flex-row">
          <div className="text-center text-[13px] sm:text-left">
            <p className="text-white/70">{cfg.copyright}</p>
            {cfg.designBy ? <p className="mt-1 text-[12px] text-white/40">Design By: <span className="font-semibold text-white/70">{cfg.designBy}</span></p> : null}
          </div>
          <div className="flex items-center gap-7 opacity-90">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/parceiros/bueno-neto.png" alt="Bueno Neto" className="h-12 w-auto" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/parceiros/bem-imobiliaria.png" alt="BEM Imobiliária" className="h-10 w-auto" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/parceiros/bem-parcerias.png" alt="BEM Parcerias" className="h-10 w-auto" />
          </div>
        </div>
      </div>
    </footer>
  );
}

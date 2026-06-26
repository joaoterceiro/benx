import Link from "next/link";
import { logoDoBotao, type SplashConfig } from "@/lib/splash";

// Splash page: vídeo de fundo, overlays glassmorphism e botões de navegação
// para as marcas. Fiel ao plugin WordPress "Benx Splash Page".
export function Splash({ config }: { config: SplashConfig }) {
  const { videoUrl, botoes } = config;
  return (
    <div className="benx-splash">
      {videoUrl ? (
        <video className="benx-splash__video" autoPlay muted loop playsInline>
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : null}

      <div className="benx-splash__overlay-dark" />
      <div className="benx-splash__overlay-texture" />
      <div className="benx-splash__overlay-noise" />

      <div className="benx-splash__content">
        {botoes.map((btn, i) => {
          const logoSrc = logoDoBotao(config, btn.logoKey);
          const size = Math.min(400, Math.max(10, btn.logoSize || 40));
          return (
            <span key={i} className="benx-splash__cell">
              {i > 0 ? <span className="benx-splash__divider" /> : null}
              <span className="benx-splash__btnwrap">
              <Link href={btn.href || "#"} className="benx-splash__button">
                {logoSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoSrc} alt={btn.label} className="benx-splash__logo" style={{ height: `${size}px` }} />
                ) : null}
                {btn.showLabel && btn.label ? <span className="benx-splash__label">{btn.label}</span> : null}
                {btn.subtitle ? (
                  <span className="benx-splash__subtitle">
                    {btn.subtitle.split("\n").map((linha, k) => (
                      <span key={k}>{linha}{k < btn.subtitle.split("\n").length - 1 ? <br /> : null}</span>
                    ))}
                  </span>
                ) : null}
              </Link>
              {btn.href === "/iconicos" && (
                <span className="benx-splash__extra">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/splash/arborea-icon.png" alt="Arbórea" className="benx-splash__extra-logo" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/splash/280artblvd-icon.png" alt="280 Art Boulevard" className="benx-splash__extra-logo" />
                </span>
              )}
              </span>
            </span>
          );
        })}
      </div>

      <style>{CSS}</style>
    </div>
  );
}

const CSS = `
.benx-splash *, .benx-splash *::before, .benx-splash *::after { box-sizing: border-box; margin: 0; padding: 0; }
.benx-splash {
  position: fixed; inset: 0; z-index: 1000;
  min-height: 100vh; width: 100%; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  background-color: hsl(0,0%,5%);
}
.benx-splash__video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
.benx-splash__overlay-dark { position: absolute; inset: 0; background-color: hsla(0,0%,5%,0.85); z-index: 1; }
.benx-splash__overlay-texture {
  position: absolute; inset: 0; pointer-events: none; z-index: 2;
  background-image:
    radial-gradient(ellipse at 20% 50%, hsla(0,0%,100%,0.06) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 30%, hsla(220,60%,50%,0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, hsla(0,0%,100%,0.04) 0%, transparent 55%);
}
.benx-splash__overlay-noise {
  position: absolute; inset: 0; pointer-events: none; z-index: 3; opacity: 0.12;
  background-size: 200px 200px;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.benx-splash__content { position: relative; z-index: 10; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 2rem; padding: 1.5rem; }
.benx-splash__cell { display: flex; flex-direction: row; align-items: center; gap: 2rem; }
.benx-splash__divider { width: 2px; height: 5rem; flex-shrink: 0; background: linear-gradient(to bottom, transparent, hsla(0,0%,100%,0.25), transparent); }
.benx-splash__button { display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.3s ease-out; padding: 0 3.5rem; text-decoration: none; }
.benx-splash__button:hover { transform: scale(1.25); }
.benx-splash__logo { height: 2.5rem; width: auto; object-fit: contain; }
.benx-splash__btnwrap { position: relative; display: flex; flex-direction: column; align-items: center; }
.benx-splash__extra { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 2rem; display: flex; align-items: center; justify-content: center; gap: 1.25rem; }
.benx-splash__extra-logo { height: 26px; width: auto; object-fit: contain; }
.benx-splash__label { color: hsl(0,0%,100%); font-size: 0.56rem; line-height: 1.35; font-weight: 300; letter-spacing: 0.3em; text-transform: uppercase; margin-top: 0.75rem; }
.benx-splash__subtitle { color: hsla(0,0%,100%,0.6); font-size: 0.75rem; line-height: 1.4; font-weight: 300; letter-spacing: 0.025em; text-align: center; margin-top: 2.25rem; max-width: 200px; }
@media (max-width: 639px) {
  .benx-splash__content { flex-direction: column; }
  .benx-splash__cell { flex-direction: column; }
  .benx-splash__extra { position: static; transform: none; left: auto; margin: 1.25rem 0 0; }
  .benx-splash__divider { width: 4rem; height: 2px; background: linear-gradient(to right, transparent, hsla(0,0%,100%,0.25), transparent); }
}
`;

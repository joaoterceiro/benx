import type { Config } from "tailwindcss";

// Tokens Premium Web do Benx, portados dos protótipos (admin-app.jsx).
// As cores vivem em CSS vars (globals.css) para permitir accent por vertente.
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        // Largura padrão do container do site.
        site: "1216px",
      },
      colors: {
        canvas: "var(--bg-canvas)",
        surface: "var(--bg-surface)",
        muted: "var(--bg-muted)",
        sidebar: "var(--bg-sidebar)",
        foreground: "var(--text-primary)",
        "foreground-secondary": "var(--text-secondary)",
        "foreground-tertiary": "var(--text-tertiary)",
        border: "var(--border-default)",
        "border-emphasis": "var(--border-emphasis)",
        accent: "var(--accent)",
        "accent-subtle": "var(--accent-subtle)",
        success: "var(--success)",
        error: "var(--error)",
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "9px",
        xl: "14px",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      fontFamily: {
        sans: "var(--font-body)",
        display: "var(--font-display)",
        body: "var(--font-body)",
        mono: "var(--font-mono)",
      },
      transitionTimingFunction: {
        premium: "var(--ease)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

// Alterna o tema do admin (claro/escuro). Aplica .theme-dark no wrapper #admin-root
// e persiste a preferência em localStorage. Escopo: só o admin.
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  function aplicar(v: boolean) {
    document.getElementById("admin-root")?.classList.toggle("theme-dark", v);
  }

  useEffect(() => {
    const v = localStorage.getItem("admin-theme") === "dark";
    setDark(v);
    aplicar(v);
  }, []);

  function toggle() {
    const v = !dark;
    setDark(v);
    aplicar(v);
    localStorage.setItem("admin-theme", v ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={dark ? "Tema claro" : "Tema escuro"}
      aria-label="Alternar tema"
      className="grid h-8 w-8 place-items-center rounded-md border border-border text-foreground-secondary transition-colors hover:bg-muted hover:text-foreground"
    >
      {dark ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
    </button>
  );
}

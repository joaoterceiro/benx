"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, Heading2, Heading3, List, ListOrdered, Link2, Quote, RemoveFormatting } from "lucide-react";

// Editor de texto rico leve (contentEditable + execCommand). Salva HTML.
export function RichText({ value, onChange, placeholder }: { value: string; onChange: (html: string) => void; placeholder?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  // Define o HTML inicial apenas uma vez (evita reposicionar o cursor a cada tecla).
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || "")) ref.current.innerHTML = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = () => onChange(ref.current?.innerHTML ?? "");
  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    try {
      // Modo CSS: gera <span style="..."> (compatível com o sanitizador) em vez de <font>.
      document.execCommand("styleWithCSS", false, "true");
      document.execCommand(cmd, false, arg);
    } catch {
      /* execCommand indisponível: ignora */
    }
    emit();
  };
  const bloco = (tag: string) => exec("formatBlock", tag);
  const tamanho = (n: string) => { if (n) exec("fontSize", n); };
  const link = () => {
    const url = window.prompt("URL do link:");
    if (url) exec("createLink", url);
  };

  const Btn = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button type="button" title={title} onMouseDown={(e) => e.preventDefault()} onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded text-foreground-secondary transition hover:bg-muted hover:text-foreground">
      {children}
    </button>
  );

  return (
    <div className="rounded-lg border border-border bg-surface focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border p-1.5">
        <Btn onClick={() => exec("bold")} title="Negrito"><Bold size={15} /></Btn>
        <Btn onClick={() => exec("italic")} title="Itálico"><Italic size={15} /></Btn>
        <Btn onClick={() => exec("underline")} title="Sublinhado"><Underline size={15} /></Btn>
        <span className="mx-1 h-5 w-px bg-border" />
        <Btn onClick={() => bloco("h2")} title="Título"><Heading2 size={15} /></Btn>
        <Btn onClick={() => bloco("h3")} title="Subtítulo"><Heading3 size={15} /></Btn>
        <Btn onClick={() => bloco("blockquote")} title="Citação"><Quote size={15} /></Btn>
        <span className="mx-1 h-5 w-px bg-border" />
        <select
          title="Tamanho do texto"
          defaultValue=""
          onMouseDown={(e) => e.preventDefault()}
          onChange={(e) => { tamanho(e.target.value); e.currentTarget.selectedIndex = 0; }}
          className="h-8 rounded border border-border bg-surface px-1.5 text-[12px] text-foreground-secondary outline-none transition hover:text-foreground"
        >
          <option value="" disabled>Tamanho</option>
          <option value="2">Pequeno</option>
          <option value="3">Normal</option>
          <option value="4">Médio</option>
          <option value="5">Grande</option>
          <option value="6">Enorme</option>
        </select>
        <span className="mx-1 h-5 w-px bg-border" />
        <Btn onClick={() => exec("insertUnorderedList")} title="Lista"><List size={15} /></Btn>
        <Btn onClick={() => exec("insertOrderedList")} title="Lista numerada"><ListOrdered size={15} /></Btn>
        <Btn onClick={link} title="Link"><Link2 size={15} /></Btn>
        <span className="mx-1 h-5 w-px bg-border" />
        <Btn onClick={() => { bloco("p"); exec("removeFormat"); }} title="Limpar formatação"><RemoveFormatting size={15} /></Btn>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        data-placeholder={placeholder}
        className="rt-editor min-h-[280px] w-full px-3 py-3 text-[14px] leading-relaxed outline-none"
      />
      <style>{`
        .rt-editor:empty:before { content: attr(data-placeholder); color: var(--fg-tertiary, #9ca3af); }
        .rt-editor h2 { font-size: 1.35rem; font-weight: 700; margin: .8em 0 .35em; }
        .rt-editor h3 { font-size: 1.1rem; font-weight: 600; margin: .7em 0 .3em; }
        .rt-editor p { margin: .5em 0; }
        .rt-editor ul { list-style: disc; padding-left: 1.4em; margin: .5em 0; }
        .rt-editor ol { list-style: decimal; padding-left: 1.4em; margin: .5em 0; }
        .rt-editor blockquote { border-left: 3px solid #0A2A66; padding-left: .9em; color: #555; margin: .6em 0; font-style: italic; }
        .rt-editor a { color: #0A4DCC; text-decoration: underline; }
      `}</style>
    </div>
  );
}

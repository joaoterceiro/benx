import { cn } from "@/lib/utils";

// Campo de formulário: rótulo + controle + erro/dica. Padroniza o layout.
export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  className,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="text-[12px] font-medium text-foreground-secondary"
        >
          {label}
          {required ? <span className="text-error"> *</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <span className="text-[11px] text-error">{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-foreground-tertiary">{hint}</span>
      ) : null}
    </div>
  );
}

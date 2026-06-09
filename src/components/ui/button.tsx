import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Primitivo do Design System. Páginas não estilizam botões do zero.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-[13px] font-medium font-body transition-[background,opacity,box-shadow] duration-150 ease-premium disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-white shadow-[0_2px_14px_rgba(0,73,207,0.45)] hover:opacity-95 hover:shadow-[0_6px_28px_rgba(0,73,207,0.7)]",
        accent:
          "bg-accent text-white shadow-[0_2px_14px_rgba(0,73,207,0.45)] hover:opacity-95 hover:shadow-[0_6px_28px_rgba(0,73,207,0.7)]",
        outline:
          "border border-border bg-surface text-foreground hover:bg-muted",
        ghost: "text-foreground-secondary hover:bg-muted hover:text-foreground",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-9 px-4",
        lg: "h-10 px-5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Mostra spinner inline, desabilita e impede duplo clique. */
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading = false, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 size={15} className="animate-spin" aria-hidden />}
      {children}
    </button>
  )
);
Button.displayName = "Button";

export { buttonVariants };

import * as React from "react";
import { cn } from "@/lib/utils";

// Select nativo estilizado. Suficiente para o cadastro; trocar por combobox
// shadcn se precisar de busca.
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-9 w-full appearance-none rounded-lg border border-border bg-surface px-3 text-[13px] text-foreground shadow-xs outline-none transition-[border-color,box-shadow] duration-150 ease-premium focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

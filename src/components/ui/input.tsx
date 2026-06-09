import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-9 w-full rounded-lg border border-border bg-surface px-3 text-[13px] text-foreground shadow-xs outline-none transition-[border-color,box-shadow] duration-150 ease-premium placeholder:text-foreground-tertiary focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[88px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] leading-relaxed text-foreground shadow-xs outline-none transition-[border-color,box-shadow] duration-150 ease-premium placeholder:text-foreground-tertiary focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

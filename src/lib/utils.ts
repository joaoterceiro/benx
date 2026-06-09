import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper padrão do shadcn/ui para compor classes Tailwind.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Slug a partir de um texto livre (mesma regra dos protótipos).
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

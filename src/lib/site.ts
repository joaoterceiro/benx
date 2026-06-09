// URL pública do site. Em produção, definir NEXT_PUBLIC_SITE_URL no .env.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const SITE_NAME = "Benx";

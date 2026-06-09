import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Benx — Empreendimentos que transformam cidades",
    template: "%s — Benx",
  },
  description:
    "A Benx desenvolve empreendimentos que moldam o futuro das cidades. Conheça as linhas Benx Icônicos, Benx e Viva Benx.",
  applicationName: "Benx",
  openGraph: {
    type: "website",
    siteName: "Benx",
    locale: "pt_BR",
    url: SITE_URL,
    title: "Benx — Empreendimentos que transformam cidades",
    description: "A Benx desenvolve empreendimentos que moldam o futuro das cidades.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Benx — Empreendimentos que transformam cidades",
    description: "A Benx desenvolve empreendimentos que moldam o futuro das cidades.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        {/* Widgets do site público (menu, busca, WhatsApp, cookies) ficam no
            layout do grupo (public). O Toaster é global (admin também usa). */}
        <Toaster position="top-right" richColors closeButton toastOptions={{ duration: 3500 }} />
      </body>
    </html>
  );
}

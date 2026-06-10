import { eq } from "drizzle-orm";
import { db, pool } from "@/lib/db";
import { linhasProduto, categorias, usuarios, configuracoes } from "@/db/schema";
import { listarVertentes } from "@/lib/ecossistema";
import { hashSenha } from "@/lib/senha";

// Seed idempotente. Semeia linhas_produto a partir da config de ecossistema
// (fonte única) e algumas categorias base. Destrava os demais agentes.
async function main() {
  console.log("Semeando linhas_produto a partir da config de ecossistema...");
  for (const v of listarVertentes()) {
    await db
      .insert(linhasProduto)
      .values({ nome: v.label, slug: v.value })
      .onConflictDoNothing({ target: linhasProduto.slug });
  }

  console.log("Semeando categorias base...");
  const cats = [
    { nome: "Residencial", slug: "residencial" },
    { nome: "Comercial", slug: "comercial" },
  ];
  for (const c of cats) {
    await db.insert(categorias).values(c).onConflictDoNothing({ target: categorias.slug });
  }

  console.log("Semeando usuário admin inicial...");
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@benx.local").toLowerCase();
  const adminSenha = process.env.ADMIN_SENHA ?? "benx1234";
  const existe = await db.query.usuarios.findFirst({ where: eq(usuarios.email, adminEmail) });
  if (!existe) {
    await db.insert(usuarios).values({
      nome: "Administrador",
      email: adminEmail,
      senhaHash: hashSenha(adminSenha),
      papel: "admin",
    });
    console.log(`  admin criado: ${adminEmail} (senha: ${adminSenha})`);
  } else {
    console.log("  admin já existe, mantido.");
  }

  console.log("Semeando config da splash (home)...");
  const splashBotoes = [
    { label: "Icônicos", logoKey: "benx", href: "/iconicos", showLabel: true, subtitle: "Residenciais elevados\nao estado de arte", logoSize: 40 },
    { label: "Benx", logoKey: "benx", href: "/benx", showLabel: false, subtitle: "Projetos de excelência em localizações privilegiadas", logoSize: 40 },
    { label: "Viva Benx", logoKey: "viva", href: "/vivabenx", showLabel: false, subtitle: "A união entre mobilidade urbana e arquitetura inteligente", logoSize: 80 },
    { label: "Parque Global", logoKey: "extra", href: "https://parqueglobal.com.br/", showLabel: false, subtitle: "Novo jeito de viver em São Paulo.", logoSize: 60 },
  ];
  const splashCfg: Record<string, string> = {
    splash_home: "true",
    splash_video: "/bg-hero.mp4",
    splash_logo_benx: "/splash-benx.png",
    splash_logo_viva: "/logo-vivabenx.svg",
    splash_logo_extra: "/parque-global-logo.svg",
    splash_botoes: JSON.stringify(splashBotoes),
  };
  for (const [chave, valor] of Object.entries(splashCfg)) {
    await db.insert(configuracoes).values({ chave, valor }).onConflictDoNothing({ target: configuracoes.chave });
  }

  console.log("Seed concluído.");
  await pool.end();
}

main().catch((err) => {
  console.error("Falha no seed:", err);
  process.exit(1);
});

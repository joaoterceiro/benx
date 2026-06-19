// Redefine a senha de um usuário admin direto no Postgres.
// NÃO grava a senha em lugar nenhum: lê de uma variável de ambiente, gera o
// hash (mesmo algoritmo do app: scrypt "salt:derivedKey") e faz o UPDATE.
//
// Uso (PowerShell):
//   $env:DATABASE_URL="postgres://benx:benx@HOST:5432/benx"
//   $env:NOVA_SENHA="suaSenhaForte"
//   $env:ADMIN_EMAIL="admin@benx.local"   # opcional (este é o padrão)
//   node scripts/reset-admin-senha.mjs
//
// Uso (bash):
//   DATABASE_URL=... NOVA_SENHA='...' ADMIN_EMAIL=admin@benx.local node scripts/reset-admin-senha.mjs
//
// Rode preferencialmente DENTRO do ambiente de produção (container do app no
// EasyPanel), onde DATABASE_URL já aponta para o banco certo.

import { scryptSync, randomBytes } from "node:crypto";
import pg from "pg";

function hashSenha(senha) {
  const salt = randomBytes(16).toString("hex");
  const dk = scryptSync(senha, salt, 64).toString("hex");
  return `${salt}:${dk}`;
}

const databaseUrl = process.env.DATABASE_URL;
const email = (process.env.ADMIN_EMAIL ?? "admin@benx.local").toLowerCase().trim();
const nova = process.env.NOVA_SENHA;

if (!databaseUrl) {
  console.error("Erro: defina DATABASE_URL.");
  process.exit(1);
}
if (!nova || nova.length < 8) {
  console.error("Erro: defina NOVA_SENHA com pelo menos 8 caracteres.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: databaseUrl });

try {
  const hash = hashSenha(nova);
  const r = await pool.query(
    "UPDATE usuarios SET senha_hash = $1 WHERE lower(email) = $2 RETURNING email, papel",
    [hash, email]
  );
  if (r.rowCount === 0) {
    const existentes = await pool.query("SELECT email, papel FROM usuarios ORDER BY criado_em");
    console.error(`Nenhum usuário com e-mail "${email}". Usuários existentes:`);
    for (const u of existentes.rows) console.error(`  - ${u.email} (${u.papel})`);
    process.exit(2);
  }
  console.log(`Senha redefinida para ${r.rows[0].email} (${r.rows[0].papel}).`);
} catch (err) {
  console.error("Falha:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}

// Cria (ou atualiza) um usuário do admin no Postgres.
// Gera uma SENHA FORTE aleatória e a imprime UMA vez no final (copie e guarde).
// Pode-se fixar a senha via env NOVA_SENHA, mas o padrão é gerar uma forte.
//
// Uso (console do serviço benx-site no EasyPanel, onde DATABASE_URL já existe):
//   EMAIL='joao@imagenou.com.br' NOME='João' PAPEL='admin' node scripts/criar-usuario.mjs
//
// Variáveis:
//   DATABASE_URL  (obrigatória; já presente no container)
//   EMAIL         (padrão: joao@imagenou.com.br)
//   NOME          (padrão: derivado do e-mail)
//   PAPEL         (padrão: admin | editor)
//   NOVA_SENHA    (opcional; se ausente, gera uma senha forte)

import { scryptSync, randomBytes } from "node:crypto";
import pg from "pg";

function hashSenha(senha) {
  const salt = randomBytes(16).toString("hex");
  const dk = scryptSync(senha, salt, 64).toString("hex");
  return `${salt}:${dk}`;
}

// Senha forte (~22 chars, alfanumérica + símbolos seguros para shell/URL).
function gerarSenha() {
  const base = randomBytes(24).toString("base64").replace(/[+/=]/g, "");
  const simbolos = "!@#$%&*?-_";
  const s = simbolos[randomBytes(1)[0] % simbolos.length] + simbolos[randomBytes(1)[0] % simbolos.length];
  return (base.slice(0, 20) + s);
}

const databaseUrl = process.env.DATABASE_URL;
const email = (process.env.EMAIL ?? "joao@imagenou.com.br").toLowerCase().trim();
const nome = process.env.NOME ?? email.split("@")[0];
const papel = (process.env.PAPEL ?? "admin").trim();
const senha = process.env.NOVA_SENHA && process.env.NOVA_SENHA.length >= 8 ? process.env.NOVA_SENHA : gerarSenha();

if (!databaseUrl) {
  console.error("Erro: defina DATABASE_URL.");
  process.exit(1);
}
if (!["admin", "editor"].includes(papel)) {
  console.error('Erro: PAPEL deve ser "admin" ou "editor".');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: databaseUrl });

try {
  const hash = hashSenha(senha);
  const r = await pool.query(
    `INSERT INTO usuarios (nome, email, senha_hash, papel)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome, senha_hash = EXCLUDED.senha_hash, papel = EXCLUDED.papel
     RETURNING email, papel, (xmax = 0) AS criado`,
    [nome, email, hash, papel]
  );
  const row = r.rows[0];
  console.log("");
  console.log(row.criado ? "Usuário CRIADO." : "Usuário já existia: senha/papel ATUALIZADOS.");
  console.log(`  E-mail: ${row.email}`);
  console.log(`  Papel:  ${row.papel}`);
  console.log(`  Senha:  ${senha}`);
  console.log("");
  console.log(">> Guarde a senha agora. Ela não será exibida de novo.");
} catch (err) {
  console.error("Falha:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}

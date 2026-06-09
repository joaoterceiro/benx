/**
 * Teste de sanitização do logger. Sem runner instalado: rode com
 *   npx tsx src/lib/logger.test.ts
 * Sai com código != 0 se algum segredo vazar para o output.
 */
import assert from "node:assert";
import { Writable } from "node:stream";
import pino from "pino";
import { REDACTION_PATHS } from "@/lib/redaction-paths";

let buffer = "";
const sink = new Writable({
  write(chunk, _enc, cb) { buffer += chunk.toString(); cb(); },
});

const log = pino(
  { redact: { paths: REDACTION_PATHS, censor: "[REDACTED]" }, serializers: { err: pino.stdSerializers.err } },
  sink
);

log.info(
  {
    action: "teste",
    userId: "u1",
    senha: "supersecreta123",
    senhaHash: "abcd:ef01",
    token: "tok_live_xyz",
    authorization: "Bearer abc.def.ghi",
    cpf: "123.456.789-00",
    user: { password: "outrasecreta", token: "child-token" },
    err: new Error("erro de teste"),
  },
  "evento de teste"
);

const VAZAMENTOS = [
  "supersecreta123", "abcd:ef01", "tok_live_xyz", "Bearer abc.def.ghi",
  "123.456.789-00", "outrasecreta", "child-token",
];

let falhou = false;
for (const segredo of VAZAMENTOS) {
  if (buffer.includes(segredo)) {
    console.error(`FALHA: segredo vazou no log -> ${segredo}`);
    falhou = true;
  }
}

assert.ok(buffer.includes("[REDACTED]"), "esperava ao menos um campo [REDACTED]");
assert.ok(buffer.includes('"action":"teste"'), "campos não sensíveis devem permanecer");
assert.ok(buffer.includes("erro de teste"), "mensagem de erro (não sensível) deve permanecer");

if (falhou) { console.error("Teste de redaction FALHOU"); process.exit(1); }
console.log("OK: redaction mascara senha/token/cpf/authorization em qualquer nível.");

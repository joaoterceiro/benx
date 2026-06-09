import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

// Hash de senha com scrypt (sem dependências). Formato: "salt:derivedKey" hex.
// Módulo puro (sem server-only) para ser reutilizável em scripts (seed) e na auth.
export function hashSenha(senha: string): string {
  const salt = randomBytes(16).toString("hex");
  const dk = scryptSync(senha, salt, 64).toString("hex");
  return `${salt}:${dk}`;
}

export function verificarSenha(senha: string, armazenado: string): boolean {
  const [salt, key] = armazenado.split(":");
  if (!salt || !key) return false;
  const dk = scryptSync(senha, salt, 64);
  const keyBuf = Buffer.from(key, "hex");
  return keyBuf.length === dk.length && timingSafeEqual(keyBuf, dk);
}

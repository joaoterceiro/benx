/* Parser de dump mysqldump (sem dependências, sem Docker).
   Lê o local.sql do WordPress e extrai linhas das tabelas que interessam,
   tratando strings com escapes (\\', \\\\, etc.) e NULL corretamente.

   Uso: const db = carregarDump(caminho); const posts = db.rows("wp_posts"); */
import { readFileSync } from "node:fs";

export type Row = Record<string, string | null>;

// Colunas na ordem do CREATE TABLE (mysqldump faz INSERT sem lista de colunas).
function colunasDe(sql: string, tabela: string): string[] {
  const re = new RegExp("CREATE TABLE `" + tabela + "` \\(([\\s\\S]*?)\\n\\) ENGINE", "m");
  const m = sql.match(re);
  if (!m) return [];
  const cols: string[] = [];
  for (const linha of m[1].split("\n")) {
    const t = linha.trim();
    const c = t.match(/^`([^`]+)`/);
    if (c) cols.push(c[1]);
  }
  return cols;
}

// Parser de uma lista de tuplas: (..),(..),... ; a partir do índice i.
function parseTuplas(sql: string, inicio: number): { tuplas: (string | null)[][]; fim: number } {
  const tuplas: (string | null)[][] = [];
  const n = sql.length;
  let i = inicio;
  while (i < n) {
    const c = sql[i];
    if (c === " " || c === "\n" || c === "\r" || c === "\t" || c === ",") { i++; continue; }
    if (c === ";") { i++; break; }
    if (c !== "(") { i++; continue; }
    i++; // consome '('
    const campos: (string | null)[] = [];
    let cur = "";
    let emString = false;
    let foiString = false;
    while (i < n) {
      const ch = sql[i];
      if (emString) {
        if (ch === "\\") { cur += desescape(sql[i + 1] ?? ""); i += 2; continue; }
        if (ch === "'") { emString = false; i++; continue; }
        cur += ch; i++; continue;
      }
      if (ch === "'") { emString = true; foiString = true; i++; continue; }
      if (ch === ",") { campos.push(finalizar(cur, foiString)); cur = ""; foiString = false; i++; continue; }
      if (ch === ")") { campos.push(finalizar(cur, foiString)); i++; break; }
      cur += ch; i++;
    }
    tuplas.push(campos);
  }
  return { tuplas, fim: i };
}

// Traduz a sequência de escape do mysqldump (o char após a barra invertida).
function desescape(c: string): string {
  switch (c) {
    case "n": return "\n";
    case "t": return "\t";
    case "r": return "\r";
    case "0": return "\0";
    case "b": return "\b";
    case "Z": return "\x1a";
    default: return c; // \' \" \\ e quaisquer outros: caractere literal
  }
}

function finalizar(valor: string, foiString: boolean): string | null {
  if (!foiString && valor.trim() === "NULL") return null;
  return valor;
}

export interface DumpDB {
  rows: (tabela: string) => Row[];
  raw: string;
}

export function carregarDump(caminho: string): DumpDB {
  const sql = readFileSync(caminho, "utf8");
  const cache = new Map<string, Row[]>();

  function rows(tabela: string): Row[] {
    const hit = cache.get(tabela);
    if (hit) return hit;
    const cols = colunasDe(sql, tabela);
    const out: Row[] = [];
    const needle = "INSERT INTO `" + tabela + "` VALUES ";
    let idx = 0;
    while ((idx = sql.indexOf(needle, idx)) !== -1) {
      const { tuplas, fim } = parseTuplas(sql, idx + needle.length);
      for (const t of tuplas) {
        const row: Row = {};
        for (let k = 0; k < cols.length; k++) row[cols[k]] = t[k] ?? null;
        out.push(row);
      }
      idx = fim;
    }
    cache.set(tabela, out);
    return out;
  }

  return { rows, raw: sql };
}

// PHP unserialize mínimo para os tipos que aparecem no postmeta do JetEngine:
// string s:N:"..."; inteiro i:N; array a:N:{...}; booleano b:0/1; null N;
// Suficiente para galerias (arrays de IDs) e repeaters (arrays associativos).
export function phpUnserialize(input: string): unknown {
  // PHP serializa o comprimento das strings em BYTES (não caracteres). Operamos
  // sobre o Buffer para acertar offsets com acento (é, ã, ç) e emoji.
  const buf = Buffer.from(input, "utf8");
  let i = 0;
  const lerAte = (ch: string): string => {
    const ini = i;
    const code = ch.charCodeAt(0);
    while (i < buf.length && buf[i] !== code) i++;
    return buf.toString("utf8", ini, i);
  };
  function val(): unknown {
    const t = String.fromCharCode(buf[i]);
    if (t === "N") { i += 2; return null; }                                   // N;
    if (t === "b") { i += 2; const v = buf[i] === 49; i += 2; return v; }      // b:1;
    if (t === "i") { i += 2; const n = parseInt(lerAte(";"), 10); i += 1; return n; } // i:N;
    if (t === "d") { i += 2; const n = parseFloat(lerAte(";")); i += 1; return n; }   // d:N;
    if (t === "s") {                                                          // s:LEN:"...";
      i += 2;                       // pula 's:'
      const len = parseInt(lerAte(":"), 10);
      i += 2;                       // pula ':"'
      const s = buf.toString("utf8", i, i + len);
      i += len + 2;                 // pula os bytes + '";'
      return s;
    }
    if (t === "a") {                                                          // a:N:{...}
      i += 2;                       // pula 'a:'
      const count = parseInt(lerAte(":"), 10);
      i += 2;                       // pula ':{'
      const obj: Record<string, unknown> = {};
      for (let k = 0; k < count; k++) { const key = val() as string | number; obj[String(key)] = val(); }
      i += 1;                       // pula '}'
      return obj;
    }
    throw new Error("phpUnserialize: token inesperado '" + t + "'");
  }
  try { return val(); } catch { return null; }
}

// Tenta interpretar um meta_value como JSON, depois como PHP serializado,
// senão devolve a string crua.
export function parseMeta(valor: string | null): unknown {
  if (valor === null) return null;
  const v = valor.trim();
  if (v === "") return "";
  if ((v.startsWith("{") || v.startsWith("[")) ) {
    try { return JSON.parse(v); } catch { /* segue */ }
  }
  if (/^(a|s|i|d|b|N):/.test(v) || v === "N;") return phpUnserialize(v);
  return valor;
}

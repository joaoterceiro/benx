// Paths sensíveis que o Pino deve mascarar antes de gravar o log.
// Cobre segredos de auth e dados pessoais (LGPD). Aplicado em profundidade
// rasa (objetos de log são planos: { err, action, userId, ... }) + 1 nível.
const KEYS = [
  // segredos / auth
  "senha", "senhaHash", "senha_hash", "password", "pass",
  "token", "accessToken", "refreshToken", "sessionToken",
  "authorization", "cookie", "secret", "apiKey", "api_key",
  "accessKey", "secretKey", "s3SecretKey", "privateKey",
  // dados pessoais
  "cpf", "cnpj", "rg", "cartao", "card", "cardNumber", "cvv",
  "dataNascimento", "endereco",
];

// Gera os paths nos formatos aceitos pelo pino-redact: chave no topo,
// dentro de objetos comuns (err, ctx, data, input, body, headers) e wildcard 1 nível.
function build(): string[] {
  const wrappers = ["", "err.", "ctx.", "data.", "input.", "body.", "params.", "headers.", "*."];
  const set = new Set<string>();
  for (const k of KEYS) for (const w of wrappers) set.add(`${w}${k}`);
  // header de autorização cru
  set.add('headers["authorization"]');
  set.add('headers["set-cookie"]');
  return [...set];
}

export const REDACTION_PATHS = build();

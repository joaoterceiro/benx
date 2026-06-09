// Utilitários de mascaramento para quando um dado pessoal precisa aparecer
// parcialmente no log (ex.: e-mail de uma tentativa de login).

export function maskEmail(email?: string | null): string | undefined {
  if (!email) return undefined;
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  const u = user.length <= 1 ? "*" : `${user[0]}***`;
  return `${u}@${domain}`;
}

export function maskCpf(cpf?: string | null): string | undefined {
  if (!cpf) return undefined;
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11) return "***";
  return `***.***.${d.slice(6, 9)}-**`;
}

export function maskPhone(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  const d = phone.replace(/\D/g, "");
  if (d.length < 4) return "***";
  return `***${d.slice(-4)}`;
}

export function maskCard(card?: string | null): string | undefined {
  if (!card) return undefined;
  const d = card.replace(/\D/g, "");
  if (d.length < 4) return "****";
  return `**** **** **** ${d.slice(-4)}`;
}

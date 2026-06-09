import { z } from "zod";

const strOpt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : String(v)),
  z.string().optional()
);

export const leadInputSchema = z
  .object({
    nome: z.string().min(2, "Informe seu nome"),
    email: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : String(v)),
      z.string().email("E-mail inválido").optional()
    ),
    telefone: strOpt,
    mensagem: strOpt,
    empreendimentoId: strOpt,
    origem: strOpt,
    // LGPD: consentimento obrigatório no ponto de coleta.
    consentimento: z.boolean().refine((v) => v === true, {
      message: "É necessário aceitar a Política de Privacidade",
    }),
  })
  .refine((d) => Boolean(d.email || d.telefone), {
    message: "Informe e-mail ou telefone",
    path: ["email"],
  });

export type LeadInput = z.input<typeof leadInputSchema>;
export const STATUS_LEAD = ["novo", "em_contato", "qualificado", "convertido", "perdido"] as const;

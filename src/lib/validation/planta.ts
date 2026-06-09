import { z } from "zod";

const intOpt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
  z.number().int().optional()
);
const strOpt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : String(v)),
  z.string().optional()
);

// Planta (tipologia). metragem é numeric no banco (string em TS).
export const plantaInputSchema = z.object({
  nome: z.string().min(1, "Informe o nome da planta"),
  metragem: strOpt,
  dormitorios: intOpt,
  suites: intOpt,
  vagas: intOpt,
  imagemPlanta: strOpt,
  recursos: z.array(z.string()).default([]),
});

export type PlantaInput = z.input<typeof plantaInputSchema>;
export type PlantaParsed = z.output<typeof plantaInputSchema>;

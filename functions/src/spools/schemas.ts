import { z } from "zod";

export const SpoolStatus = z.enum([
  "NEW",
  "IN_USE",
  "LOW",
  "EMPTY",
  "ARCHIVED",
]);
export type SpoolStatus = z.infer<typeof SpoolStatus>;

export const SpoolCreateInput = z.object({
  label: z.string().min(1, "Label requerido"),
  material: z.string().min(1, "Material requerido"),
  color: z.string().min(1, "Color requerido"),
  diameter: z.number().positive("Diametro debe ser positivo"),
  netInitialG: z.number().positive("Peso neto inicial debe ser positivo"),
  tareG: z.number().nonnegative("Tara debe ser >= 0"),
  status: SpoolStatus.default("NEW"),
  thresholdG: z.number().positive().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});
export type SpoolCreateInput = z.infer<typeof SpoolCreateInput>;

export const SpoolUpdateInput = z.object({
  spoolId: z.string().min(1, "spoolId requerido"),
  label: z.string().min(1).optional(),
  material: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  diameter: z.number().positive().optional(),
  netInitialG: z.number().positive().optional(),
  tareG: z.number().nonnegative().optional(),
  status: SpoolStatus.optional(),
  thresholdG: z.number().positive().nullable().optional(),
  location: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});
export type SpoolUpdateInput = z.infer<typeof SpoolUpdateInput>;

export const WeighInInput = z.object({
  spoolId: z.string().min(1, "spoolId requerido"),
  weightG: z.number().nonnegative("Peso debe ser >= 0"),
  note: z.string().optional(),
});
export type WeighInInput = z.infer<typeof WeighInInput>;

export const SpoolIdInput = z.object({
  spoolId: z.string().min(1, "spoolId requerido"),
});
export type SpoolIdInput = z.infer<typeof SpoolIdInput>;

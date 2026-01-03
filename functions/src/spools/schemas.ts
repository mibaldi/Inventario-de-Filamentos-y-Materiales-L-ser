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
  brand: z.string().nullable().optional(),
  material: z.string().min(1, "Material requerido"),
  color: z.string().min(1, "Color requerido"),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Formato hex invalido").nullable().optional(),
  diameter: z.number().positive("Diametro debe ser positivo"),
  netInitialG: z.number().positive("Peso neto inicial debe ser positivo"),
  tareG: z.number().nonnegative("Tara debe ser >= 0"),
  status: SpoolStatus.default("NEW"),
  thresholdG: z.number().positive().nullable().optional(),
  location: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  printTempMinC: z.number().positive().nullable().optional(),
  printTempMaxC: z.number().positive().nullable().optional(),
  bedTempMinC: z.number().nonnegative().nullable().optional(),
  bedTempMaxC: z.number().nonnegative().nullable().optional(),
});
export type SpoolCreateInput = z.infer<typeof SpoolCreateInput>;

export const SpoolUpdateInput = z.object({
  spoolId: z.string().min(1, "spoolId requerido"),
  label: z.string().min(1).nullable().optional(),
  brand: z.string().nullable().optional(),
  material: z.string().min(1).nullable().optional(),
  color: z.string().min(1).nullable().optional(),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Formato hex invalido").nullable().optional(),
  diameter: z.number().positive().nullable().optional(),
  netInitialG: z.number().positive().nullable().optional(),
  tareG: z.number().nonnegative().nullable().optional(),
  status: SpoolStatus.nullable().optional(),
  thresholdG: z.number().positive().nullable().optional(),
  location: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  printTempMinC: z.number().positive().nullable().optional(),
  printTempMaxC: z.number().positive().nullable().optional(),
  bedTempMinC: z.number().nonnegative().nullable().optional(),
  bedTempMaxC: z.number().nonnegative().nullable().optional(),
});
export type SpoolUpdateInput = z.infer<typeof SpoolUpdateInput>;

export const WeighInInput = z.object({
  spoolId: z.string().min(1, "spoolId requerido"),
  weightG: z.number().nonnegative("Peso debe ser >= 0"),
  note: z.string().nullable().optional(),
});
export type WeighInInput = z.infer<typeof WeighInInput>;

export const SpoolIdInput = z.object({
  spoolId: z.string().min(1, "spoolId requerido"),
});
export type SpoolIdInput = z.infer<typeof SpoolIdInput>;

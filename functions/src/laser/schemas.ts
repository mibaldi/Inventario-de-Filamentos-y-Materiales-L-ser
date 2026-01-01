import { z } from "zod";

export const LaserFormat = z.enum(["SHEET", "PCS"]);
export type LaserFormat = z.infer<typeof LaserFormat>;

export const SafeFlag = z.enum(["OK", "CAUTION", "NO"]);
export type SafeFlag = z.infer<typeof SafeFlag>;

export const LaserCreateInput = z.object({
  type: z.string().min(1, "Tipo requerido"),
  thicknessMm: z.number().positive("Espesor debe ser positivo"),
  format: LaserFormat,
  widthMm: z.number().positive().optional(),
  heightMm: z.number().positive().optional(),
  quantityInitial: z.number().int().positive("Cantidad inicial debe ser positiva"),
  safeFlag: SafeFlag.default("OK"),
  location: z.string().optional(),
  notes: z.string().optional(),
  thresholdQty: z.number().int().positive().optional(),
});
export type LaserCreateInput = z.infer<typeof LaserCreateInput>;

export const LaserUpdateInput = z.object({
  materialId: z.string().min(1, "materialId requerido"),
  type: z.string().min(1).optional(),
  thicknessMm: z.number().positive().optional(),
  format: LaserFormat.optional(),
  widthMm: z.number().positive().nullable().optional(),
  heightMm: z.number().positive().nullable().optional(),
  quantityInitial: z.number().int().positive().optional(),
  safeFlag: SafeFlag.optional(),
  location: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  thresholdQty: z.number().int().positive().nullable().optional(),
});
export type LaserUpdateInput = z.infer<typeof LaserUpdateInput>;

export const AdjustStockInput = z.object({
  materialId: z.string().min(1, "materialId requerido"),
  delta: z.number().int().refine((v) => v !== 0, "Delta no puede ser 0"),
  note: z.string().optional(),
});
export type AdjustStockInput = z.infer<typeof AdjustStockInput>;

export const LaserIdInput = z.object({
  materialId: z.string().min(1, "materialId requerido"),
});
export type LaserIdInput = z.infer<typeof LaserIdInput>;

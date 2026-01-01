export type LaserFormat = "SHEET" | "PCS";
export type SafeFlag = "OK" | "CAUTION" | "NO";

export interface LaserMaterial {
  id: string;
  ownerUid: string;
  type: string;
  thicknessMm: number;
  format: LaserFormat;
  widthMm: number | null;
  heightMm: number | null;
  quantityInitial: number;
  quantityRemaining: number;
  safeFlag: SafeFlag;
  location: string | null;
  notes: string | null;
  thresholdQty: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Movement {
  id: string;
  deltaQty: number;
  createdAt: string;
  createdBy: string;
  note: string | null;
}

export interface LaserCreateInput {
  type: string;
  thicknessMm: number;
  format: LaserFormat;
  widthMm?: number;
  heightMm?: number;
  quantityInitial: number;
  safeFlag?: SafeFlag;
  location?: string;
  notes?: string;
  thresholdQty?: number;
}

export interface LaserUpdateInput {
  materialId: string;
  type?: string;
  thicknessMm?: number;
  format?: LaserFormat;
  widthMm?: number | null;
  heightMm?: number | null;
  quantityInitial?: number;
  safeFlag?: SafeFlag;
  location?: string | null;
  notes?: string | null;
  thresholdQty?: number | null;
}

export interface AdjustStockInput {
  materialId: string;
  delta: number;
  note?: string;
}

// Tipos comunes de material laser
export const LASER_MATERIAL_TYPES = [
  "Contrachapado",
  "MDF",
  "Acrilico",
  "Carton",
  "Cuero",
  "Corcho",
  "Madera maciza",
  "Papel",
  "Tela",
  "Goma EVA",
  "Otro",
] as const;

// Espesores comunes en mm
export const COMMON_THICKNESSES = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 18, 20] as const;

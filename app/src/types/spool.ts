export type SpoolStatus = "NEW" | "IN_USE" | "LOW" | "EMPTY" | "ARCHIVED";

export interface Spool {
  id: string;
  ownerUid: string;
  label: string;
  brand: string | null;
  material: string;
  color: string;
  colorHex: string | null;
  diameter: number;
  netInitialG: number;
  tareG: number;
  status: SpoolStatus;
  thresholdG: number | null;
  location: string | null;
  notes: string | null;
  lastWeighInAt: string | null;
  lastWeightG: number | null;
  remainingG: number | null;
  remainingPct: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface WeighIn {
  id: string;
  weightG: number;
  createdAt: string;
  createdBy: string;
  note: string | null;
}

export interface SpoolCreateInput {
  label: string;
  brand?: string;
  material: string;
  color: string;
  colorHex?: string;
  diameter: number;
  netInitialG: number;
  tareG: number;
  status?: SpoolStatus;
  thresholdG?: number;
  location?: string;
  notes?: string;
}

export interface SpoolUpdateInput {
  spoolId: string;
  label?: string;
  brand?: string | null;
  material?: string;
  color?: string;
  colorHex?: string | null;
  diameter?: number;
  netInitialG?: number;
  tareG?: number;
  status?: SpoolStatus;
  thresholdG?: number | null;
  location?: string | null;
  notes?: string | null;
}

export interface WeighInInput {
  spoolId: string;
  weightG: number;
  note?: string;
}

// Materiales comunes de filamento
export const FILAMENT_MATERIALS = [
  "PLA",
  "PETG",
  "ABS",
  "ASA",
  "TPU",
  "Nylon",
  "PC",
  "PVA",
  "HIPS",
  "Wood",
  "Carbon Fiber",
  "Metal Fill",
  "Otro",
] as const;

// Diametros estandar
export const FILAMENT_DIAMETERS = [1.75, 2.85] as const;

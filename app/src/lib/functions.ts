import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";
import type { Spool, WeighIn } from "@/types/spool";
import type { LaserMaterial, Movement } from "@/types/laser";

// Auth functions
export const authCheckOwner = httpsCallable<void, { isOwner: boolean; uid: string }>(
  functions,
  "authCheckOwner"
);

// Spools - Read
export const spoolsList = httpsCallable<void, Spool[]>(functions, "spoolsList");
export const spoolsGet = httpsCallable<{ spoolId: string }, Spool>(functions, "spoolsGet");
export const spoolsGetWeighIns = httpsCallable<{ spoolId: string }, WeighIn[]>(
  functions,
  "spoolsGetWeighIns"
);

// Spools - Write
export const spoolsCreate = httpsCallable(functions, "spoolsCreate");
export const spoolsUpdate = httpsCallable(functions, "spoolsUpdate");
export const spoolsArchive = httpsCallable(functions, "spoolsArchive");
export const spoolsDelete = httpsCallable(functions, "spoolsDelete");
export const spoolsAddWeighIn = httpsCallable(functions, "spoolsAddWeighIn");

// Spools - AI
export type AIProvider = "perplexity" | "lmstudio";

export interface ScanLabelResult {
  success: boolean;
  provider: AIProvider;
  data: {
    brand: string | null;
    material: string | null;
    color: string | null;
    netWeightG: number | null;
    diameter: number | null;
    suggestedTareG: number;
    tareSource: "brand" | "default";
  };
}

export interface EstimateRemainingResult {
  remainingG: number;
  remainingPct: number;
  usedTareG: number;
  tareSource: "custom" | "brand" | "default";
  estimatedMeters: number;
  aiInsights: string | null;
  provider: AIProvider | null;
}

export const spoolsScanLabel = httpsCallable<
  { imageBase64: string },
  ScanLabelResult
>(functions, "spoolsScanLabel");

export const spoolsEstimateRemaining = httpsCallable<
  {
    currentWeightG: number;
    brand?: string;
    customTareG?: number;
    netInitialG: number;
  },
  EstimateRemainingResult
>(functions, "spoolsEstimateRemaining");

// Settings
export interface AISettingsData {
  provider: AIProvider;
  perplexityApiKey: string;
  perplexityApiKeySet?: boolean;
  lmstudioUrl: string;
  lmstudioModel: string;
}

export interface AISettingsInput {
  provider: AIProvider;
  perplexityApiKey?: string;
  lmstudioUrl?: string;
  lmstudioModel?: string;
}

export interface TestAIResult {
  success: boolean;
  provider: AIProvider;
  message: string;
  models?: string[];
}

export const settingsGetAI = httpsCallable<void, AISettingsData>(
  functions,
  "settingsGetAI"
);

export const settingsSaveAI = httpsCallable<AISettingsInput, { success: boolean }>(
  functions,
  "settingsSaveAI"
);

export const settingsTestAI = httpsCallable<void, TestAIResult>(
  functions,
  "settingsTestAI"
);

// Laser - Read
export const laserList = httpsCallable<void, LaserMaterial[]>(functions, "laserList");
export const laserGet = httpsCallable<{ materialId: string }, LaserMaterial>(functions, "laserGet");
export const laserGetMovements = httpsCallable<{ materialId: string }, Movement[]>(
  functions,
  "laserGetMovements"
);

// Laser - Write
export const laserCreate = httpsCallable(functions, "laserCreate");
export const laserUpdate = httpsCallable(functions, "laserUpdate");
export const laserAdjustStock = httpsCallable(functions, "laserAdjustStock");
export const laserDelete = httpsCallable(functions, "laserDelete");

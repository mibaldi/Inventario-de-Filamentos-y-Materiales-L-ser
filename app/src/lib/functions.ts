import { api } from "./api";
import type { Spool, WeighIn } from "@/types/spool";
import type { LaserMaterial, Movement } from "@/types/laser";

// ==================== Auth ====================

export async function authCheckOwner(): Promise<{ isOwner: boolean; uid: string }> {
  return api.get("/auth/check-owner");
}

// ==================== Spools - Read ====================

export async function spoolsList(): Promise<Spool[]> {
  return api.get("/spools");
}

export async function spoolsGet(spoolId: string): Promise<Spool> {
  return api.get(`/spools/${spoolId}`);
}

export async function spoolsGetWeighIns(spoolId: string): Promise<WeighIn[]> {
  return api.get(`/spools/${spoolId}/weigh-ins`);
}

// ==================== Spools - Write ====================

export async function spoolsCreate(data: Partial<Spool>): Promise<{ id: string }> {
  return api.post("/spools", data);
}

export async function spoolsUpdate(
  spoolId: string,
  data: Partial<Spool>
): Promise<{ success: boolean }> {
  return api.put(`/spools/${spoolId}`, data);
}

export async function spoolsArchive(spoolId: string): Promise<{ success: boolean }> {
  return api.post(`/spools/${spoolId}/archive`);
}

export async function spoolsDelete(spoolId: string): Promise<{ success: boolean }> {
  return api.delete(`/spools/${spoolId}`);
}

export async function spoolsAddWeighIn(
  spoolId: string,
  data: { weightG: number; note?: string }
): Promise<{
  weighInId: string;
  remainingG: number;
  remainingPct: number;
  status: string;
}> {
  return api.post(`/spools/${spoolId}/weigh-ins`, data);
}

// ==================== Spools - AI ====================

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
    printTempMinC?: number | null;
    printTempMaxC?: number | null;
    bedTempMinC?: number | null;
    bedTempMaxC?: number | null;
    barcode?: string | null;
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

export async function spoolsScanLabel(data: {
  imageBase64: string;
}): Promise<ScanLabelResult> {
  return api.post("/spools/scan-label", data);
}

export async function spoolsEstimateRemaining(data: {
  currentWeightG: number;
  brand?: string;
  customTareG?: number;
  netInitialG: number;
}): Promise<EstimateRemainingResult> {
  return api.post("/spools/estimate-remaining", data);
}

// ==================== Settings ====================

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

export async function settingsGetAI(): Promise<AISettingsData> {
  return api.get("/settings/ai");
}

export async function settingsSaveAI(
  data: AISettingsInput
): Promise<{ success: boolean }> {
  return api.post("/settings/ai", data);
}

export async function settingsTestAI(): Promise<TestAIResult> {
  return api.post("/settings/ai/test");
}

// ==================== Laser - Read ====================

export async function laserList(): Promise<LaserMaterial[]> {
  return api.get("/laser");
}

export async function laserGet(materialId: string): Promise<LaserMaterial> {
  return api.get(`/laser/${materialId}`);
}

export async function laserGetMovements(materialId: string): Promise<Movement[]> {
  return api.get(`/laser/${materialId}/movements`);
}

// ==================== Laser - Write ====================

export async function laserCreate(
  data: Partial<LaserMaterial>
): Promise<{ id: string }> {
  return api.post("/laser", data);
}

export async function laserUpdate(
  materialId: string,
  data: Partial<LaserMaterial>
): Promise<{ success: boolean }> {
  return api.put(`/laser/${materialId}`, data);
}

export async function laserAdjustStock(
  materialId: string,
  data: { delta: number; note?: string }
): Promise<{ movementId: string; quantityRemaining: number }> {
  return api.post(`/laser/${materialId}/adjust-stock`, data);
}

export async function laserDelete(materialId: string): Promise<{ success: boolean }> {
  return api.delete(`/laser/${materialId}`);
}

// ==================== Laser - AI ====================

export interface ScanMaterialLabelResult {
  success: boolean;
  provider: AIProvider;
  data: {
    brand: string | null;
    name: string | null;
    model: string | null;
    type: string | null;
    thicknessMm: number | null;
    pcsPerPack: number | null;
    barcode: string | null;
    color: string | null;
    safeFlag: "OK" | "CAUTION" | "NO";
    imageUrl: string | null;
    catalogMatch: boolean;
  };
}

export interface BambuCatalogMaterial {
  name: string;
  model: string;
  barcode: string;
  type: string;
  thicknessMm: number;
  pcsPerPack: number;
  safeFlag: "OK" | "CAUTION" | "NO";
  imageUrl: string;
}

export async function laserScanLabel(data: {
  imageBase64: string;
}): Promise<ScanMaterialLabelResult> {
  return api.post("/laser/scan-label", data);
}

export async function laserGetCatalog(): Promise<BambuCatalogMaterial[]> {
  return api.get("/laser/catalog");
}

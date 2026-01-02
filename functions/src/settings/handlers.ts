import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { assertOwner, getOwnerUid, ownerUidSecret } from "../utils/auth.js";
import { z } from "zod";

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

const region = "europe-west1";
const secrets = [ownerUidSecret];

// Schema para la configuración de IA
const AISettingsInput = z.object({
  provider: z.enum(["perplexity", "lmstudio"]),
  perplexityApiKey: z.string().optional(),
  lmstudioUrl: z.string().url().optional(),
  lmstudioModel: z.string().optional(),
});

export interface AISettings {
  provider: "perplexity" | "lmstudio";
  perplexityApiKey?: string;
  lmstudioUrl?: string;
  lmstudioModel?: string;
}

// Obtener configuración de IA
export const settingsGetAI = onCall({ region, secrets }, async (request) => {
  assertOwner(request);
  const ownerUid = getOwnerUid();

  const doc = await db.collection("settings").doc(ownerUid).get();

  if (!doc.exists) {
    // Configuración por defecto
    return {
      provider: "lmstudio",
      perplexityApiKey: "",
      lmstudioUrl: "http://localhost:1234/v1",
      lmstudioModel: "",
    };
  }

  const data = doc.data()!;
  return {
    provider: data.aiProvider ?? "lmstudio",
    perplexityApiKey: data.perplexityApiKey ? "••••••••" : "", // No exponer la key completa
    perplexityApiKeySet: !!data.perplexityApiKey,
    lmstudioUrl: data.lmstudioUrl ?? "http://localhost:1234/v1",
    lmstudioModel: data.lmstudioModel ?? "",
  };
});

// Guardar configuración de IA
export const settingsSaveAI = onCall({ region, secrets }, async (request) => {
  assertOwner(request);

  const parsed = AISettingsInput.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", parsed.error.message);
  }

  const ownerUid = getOwnerUid();
  const data = parsed.data;

  const updateData: Record<string, unknown> = {
    aiProvider: data.provider,
    lmstudioUrl: data.lmstudioUrl ?? null,
    lmstudioModel: data.lmstudioModel ?? null,
  };

  // Solo actualizar la API key si se proporciona una nueva (no vacía y no la máscara)
  if (data.perplexityApiKey && !data.perplexityApiKey.startsWith("••")) {
    updateData.perplexityApiKey = data.perplexityApiKey;
  }

  await db.collection("settings").doc(ownerUid).set(updateData, { merge: true });

  return { success: true };
});

// Función auxiliar para obtener la configuración de IA (usada internamente por otras funciones)
export async function getAISettings(ownerUid: string): Promise<AISettings> {
  const doc = await db.collection("settings").doc(ownerUid).get();

  if (!doc.exists) {
    return {
      provider: "lmstudio",
      lmstudioUrl: "http://localhost:1234/v1",
    };
  }

  const data = doc.data()!;
  return {
    provider: data.aiProvider ?? "lmstudio",
    perplexityApiKey: data.perplexityApiKey,
    lmstudioUrl: data.lmstudioUrl ?? "http://localhost:1234/v1",
    lmstudioModel: data.lmstudioModel,
  };
}

// Test de conexión con el proveedor de IA
export const settingsTestAI = onCall({ region, secrets }, async (request) => {
  assertOwner(request);
  const ownerUid = getOwnerUid();

  const settings = await getAISettings(ownerUid);

  try {
    if (settings.provider === "lmstudio") {
      if (!settings.lmstudioUrl) {
        throw new Error("URL de LM Studio no configurada");
      }

      // Test de conexión a LM Studio
      const response = await fetch(`${settings.lmstudioUrl}/models`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`LM Studio respondió con error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        provider: "lmstudio",
        message: `Conectado a LM Studio. Modelos disponibles: ${data.data?.length ?? 0}`,
        models: data.data?.map((m: { id: string }) => m.id) ?? [],
      };
    } else if (settings.provider === "perplexity") {
      if (!settings.perplexityApiKey) {
        throw new Error("API Key de Perplexity no configurada");
      }

      // Test simple a Perplexity
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${settings.perplexityApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [{ role: "user", content: "test" }],
          max_tokens: 1,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Perplexity respondió con error: ${error}`);
      }

      return {
        success: true,
        provider: "perplexity",
        message: "Conexión exitosa con Perplexity",
      };
    }

    throw new Error("Proveedor no soportado");
  } catch (error) {
    return {
      success: false,
      provider: settings.provider,
      message: error instanceof Error ? error.message : "Error desconocido",
    };
  }
});

import { Router, Response } from "express";
import { AuthenticatedRequest, getOwnerUid } from "../utils/express-auth.js";
import { getAISettings, type AISettings } from "../settings/handlers.js";
import { z } from "zod";

const router = Router();

const ScanLabelInput = z.object({
  imageBase64: z.string().min(1, "Imagen requerida"),
});

const EstimateRemainingInput = z.object({
  currentWeightG: z.number().nonnegative("Peso debe ser >= 0"),
  brand: z.string().optional(),
  customTareG: z.number().nonnegative().optional(),
  netInitialG: z.number().positive("Peso neto inicial debe ser positivo"),
});

const BRAND_TARES: Record<string, number> = {
  sunlu: 200,
  esun: 230,
  "bambu lab": 250,
  bambu: 250,
  polymaker: 240,
  prusament: 200,
  prusa: 200,
  hatchbox: 220,
  overture: 210,
  eryone: 195,
  jayo: 200,
  creality: 230,
  elegoo: 215,
  anycubic: 220,
  flashforge: 225,
  "3d solutech": 210,
  "amazon basics": 215,
  inland: 205,
  geeetech: 200,
  tianse: 210,
  ttyt3d: 200,
  giantarm: 205,
  colorfabb: 180,
  fillamentum: 185,
  formfutura: 190,
  "3dxtech": 200,
  matterhackers: 210,
};

const DEFAULT_TARE_G = 220;

function findTareByBrand(brand: string | undefined): { tareG: number; source: "brand" | "default" } {
  if (!brand) {
    return { tareG: DEFAULT_TARE_G, source: "default" };
  }

  const normalized = brand.toLowerCase().trim();

  for (const [key, value] of Object.entries(BRAND_TARES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { tareG: value, source: "brand" };
    }
  }

  return { tareG: DEFAULT_TARE_G, source: "default" };
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface ChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface AIConfig {
  provider: "perplexity" | "lmstudio";
  apiUrl: string;
  apiKey?: string;
  model: string;
}

function getAIConfigFromSettings(settings: AISettings): AIConfig | null {
  if (settings.provider === "lmstudio" && settings.lmstudioUrl) {
    return {
      provider: "lmstudio",
      apiUrl: `${settings.lmstudioUrl}/chat/completions`,
      model: settings.lmstudioModel || "local-model",
    };
  }

  if (settings.provider === "perplexity" && settings.perplexityApiKey) {
    return {
      provider: "perplexity",
      apiUrl: "https://api.perplexity.ai/chat/completions",
      apiKey: settings.perplexityApiKey,
      model: "llama-3.1-sonar-large-128k-online",
    };
  }

  if (settings.lmstudioUrl) {
    return {
      provider: "lmstudio",
      apiUrl: `${settings.lmstudioUrl}/chat/completions`,
      model: settings.lmstudioModel || "local-model",
    };
  }

  if (settings.perplexityApiKey) {
    return {
      provider: "perplexity",
      apiUrl: "https://api.perplexity.ai/chat/completions",
      apiKey: settings.perplexityApiKey,
      model: "llama-3.1-sonar-large-128k-online",
    };
  }

  return null;
}

async function callAI(
  config: AIConfig,
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (config.apiKey) {
    headers["Authorization"] = `Bearer ${config.apiKey}`;
  }

  const response = await fetch(config.apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model,
      messages,
      max_tokens: options?.maxTokens ?? 1024,
      temperature: options?.temperature ?? 0.1,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error de ${config.provider}: ${error}`);
  }

  const data = (await response.json()) as ChatResponse;
  return data.choices[0]?.message?.content ?? "";
}

// POST /api/spools/scan-label - Escanear etiqueta con IA
router.post("/scan-label", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = ScanLabelInput.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { imageBase64 } = parsed.data;
    const ownerUid = getOwnerUid();

    const settings = await getAISettings(ownerUid);
    const aiConfig = getAIConfigFromSettings(settings);

    if (!aiConfig) {
      res.status(400).json({
        error: "No hay proveedor de IA configurado. Ve a Ajustes para configurar LM Studio o Perplexity.",
      });
      return;
    }

    const systemPrompt = `Eres un experto en filamentos de impresión 3D. Analiza la imagen de una etiqueta de filamento y extrae la información.

IMPORTANTE: Responde SOLO con un JSON válido, sin texto adicional ni markdown. El formato debe ser exactamente:
{
  "brand": "marca del fabricante o null",
  "material": "tipo de material (PLA, PETG, ABS, TPU, etc.) o null",
  "color": "color del filamento o null",
  "netWeightG": número en gramos o null,
  "diameter": número en mm (1.75 o 2.85) o null,
  "printTempMinC": temperatura mínima de impresión en °C o null,
  "printTempMaxC": temperatura máxima de impresión en °C o null,
  "bedTempMinC": temperatura mínima de cama en °C o null,
  "bedTempMaxC": temperatura máxima de cama en °C o null,
  "barcode": código de barras o null
}

Si no puedes identificar algún campo, usa null.`;

    const response = await callAI(aiConfig, [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
          },
          {
            type: "text",
            text: "Analiza esta etiqueta de filamento y extrae: marca, material, color, peso neto, diámetro, temperaturas de impresión y cama, y código de barras.",
          },
        ],
      },
    ]);

    let extractedData;
    try {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, "").trim();
      extractedData = JSON.parse(cleanResponse);
    } catch {
      extractedData = {
        brand: null,
        material: null,
        color: null,
        netWeightG: null,
        diameter: null,
        printTempMinC: null,
        printTempMaxC: null,
        bedTempMinC: null,
        bedTempMaxC: null,
        barcode: null,
      };
    }

    const { tareG: suggestedTareG, source: tareSource } = findTareByBrand(extractedData.brand);

    res.json({
      success: true,
      provider: aiConfig.provider,
      data: {
        brand: extractedData.brand ?? null,
        material: extractedData.material ?? null,
        color: extractedData.color ?? null,
        netWeightG: extractedData.netWeightG ?? null,
        diameter: extractedData.diameter ?? null,
        printTempMinC: extractedData.printTempMinC ?? null,
        printTempMaxC: extractedData.printTempMaxC ?? null,
        bedTempMinC: extractedData.bedTempMinC ?? null,
        bedTempMaxC: extractedData.bedTempMaxC ?? null,
        barcode: extractedData.barcode ?? null,
        suggestedTareG,
        tareSource,
      },
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// POST /api/spools/estimate-remaining - Estimar filamento restante
router.post("/estimate-remaining", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = EstimateRemainingInput.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { currentWeightG, brand, customTareG, netInitialG } = parsed.data;
    const ownerUid = getOwnerUid();

    let usedTareG: number;
    let tareSource: "custom" | "brand" | "default";

    if (customTareG !== undefined) {
      usedTareG = customTareG;
      tareSource = "custom";
    } else {
      const result = findTareByBrand(brand);
      usedTareG = result.tareG;
      tareSource = result.source === "brand" ? "brand" : "default";
    }

    const remainingG = Math.max(0, currentWeightG - usedTareG);
    const remainingPct = netInitialG > 0 ? remainingG / netInitialG : 0;
    const estimatedMeters = Math.round((remainingG / 1000) * 330);

    let aiInsights: string | null = null;
    let usedProvider: string | null = null;

    const settings = await getAISettings(ownerUid);
    const aiConfig = getAIConfigFromSettings(settings);

    if (aiConfig) {
      try {
        const prompt = `Tengo una bobina de filamento con ${remainingG}g restantes de ${netInitialG}g iniciales (${Math.round(remainingPct * 100)}%).

Dame un consejo breve (máximo 2 frases) sobre:
- Si debería considerar comprar un reemplazo pronto
- Aproximadamente cuántas horas de impresión puedo esperar

Responde de forma concisa y práctica.`;

        aiInsights = await callAI(aiConfig, [{ role: "user", content: prompt }]);
        aiInsights = aiInsights.slice(0, 200);
        usedProvider = aiConfig.provider;
      } catch {
        // Ignorar errores de IA
      }
    }

    res.json({
      remainingG,
      remainingPct,
      usedTareG,
      tareSource,
      estimatedMeters,
      aiInsights,
      provider: usedProvider,
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;

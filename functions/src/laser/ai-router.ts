import { Router, Response } from "express";
import { AuthenticatedRequest, getOwnerUid } from "../utils/express-auth.js";
import { getAISettings, type AISettings } from "../settings/handlers.js";
import { z } from "zod";

const router = Router();

const ScanMaterialLabelInput = z.object({
  imageBase64: z.string().min(1, "Imagen requerida"),
});

// Catálogo de materiales Bambu Lab con imágenes
const BAMBU_MATERIALS: Record<string, {
  name: string;
  model: string;
  type: string;
  thicknessMm: number;
  pcsPerPack: number;
  safeFlag: "OK" | "CAUTION" | "NO";
  imageUrl: string;
}> = {
  // Por código de barras
  "6977252629702": {
    name: "3mm Basswood Plywood (6PCS)",
    model: "B-YA001",
    type: "Contrachapado",
    thicknessMm: 3,
    pcsPerPack: 6,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YA001.png?v=1731054892&width=800",
  },
  "6977252629719": {
    name: "5mm Basswood Plywood (4PCS)",
    model: "B-YA002",
    type: "Contrachapado",
    thicknessMm: 5,
    pcsPerPack: 4,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YA002.png?v=1731054906&width=800",
  },
  "6977252629726": {
    name: "3mm MDF Board (6PCS)",
    model: "B-YB001",
    type: "MDF",
    thicknessMm: 3,
    pcsPerPack: 6,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YB001.png?v=1731054923&width=800",
  },
  "6977252629733": {
    name: "5mm MDF Board (4PCS)",
    model: "B-YB002",
    type: "MDF",
    thicknessMm: 5,
    pcsPerPack: 4,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YB002.png?v=1731054936&width=800",
  },
  "6977252629740": {
    name: "3mm Walnut Plywood (6PCS)",
    model: "B-YC001",
    type: "Contrachapado",
    thicknessMm: 3,
    pcsPerPack: 6,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YC001.png?v=1731054950&width=800",
  },
  "6977252629757": {
    name: "5mm Walnut Plywood (4PCS)",
    model: "B-YC002",
    type: "Contrachapado",
    thicknessMm: 5,
    pcsPerPack: 4,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YC002.png?v=1731054963&width=800",
  },
  "6977252629764": {
    name: "3mm Cherry Plywood (6PCS)",
    model: "B-YD001",
    type: "Contrachapado",
    thicknessMm: 3,
    pcsPerPack: 6,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YD001.png?v=1731054979&width=800",
  },
  "6977252629771": {
    name: "5mm Cherry Plywood (4PCS)",
    model: "B-YD002",
    type: "Contrachapado",
    thicknessMm: 5,
    pcsPerPack: 4,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YD002.png?v=1731054991&width=800",
  },
  "6977252629788": {
    name: "3mm White Acrylic Sheet (6PCS)",
    model: "B-YE001",
    type: "Acrilico",
    thicknessMm: 3,
    pcsPerPack: 6,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YE001.png?v=1731055005&width=800",
  },
  "6977252629795": {
    name: "3mm Black Acrylic Sheet (6PCS)",
    model: "B-YE002",
    type: "Acrilico",
    thicknessMm: 3,
    pcsPerPack: 6,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YE002.png?v=1731055018&width=800",
  },
  "6977252629801": {
    name: "3mm Transparent Acrylic Sheet (6PCS)",
    model: "B-YE003",
    type: "Acrilico",
    thicknessMm: 3,
    pcsPerPack: 6,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YE003.png?v=1731055031&width=800",
  },
  "6977252629818": {
    name: "1.5mm Natural Leather (6PCS)",
    model: "B-YF001",
    type: "Cuero",
    thicknessMm: 1.5,
    pcsPerPack: 6,
    safeFlag: "CAUTION",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YF001.png?v=1731055045&width=800",
  },
  "6977252629825": {
    name: "1.5mm Brown Leather (6PCS)",
    model: "B-YF002",
    type: "Cuero",
    thicknessMm: 1.5,
    pcsPerPack: 6,
    safeFlag: "CAUTION",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YF002.png?v=1731055058&width=800",
  },
  "6977252629832": {
    name: "3mm Cork Sheet (6PCS)",
    model: "B-YG001",
    type: "Corcho",
    thicknessMm: 3,
    pcsPerPack: 6,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YG001.png?v=1731055072&width=800",
  },
  "6977252629849": {
    name: "2mm Kraft Cardboard (10PCS)",
    model: "B-YH001",
    type: "Carton",
    thicknessMm: 2,
    pcsPerPack: 10,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YH001.png?v=1731055086&width=800",
  },
  "6977252629856": {
    name: "2.3mm Rubber Sheet (6PCS)",
    model: "B-YI001",
    type: "Goma EVA",
    thicknessMm: 2.3,
    pcsPerPack: 6,
    safeFlag: "CAUTION",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YI001.png?v=1731055099&width=800",
  },
  "6977252629863": {
    name: "Cotton Fabric (10PCS)",
    model: "B-YJ001",
    type: "Tela",
    thicknessMm: 0.5,
    pcsPerPack: 10,
    safeFlag: "CAUTION",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YJ001.png?v=1731055113&width=800",
  },
  "6977252629870": {
    name: "Felt Fabric (10PCS)",
    model: "B-YJ002",
    type: "Tela",
    thicknessMm: 1,
    pcsPerPack: 10,
    safeFlag: "CAUTION",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YJ002.png?v=1731055126&width=800",
  },
};

// También indexado por modelo para búsqueda alternativa
const BAMBU_MATERIALS_BY_MODEL: Record<string, typeof BAMBU_MATERIALS[string] & { barcode: string }> = {};
for (const [barcode, material] of Object.entries(BAMBU_MATERIALS)) {
  BAMBU_MATERIALS_BY_MODEL[material.model.toLowerCase()] = { ...material, barcode };
  // También sin el prefijo B-
  const modelWithoutPrefix = material.model.replace(/^B-/, "").toLowerCase();
  BAMBU_MATERIALS_BY_MODEL[modelWithoutPrefix] = { ...material, barcode };
}

function findMaterialInCatalog(barcode?: string, model?: string): (typeof BAMBU_MATERIALS[string] & { barcode: string }) | null {
  // Primero intentar por código de barras
  if (barcode && BAMBU_MATERIALS[barcode]) {
    return { ...BAMBU_MATERIALS[barcode], barcode };
  }

  // Luego por modelo
  if (model) {
    const normalizedModel = model.toLowerCase().trim();
    if (BAMBU_MATERIALS_BY_MODEL[normalizedModel]) {
      return BAMBU_MATERIALS_BY_MODEL[normalizedModel];
    }
  }

  return null;
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

// POST /api/laser/scan-label - Escanear etiqueta de material con IA
router.post("/scan-label", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = ScanMaterialLabelInput.safeParse(req.body);
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

    const systemPrompt = `Eres un experto en materiales para corte láser. Analiza la imagen de una etiqueta de material (típicamente de Bambu Lab) y extrae la información.

IMPORTANTE: Responde SOLO con un JSON válido, sin texto adicional ni markdown. El formato debe ser exactamente:
{
  "brand": "marca del fabricante (ej: Bambu Lab) o null",
  "name": "nombre completo del producto o null",
  "model": "código de modelo (ej: B-YA001, YA001) o null",
  "type": "tipo de material (Contrachapado, MDF, Acrilico, Cuero, Corcho, Carton, Tela, Goma EVA, Madera maciza, Papel) o null",
  "thicknessMm": número de espesor en milímetros o null,
  "pcsPerPack": número de piezas por paquete o null,
  "barcode": código de barras numérico o null,
  "color": color del material si aplica o null
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
            text: "Analiza esta etiqueta de material para corte láser y extrae: marca, nombre del producto, modelo, tipo de material, espesor, cantidad de piezas, código de barras y color.",
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
        name: null,
        model: null,
        type: null,
        thicknessMm: null,
        pcsPerPack: null,
        barcode: null,
        color: null,
      };
    }

    // Convertir barcode a string si es número (la IA puede devolverlo como número)
    const barcodeStr = extractedData.barcode != null ? String(extractedData.barcode) : undefined;

    // Buscar en el catálogo de Bambu Lab por código de barras o modelo
    const catalogMatch = findMaterialInCatalog(barcodeStr, extractedData.model);

    // Combinar datos extraídos con datos del catálogo
    const finalData = {
      brand: extractedData.brand ?? (catalogMatch ? "Bambu Lab" : null),
      name: catalogMatch?.name ?? extractedData.name ?? null,
      model: catalogMatch?.model ?? extractedData.model ?? null,
      type: catalogMatch?.type ?? extractedData.type ?? null,
      thicknessMm: catalogMatch?.thicknessMm ?? extractedData.thicknessMm ?? null,
      pcsPerPack: catalogMatch?.pcsPerPack ?? extractedData.pcsPerPack ?? null,
      barcode: catalogMatch?.barcode ?? barcodeStr ?? null,
      color: extractedData.color ?? null,
      safeFlag: catalogMatch?.safeFlag ?? "OK",
      imageUrl: catalogMatch?.imageUrl ?? null,
      catalogMatch: catalogMatch !== null,
    };

    res.json({
      success: true,
      provider: aiConfig.provider,
      data: finalData,
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// GET /api/laser/catalog - Obtener catálogo de materiales Bambu Lab
router.get("/catalog", async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const materials = Object.entries(BAMBU_MATERIALS).map(([barcode, material]) => ({
      ...material,
      barcode,
    }));
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;

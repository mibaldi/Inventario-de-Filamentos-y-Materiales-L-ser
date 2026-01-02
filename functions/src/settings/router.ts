import { Router, Response } from "express";
import { getFirestore } from "firebase-admin/firestore";
import { AuthenticatedRequest, getOwnerUid } from "../utils/express-auth.js";
import { z } from "zod";
import { getAISettings } from "./handlers.js";

const router = Router();
const db = getFirestore();

const AISettingsInput = z.object({
  provider: z.enum(["perplexity", "lmstudio"]),
  perplexityApiKey: z.string().optional(),
  lmstudioUrl: z.string().url().optional(),
  lmstudioModel: z.string().optional(),
});

// GET /api/settings/ai - Obtener configuración de IA
router.get("/ai", async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const ownerUid = getOwnerUid();
    const doc = await db.collection("settings").doc(ownerUid).get();

    if (!doc.exists) {
      res.json({
        provider: "lmstudio",
        perplexityApiKey: "",
        lmstudioUrl: "http://localhost:1234/v1",
        lmstudioModel: "",
      });
      return;
    }

    const data = doc.data()!;
    res.json({
      provider: data.aiProvider ?? "lmstudio",
      perplexityApiKey: data.perplexityApiKey ? "••••••••" : "",
      perplexityApiKeySet: !!data.perplexityApiKey,
      lmstudioUrl: data.lmstudioUrl ?? "http://localhost:1234/v1",
      lmstudioModel: data.lmstudioModel ?? "",
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// POST /api/settings/ai - Guardar configuración de IA
router.post("/ai", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = AISettingsInput.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const ownerUid = getOwnerUid();
    const data = parsed.data;

    const updateData: Record<string, unknown> = {
      aiProvider: data.provider,
      lmstudioUrl: data.lmstudioUrl ?? null,
      lmstudioModel: data.lmstudioModel ?? null,
    };

    if (data.perplexityApiKey && !data.perplexityApiKey.startsWith("••")) {
      updateData.perplexityApiKey = data.perplexityApiKey;
    }

    await db.collection("settings").doc(ownerUid).set(updateData, { merge: true });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// POST /api/settings/ai/test - Test de conexión con el proveedor de IA
router.post("/ai/test", async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const ownerUid = getOwnerUid();
    const settings = await getAISettings(ownerUid);

    if (settings.provider === "lmstudio") {
      if (!settings.lmstudioUrl) {
        res.json({
          success: false,
          provider: "lmstudio",
          message: "URL de LM Studio no configurada",
        });
        return;
      }

      const response = await fetch(`${settings.lmstudioUrl}/models`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        res.json({
          success: false,
          provider: "lmstudio",
          message: `LM Studio respondió con error: ${response.status}`,
        });
        return;
      }

      const data = await response.json();
      res.json({
        success: true,
        provider: "lmstudio",
        message: `Conectado a LM Studio. Modelos disponibles: ${data.data?.length ?? 0}`,
        models: data.data?.map((m: { id: string }) => m.id) ?? [],
      });
    } else if (settings.provider === "perplexity") {
      if (!settings.perplexityApiKey) {
        res.json({
          success: false,
          provider: "perplexity",
          message: "API Key de Perplexity no configurada",
        });
        return;
      }

      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.perplexityApiKey}`,
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
        res.json({
          success: false,
          provider: "perplexity",
          message: `Perplexity respondió con error: ${error}`,
        });
        return;
      }

      res.json({
        success: true,
        provider: "perplexity",
        message: "Conexión exitosa con Perplexity",
      });
    } else {
      res.json({
        success: false,
        provider: settings.provider,
        message: "Proveedor no soportado",
      });
    }
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;

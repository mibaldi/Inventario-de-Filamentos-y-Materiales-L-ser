import { Router, Response } from "express";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { AuthenticatedRequest, getOwnerUid } from "../utils/express-auth.js";
import {
  LaserCreateInput,
  LaserUpdateInput,
  AdjustStockInput,
} from "./schemas.js";

const router = Router();
const db = getFirestore();

// GET /api/laser - Listar todos los materiales
router.get("/", async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const snapshot = await db
      .collection("laserMaterials")
      .orderBy("updatedAt", "desc")
      .get();

    const materials = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }));

    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// POST /api/laser - Crear material
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = LaserCreateInput.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const data = parsed.data;
    const ownerUid = getOwnerUid();

    const docRef = db.collection("laserMaterials").doc();
    const now = Timestamp.now();

    await docRef.set({
      ownerUid,
      type: data.type,
      thicknessMm: data.thicknessMm,
      format: data.format,
      widthMm: data.widthMm ?? null,
      heightMm: data.heightMm ?? null,
      quantityInitial: data.quantityInitial,
      quantityRemaining: data.quantityInitial,
      safeFlag: data.safeFlag,
      location: data.location ?? null,
      notes: data.notes ?? null,
      thresholdQty: data.thresholdQty ?? null,
      createdAt: now,
      updatedAt: now,
    });

    res.status(201).json({ id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// GET /api/laser/:id - Obtener material
router.get("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("laserMaterials").doc(id).get();

    if (!doc.exists) {
      res.status(404).json({ error: "Material no encontrado" });
      return;
    }

    const data = doc.data()!;
    res.json({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// PUT /api/laser/:id - Actualizar material
router.put("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = LaserUpdateInput.safeParse({ ...req.body, materialId: id });
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { materialId: _, ...updates } = parsed.data;
    const docRef = db.collection("laserMaterials").doc(id);

    const doc = await docRef.get();
    if (!doc.exists) {
      res.status(404).json({ error: "Material no encontrado" });
      return;
    }

    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    await docRef.update(updateData);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// DELETE /api/laser/:id - Eliminar material
router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("laserMaterials").doc(id);

    const doc = await docRef.get();
    if (!doc.exists) {
      res.status(404).json({ error: "Material no encontrado" });
      return;
    }

    const movementsSnapshot = await docRef.collection("movements").get();
    const batch = db.batch();
    movementsSnapshot.docs.forEach((movementDoc) => {
      batch.delete(movementDoc.ref);
    });
    batch.delete(docRef);
    await batch.commit();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// POST /api/laser/:id/adjust-stock - Ajustar stock
router.post("/:id/adjust-stock", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = AdjustStockInput.safeParse({ ...req.body, materialId: id });
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { delta, note } = parsed.data;
    const ownerUid = getOwnerUid();

    const materialRef = db.collection("laserMaterials").doc(id);
    const materialDoc = await materialRef.get();

    if (!materialDoc.exists) {
      res.status(404).json({ error: "Material no encontrado" });
      return;
    }

    const materialData = materialDoc.data()!;
    const now = Timestamp.now();

    const newQuantity = Math.max(0, materialData.quantityRemaining + delta);

    const movementRef = materialRef.collection("movements").doc();
    await movementRef.set({
      deltaQty: delta,
      createdAt: now,
      createdBy: ownerUid,
      note: note ?? null,
    });

    await materialRef.update({
      quantityRemaining: newQuantity,
      updatedAt: now,
    });

    res.status(201).json({
      movementId: movementRef.id,
      quantityRemaining: newQuantity,
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// GET /api/laser/:id/movements - Obtener movimientos
router.get("/:id/movements", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const snapshot = await db
      .collection("laserMaterials")
      .doc(id)
      .collection("movements")
      .orderBy("createdAt", "desc")
      .get();

    const movements = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    }));

    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;

import { Router, Response } from "express";
import { getFirestore, Timestamp, Firestore } from "firebase-admin/firestore";
import { AuthenticatedRequest, getOwnerUid } from "../utils/express-auth.js";
import {
  SpoolCreateInput,
  SpoolUpdateInput,
  WeighInInput,
  type SpoolStatus,
} from "./schemas.js";

const router = Router();

let _db: Firestore | null = null;
function db(): Firestore {
  if (!_db) {
    _db = getFirestore();
  }
  return _db;
}

function deriveStatus(
  remainingG: number,
  thresholdG: number | undefined,
  currentStatus: SpoolStatus
): SpoolStatus {
  if (remainingG === 0) return "EMPTY";
  if (thresholdG && remainingG <= thresholdG) return "LOW";
  if (currentStatus === "NEW" || currentStatus === "ARCHIVED") return currentStatus;
  return "IN_USE";
}

// GET /api/spools - Listar todas las bobinas
router.get("/", async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const snapshot = await db()
      .collection("spools")
      .orderBy("updatedAt", "desc")
      .get();

    const spools = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
      lastWeighInAt: doc.data().lastWeighInAt?.toDate().toISOString() ?? null,
    }));

    res.json(spools);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// POST /api/spools - Crear bobina
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = SpoolCreateInput.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const data = parsed.data;
    const ownerUid = getOwnerUid();

    const docRef = db().collection("spools").doc();
    const now = Timestamp.now();

    await docRef.set({
      ownerUid,
      label: data.label,
      brand: data.brand ?? null,
      material: data.material,
      color: data.color,
      colorHex: data.colorHex ?? null,
      diameter: data.diameter,
      netInitialG: data.netInitialG,
      tareG: data.tareG,
      status: data.status,
      thresholdG: data.thresholdG ?? null,
      location: data.location ?? null,
      notes: data.notes ?? null,
      barcode: data.barcode ?? null,
      printTempMinC: data.printTempMinC ?? null,
      printTempMaxC: data.printTempMaxC ?? null,
      bedTempMinC: data.bedTempMinC ?? null,
      bedTempMaxC: data.bedTempMaxC ?? null,
      lastWeighInAt: null,
      lastWeightG: null,
      remainingG: null,
      remainingPct: null,
      createdAt: now,
      updatedAt: now,
    });

    res.status(201).json({ id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// GET /api/spools/:id - Obtener bobina
router.get("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await db().collection("spools").doc(id).get();

    if (!doc.exists) {
      res.status(404).json({ error: "Bobina no encontrada" });
      return;
    }

    const data = doc.data()!;
    res.json({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
      lastWeighInAt: data.lastWeighInAt?.toDate().toISOString() ?? null,
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// PUT /api/spools/:id - Actualizar bobina
router.put("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = SpoolUpdateInput.safeParse({ ...req.body, spoolId: id });
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { spoolId: _, ...updates } = parsed.data;
    const docRef = db().collection("spools").doc(id);

    const doc = await docRef.get();
    if (!doc.exists) {
      res.status(404).json({ error: "Bobina no encontrada" });
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

    const currentData = doc.data()!;
    const newTareG = updates.tareG ?? currentData.tareG;
    const newNetInitialG = updates.netInitialG ?? currentData.netInitialG;

    if (currentData.lastWeightG != null) {
      const remainingG = Math.max(0, currentData.lastWeightG - newTareG);
      const remainingPct = newNetInitialG > 0 ? remainingG / newNetInitialG : 0;
      updateData.remainingG = remainingG;
      updateData.remainingPct = remainingPct;

      if (!updates.status) {
        updateData.status = deriveStatus(
          remainingG,
          updates.thresholdG ?? currentData.thresholdG,
          currentData.status
        );
      }
    }

    await docRef.update(updateData);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// DELETE /api/spools/:id - Eliminar bobina
router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const docRef = db().collection("spools").doc(id);

    const doc = await docRef.get();
    if (!doc.exists) {
      res.status(404).json({ error: "Bobina no encontrada" });
      return;
    }

    const weighInsSnapshot = await docRef.collection("weighIns").get();
    const batch = db().batch();
    weighInsSnapshot.docs.forEach((weighInDoc) => {
      batch.delete(weighInDoc.ref);
    });
    batch.delete(docRef);
    await batch.commit();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// POST /api/spools/:id/archive - Archivar bobina
router.post("/:id/archive", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const docRef = db().collection("spools").doc(id);

    const doc = await docRef.get();
    if (!doc.exists) {
      res.status(404).json({ error: "Bobina no encontrada" });
      return;
    }

    await docRef.update({
      status: "ARCHIVED",
      updatedAt: Timestamp.now(),
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// GET /api/spools/:id/weigh-ins - Obtener pesadas
router.get("/:id/weigh-ins", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const snapshot = await db()
      .collection("spools")
      .doc(id)
      .collection("weighIns")
      .orderBy("createdAt", "desc")
      .get();

    const weighIns = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    }));

    res.json(weighIns);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// POST /api/spools/:id/weigh-ins - Agregar pesada
router.post("/:id/weigh-ins", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = WeighInInput.safeParse({ ...req.body, spoolId: id });
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { weightG, note } = parsed.data;
    const ownerUid = getOwnerUid();

    const spoolRef = db().collection("spools").doc(id);
    const spoolDoc = await spoolRef.get();

    if (!spoolDoc.exists) {
      res.status(404).json({ error: "Bobina no encontrada" });
      return;
    }

    const spoolData = spoolDoc.data()!;
    const now = Timestamp.now();

    const weighInRef = spoolRef.collection("weighIns").doc();
    await weighInRef.set({
      weightG,
      createdAt: now,
      createdBy: ownerUid,
      note: note ?? null,
    });

    const remainingG = Math.max(0, weightG - spoolData.tareG);
    const remainingPct =
      spoolData.netInitialG > 0 ? remainingG / spoolData.netInitialG : 0;

    const newStatus = deriveStatus(
      remainingG,
      spoolData.thresholdG,
      spoolData.status
    );

    await spoolRef.update({
      lastWeighInAt: now,
      lastWeightG: weightG,
      remainingG,
      remainingPct,
      status: newStatus,
      updatedAt: now,
    });

    res.status(201).json({
      weighInId: weighInRef.id,
      remainingG,
      remainingPct,
      status: newStatus,
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;

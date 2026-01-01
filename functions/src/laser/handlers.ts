import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { assertOwner, getOwnerUid } from "../utils/auth.js";
import {
  LaserCreateInput,
  LaserUpdateInput,
  AdjustStockInput,
  LaserIdInput,
} from "./schemas.js";

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();
const region = "europe-west1";

export const laserCreate = onCall({ region }, async (request) => {
  assertOwner(request);

  const parsed = LaserCreateInput.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", parsed.error.message);
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

  return { id: docRef.id };
});

export const laserUpdate = onCall({ region }, async (request) => {
  assertOwner(request);

  const parsed = LaserUpdateInput.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", parsed.error.message);
  }

  const { materialId, ...updates } = parsed.data;
  const docRef = db.collection("laserMaterials").doc(materialId);

  const doc = await docRef.get();
  if (!doc.exists) {
    throw new HttpsError("not-found", "Material no encontrado");
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

  return { success: true };
});

export const laserAdjustStock = onCall({ region }, async (request) => {
  assertOwner(request);

  const parsed = AdjustStockInput.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", parsed.error.message);
  }

  const { materialId, delta, note } = parsed.data;
  const ownerUid = getOwnerUid();

  const materialRef = db.collection("laserMaterials").doc(materialId);
  const materialDoc = await materialRef.get();

  if (!materialDoc.exists) {
    throw new HttpsError("not-found", "Material no encontrado");
  }

  const materialData = materialDoc.data()!;
  const now = Timestamp.now();

  // Calcular nuevo stock
  const newQuantity = Math.max(0, materialData.quantityRemaining + delta);

  // Crear registro de movimiento
  const movementRef = materialRef.collection("movements").doc();
  await movementRef.set({
    deltaQty: delta,
    createdAt: now,
    createdBy: ownerUid,
    note: note ?? null,
  });

  // Actualizar material
  await materialRef.update({
    quantityRemaining: newQuantity,
    updatedAt: now,
  });

  return {
    movementId: movementRef.id,
    quantityRemaining: newQuantity,
  };
});

// ==================== READ FUNCTIONS ====================

export const laserList = onCall({ region }, async (request) => {
  assertOwner(request);

  const snapshot = await db
    .collection("laserMaterials")
    .orderBy("updatedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate().toISOString(),
    updatedAt: doc.data().updatedAt?.toDate().toISOString(),
  }));
});

export const laserGet = onCall({ region }, async (request) => {
  assertOwner(request);

  const parsed = LaserIdInput.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", parsed.error.message);
  }

  const { materialId } = parsed.data;
  const doc = await db.collection("laserMaterials").doc(materialId).get();

  if (!doc.exists) {
    throw new HttpsError("not-found", "Material no encontrado");
  }

  const data = doc.data()!;
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate().toISOString(),
    updatedAt: data.updatedAt?.toDate().toISOString(),
  };
});

export const laserGetMovements = onCall({ region }, async (request) => {
  assertOwner(request);

  const parsed = LaserIdInput.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", parsed.error.message);
  }

  const { materialId } = parsed.data;
  const snapshot = await db
    .collection("laserMaterials")
    .doc(materialId)
    .collection("movements")
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate().toISOString(),
  }));
});

export const laserDelete = onCall({ region }, async (request) => {
  assertOwner(request);

  const parsed = LaserIdInput.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", parsed.error.message);
  }

  const { materialId } = parsed.data;
  const docRef = db.collection("laserMaterials").doc(materialId);

  const doc = await docRef.get();
  if (!doc.exists) {
    throw new HttpsError("not-found", "Material no encontrado");
  }

  // Eliminar subcoleccion movements
  const movementsSnapshot = await docRef.collection("movements").get();
  const batch = db.batch();
  movementsSnapshot.docs.forEach((movementDoc) => {
    batch.delete(movementDoc.ref);
  });
  batch.delete(docRef);
  await batch.commit();

  return { success: true };
});

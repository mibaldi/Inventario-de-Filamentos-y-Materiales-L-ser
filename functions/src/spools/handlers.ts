import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { assertOwner, getOwnerUid, ownerUidSecret } from "../utils/auth.js";
import {
  SpoolCreateInput,
  SpoolUpdateInput,
  WeighInInput,
  SpoolIdInput,
  type SpoolStatus,
} from "./schemas.js";

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

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

const region = "europe-west1";
const secrets = [ownerUidSecret];

export const spoolsCreate = onCall({ region, secrets }, async (request) => {
  assertOwner(request);

  const parsed = SpoolCreateInput.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", parsed.error.message);
  }

  const data = parsed.data;
  const ownerUid = getOwnerUid();

  const docRef = db.collection("spools").doc();
  const now = Timestamp.now();

  await docRef.set({
    ownerUid,
    label: data.label,
    material: data.material,
    color: data.color,
    diameter: data.diameter,
    netInitialG: data.netInitialG,
    tareG: data.tareG,
    status: data.status,
    thresholdG: data.thresholdG ?? null,
    location: data.location ?? null,
    notes: data.notes ?? null,
    lastWeighInAt: null,
    lastWeightG: null,
    remainingG: null,
    remainingPct: null,
    createdAt: now,
    updatedAt: now,
  });

  return { id: docRef.id };
});

export const spoolsUpdate = onCall({ region, secrets }, async (request) => {
  assertOwner(request);

  const parsed = SpoolUpdateInput.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", parsed.error.message);
  }

  const { spoolId, ...updates } = parsed.data;
  const docRef = db.collection("spools").doc(spoolId);

  const doc = await docRef.get();
  if (!doc.exists) {
    throw new HttpsError("not-found", "Bobina no encontrada");
  }

  const updateData: Record<string, unknown> = {
    updatedAt: Timestamp.now(),
  };

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      updateData[key] = value;
    }
  }

  // Si se actualiza tareG o netInitialG, recalcular remainingG si hay pesada previa
  const currentData = doc.data()!;
  const newTareG = updates.tareG ?? currentData.tareG;
  const newNetInitialG = updates.netInitialG ?? currentData.netInitialG;

  if (currentData.lastWeightG != null) {
    const remainingG = Math.max(0, currentData.lastWeightG - newTareG);
    const remainingPct = newNetInitialG > 0 ? remainingG / newNetInitialG : 0;
    updateData.remainingG = remainingG;
    updateData.remainingPct = remainingPct;

    // Derivar status automaticamente si aplica
    if (!updates.status) {
      updateData.status = deriveStatus(
        remainingG,
        updates.thresholdG ?? currentData.thresholdG,
        currentData.status
      );
    }
  }

  await docRef.update(updateData);

  return { success: true };
});

export const spoolsArchive = onCall({ region, secrets }, async (request) => {
  assertOwner(request);

  const parsed = SpoolIdInput.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", parsed.error.message);
  }

  const { spoolId } = parsed.data;
  const docRef = db.collection("spools").doc(spoolId);

  const doc = await docRef.get();
  if (!doc.exists) {
    throw new HttpsError("not-found", "Bobina no encontrada");
  }

  await docRef.update({
    status: "ARCHIVED",
    updatedAt: Timestamp.now(),
  });

  return { success: true };
});

export const spoolsDelete = onCall({ region, secrets }, async (request) => {
  assertOwner(request);

  const parsed = SpoolIdInput.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", parsed.error.message);
  }

  const { spoolId } = parsed.data;
  const docRef = db.collection("spools").doc(spoolId);

  const doc = await docRef.get();
  if (!doc.exists) {
    throw new HttpsError("not-found", "Bobina no encontrada");
  }

  // Eliminar subcoleccion weighIns
  const weighInsSnapshot = await docRef.collection("weighIns").get();
  const batch = db.batch();
  weighInsSnapshot.docs.forEach((weighInDoc) => {
    batch.delete(weighInDoc.ref);
  });
  batch.delete(docRef);
  await batch.commit();

  return { success: true };
});

// ==================== READ FUNCTIONS ====================

export const spoolsList = onCall({ region, secrets }, async (request) => {
  assertOwner(request);

  const snapshot = await db
    .collection("spools")
    .orderBy("updatedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate().toISOString(),
    updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    lastWeighInAt: doc.data().lastWeighInAt?.toDate().toISOString() ?? null,
  }));
});

export const spoolsGet = onCall({ region, secrets }, async (request) => {
  assertOwner(request);

  const parsed = SpoolIdInput.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", parsed.error.message);
  }

  const { spoolId } = parsed.data;
  const doc = await db.collection("spools").doc(spoolId).get();

  if (!doc.exists) {
    throw new HttpsError("not-found", "Bobina no encontrada");
  }

  const data = doc.data()!;
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate().toISOString(),
    updatedAt: data.updatedAt?.toDate().toISOString(),
    lastWeighInAt: data.lastWeighInAt?.toDate().toISOString() ?? null,
  };
});

export const spoolsGetWeighIns = onCall({ region, secrets }, async (request) => {
  assertOwner(request);

  const parsed = SpoolIdInput.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", parsed.error.message);
  }

  const { spoolId } = parsed.data;
  const snapshot = await db
    .collection("spools")
    .doc(spoolId)
    .collection("weighIns")
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate().toISOString(),
  }));
});

export const spoolsAddWeighIn = onCall({ region, secrets }, async (request) => {
  assertOwner(request);

  const parsed = WeighInInput.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", parsed.error.message);
  }

  const { spoolId, weightG, note } = parsed.data;
  const ownerUid = getOwnerUid();

  const spoolRef = db.collection("spools").doc(spoolId);
  const spoolDoc = await spoolRef.get();

  if (!spoolDoc.exists) {
    throw new HttpsError("not-found", "Bobina no encontrada");
  }

  const spoolData = spoolDoc.data()!;
  const now = Timestamp.now();

  // Crear registro de pesada
  const weighInRef = spoolRef.collection("weighIns").doc();
  await weighInRef.set({
    weightG,
    createdAt: now,
    createdBy: ownerUid,
    note: note ?? null,
  });

  // Calcular restante
  const remainingG = Math.max(0, weightG - spoolData.tareG);
  const remainingPct =
    spoolData.netInitialG > 0 ? remainingG / spoolData.netInitialG : 0;

  // Derivar status
  const newStatus = deriveStatus(
    remainingG,
    spoolData.thresholdG,
    spoolData.status
  );

  // Actualizar spool con datos denormalizados
  await spoolRef.update({
    lastWeighInAt: now,
    lastWeightG: weightG,
    remainingG,
    remainingPct,
    status: newStatus,
    updatedAt: now,
  });

  return {
    weighInId: weighInRef.id,
    remainingG,
    remainingPct,
    status: newStatus,
  };
});

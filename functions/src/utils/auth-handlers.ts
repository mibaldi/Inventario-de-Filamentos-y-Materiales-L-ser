import { onCall, HttpsError } from "firebase-functions/v2/https";
import { ownerUidSecret } from "./auth.js";

/**
 * Verifica si el usuario autenticado es el owner.
 * Devuelve { isOwner: true } si es el owner, { isOwner: false } si no lo es.
 */
export const authCheckOwner = onCall({ region: "europe-west1", secrets: [ownerUidSecret] }, async (request) => {
  const OWNER_UID = ownerUidSecret.value();
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesion");
  }

  if (!OWNER_UID) {
    throw new HttpsError(
      "failed-precondition",
      "OWNER_UID no configurado en el servidor"
    );
  }

  return {
    isOwner: request.auth.uid === OWNER_UID,
    uid: request.auth.uid,
  };
});

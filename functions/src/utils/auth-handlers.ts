import { onCall, HttpsError } from "firebase-functions/v2/https";

const OWNER_UID = process.env.OWNER_UID;

/**
 * Verifica si el usuario autenticado es el owner.
 * Devuelve { isOwner: true } si es el owner, { isOwner: false } si no lo es.
 */
export const authCheckOwner = onCall({ region: "europe-west1" }, async (request) => {
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

import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

export const ownerUidSecret = defineSecret("OWNER_UID");

export function assertOwner(request: CallableRequest): void {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesion");
  }

  const OWNER_UID = ownerUidSecret.value();
  if (!OWNER_UID) {
    throw new HttpsError(
      "failed-precondition",
      "OWNER_UID no configurado en el servidor"
    );
  }

  if (request.auth.uid !== OWNER_UID) {
    throw new HttpsError(
      "permission-denied",
      "No tienes permisos para realizar esta accion"
    );
  }
}

export function getOwnerUid(): string {
  const OWNER_UID = ownerUidSecret.value();
  if (!OWNER_UID) {
    throw new HttpsError(
      "failed-precondition",
      "OWNER_UID no configurado en el servidor"
    );
  }
  return OWNER_UID;
}

import { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";
import { ownerUidSecret } from "./auth.js";

export interface AuthenticatedRequest extends Request {
  uid?: string;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token de autenticación requerido" });
    return;
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    req.uid = decodedToken.uid;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

export function ownerMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const OWNER_UID = ownerUidSecret.value();

  if (!OWNER_UID) {
    res.status(500).json({ error: "OWNER_UID no configurado en el servidor" });
    return;
  }

  if (req.uid !== OWNER_UID) {
    res.status(403).json({ error: "No tienes permisos para realizar esta acción" });
    return;
  }

  next();
}

export function getOwnerUid(): string {
  const OWNER_UID = ownerUidSecret.value();
  if (!OWNER_UID) {
    throw new Error("OWNER_UID no configurado en el servidor");
  }
  return OWNER_UID;
}

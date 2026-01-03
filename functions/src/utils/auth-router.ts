import { Router, Response } from "express";
import { AuthenticatedRequest } from "./express-auth.js";
import { ownerUidSecret } from "./auth.js";

const router = Router();

// GET /api/auth/check-owner - Verificar si el usuario es el owner
router.get("/check-owner", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const OWNER_UID = ownerUidSecret.value();

    if (!OWNER_UID) {
      res.status(500).json({ error: "OWNER_UID no configurado en el servidor" });
      return;
    }

    res.json({
      isOwner: req.uid === OWNER_UID,
      uid: req.uid,
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;

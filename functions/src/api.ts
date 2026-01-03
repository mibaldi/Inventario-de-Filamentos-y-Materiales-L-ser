import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";
import { initializeApp, getApps } from "firebase-admin/app";
import { authMiddleware, ownerMiddleware } from "./utils/express-auth.js";
import { ownerUidSecret } from "./utils/auth.js";

// Routers
import spoolsRouter from "./spools/router.js";
import spoolsAiRouter from "./spools/ai-router.js";
import laserRouter from "./laser/router.js";
import laserAiRouter from "./laser/ai-router.js";
import settingsRouter from "./settings/router.js";
import authRouter from "./utils/auth-router.js";

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp();
}

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" }));

// Auth middleware for all routes
app.use(authMiddleware);

// Auth routes (solo requiere autenticación, no ser owner)
app.use("/auth", authRouter);

// Owner middleware for protected routes
app.use(ownerMiddleware);

// Protected routes
app.use("/spools", spoolsRouter);
app.use("/spools", spoolsAiRouter);
app.use("/laser", laserRouter);
app.use("/laser", laserAiRouter);
app.use("/settings", settingsRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Export the Express app as a Firebase Function
export const api = onRequest(
  {
    region: "europe-west1",
    secrets: [ownerUidSecret],
  },
  app
);

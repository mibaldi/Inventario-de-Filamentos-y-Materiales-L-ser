import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";
import type { Spool, WeighIn } from "@/types/spool";
import type { LaserMaterial, Movement } from "@/types/laser";

// Auth functions
export const authCheckOwner = httpsCallable<void, { isOwner: boolean; uid: string }>(
  functions,
  "authCheckOwner"
);

// Spools - Read
export const spoolsList = httpsCallable<void, Spool[]>(functions, "spoolsList");
export const spoolsGet = httpsCallable<{ spoolId: string }, Spool>(functions, "spoolsGet");
export const spoolsGetWeighIns = httpsCallable<{ spoolId: string }, WeighIn[]>(
  functions,
  "spoolsGetWeighIns"
);

// Spools - Write
export const spoolsCreate = httpsCallable(functions, "spoolsCreate");
export const spoolsUpdate = httpsCallable(functions, "spoolsUpdate");
export const spoolsArchive = httpsCallable(functions, "spoolsArchive");
export const spoolsDelete = httpsCallable(functions, "spoolsDelete");
export const spoolsAddWeighIn = httpsCallable(functions, "spoolsAddWeighIn");

// Laser - Read
export const laserList = httpsCallable<void, LaserMaterial[]>(functions, "laserList");
export const laserGet = httpsCallable<{ materialId: string }, LaserMaterial>(functions, "laserGet");
export const laserGetMovements = httpsCallable<{ materialId: string }, Movement[]>(
  functions,
  "laserGetMovements"
);

// Laser - Write
export const laserCreate = httpsCallable(functions, "laserCreate");
export const laserUpdate = httpsCallable(functions, "laserUpdate");
export const laserAdjustStock = httpsCallable(functions, "laserAdjustStock");
export const laserDelete = httpsCallable(functions, "laserDelete");

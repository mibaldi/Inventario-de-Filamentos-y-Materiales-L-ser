"use client";

import { initializeApp, getApps, type FirebaseApp, setLogLevel } from "firebase/app";
import { getAuth as firebaseGetAuth, type Auth } from "firebase/auth";
import { getFirestore as firebaseGetFirestore, type Firestore } from "firebase/firestore";
import { getFunctions as firebaseGetFunctions, type Functions } from "firebase/functions";
import { getStorage as firebaseGetStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let functions: Functions;
let storage: FirebaseStorage;

if (typeof window !== "undefined") {
  setLogLevel("debug");
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = firebaseGetAuth(app);
  db = firebaseGetFirestore(app);
  functions = firebaseGetFunctions(app, "europe-west1");
  storage = firebaseGetStorage(app);
}

export { auth, db, functions, storage };
export default app!;

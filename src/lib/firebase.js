// src/lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚠️ Analytics solo funciona en navegadores seguros (https) y con measurementId.
// Lo cargamos de forma segura para no romper en dev/SSR.
let analytics = null;
async function tryInitAnalytics(app) {
  try {
    // Evita cargar analytics en entornos no navegador
    if (typeof window === "undefined") return null;
    // Requiere https u origen localhost
    const isSecure =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost";
    if (!isSecure) return null;

    const { getAnalytics, isSupported } = await import("firebase/analytics");
    if (await isSupported()) {
      analytics = getAnalytics(app);
      return analytics;
    }
  } catch {
    // Silencioso: si falla analytics, la app sigue funcionando
  }
  return null;
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, // <- appspot.com
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // opcional
};

// Evita doble inicialización en HMR
export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Inicializa Analytics de forma segura (no bloqueante)
tryInitAnalytics(app);
export { analytics }; // puede ser null

// Sesión anónima para poder escribir en Firestore sin UI de login
export const ensureAnonAuth = () =>
  new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(
      auth,
      (u) => {
        if (u) {
          unsub();
          resolve(u);
        } else {
          signInAnonymously(auth)
            .then(({ user }) => {
              unsub();
              resolve(user);
            })
            .catch(reject);
        }
      },
      reject
    );
  });

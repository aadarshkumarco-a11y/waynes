// Firebase initialization + auth helpers
// Uses the user-provided Firebase project config.

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCMVXmsPZh_l3RgToFepzgodmnGpZAe-1A",
  authDomain: "courses-295cc.firebaseapp.com",
  projectId: "courses-295cc",
  storageBucket: "courses-295cc.firebasestorage.app",
  messagingSenderId: "364880624693",
  appId: "1:364880624693:web:344b55fc25ce42addf057c",
  measurementId: "G-SJG6R3H9JY",
};

// Initialize once (guards against HMR double-init in dev)
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ---------------------------------------------------------------------------
// Auth helpers — return { ok, message, user? }
// ---------------------------------------------------------------------------

export interface AuthResult {
  ok: boolean;
  message: string;
  user?: { id: string; email: string; name: string; avatar?: string };
}

function toAppUser(u: FirebaseUser): AuthResult["user"] {
  return {
    id: u.uid,
    email: u.email || "",
    name: u.displayName || u.email?.split("@")[0] || "Student",
    avatar: u.photoURL || undefined,
  };
}

export async function firebaseSignup(
  name: string,
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }
    return { ok: true, message: "Account created", user: toAppUser(cred.user) };
  } catch (e: any) {
    return { ok: false, message: friendlyAuthError(e) };
  }
}

export async function firebaseLogin(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { ok: true, message: "Logged in", user: toAppUser(cred.user) };
  } catch (e: any) {
    return { ok: false, message: friendlyAuthError(e) };
  }
}

export async function firebaseLoginWithGoogle(): Promise<AuthResult> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    return { ok: true, message: "Logged in with Google", user: toAppUser(cred.user) };
  } catch (e: any) {
    return { ok: false, message: friendlyAuthError(e) };
  }
}

export async function firebaseLogout(): Promise<void> {
  try {
    await signOut(auth);
  } catch {
    // ignore
  }
}

export function onFirebaseAuthChange(cb: (user: AuthResult["user"] | null) => void) {
  return onAuthStateChanged(auth, (u) => {
    cb(u ? toAppUser(u) : null);
  });
}

// Translate Firebase error codes to friendly messages
function friendlyAuthError(e: any): string {
  const code = e?.code || "";
  const map: Record<string, string> = {
    "auth/invalid-email": "Invalid email address.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/popup-closed-by-user": "Sign-in popup was closed.",
    "auth/popup-blocked": "Popup blocked by browser. Allow popups and retry.",
    "auth/operation-not-allowed": "This sign-in method is not enabled in Firebase.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
  };
  return map[code] || e?.message || "Authentication failed.";
}

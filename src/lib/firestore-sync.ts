// =============================================================================
// Firestore real-time sync module — SINGLE SOURCE OF TRUTH
// =============================================================================
// Courses, payment settings, and notifications come ONLY from Firestore.
// The Zustand store is a read-cache populated by these listeners.
// No localStorage merge — Firestore REPLACES local course data entirely.
// =============================================================================

import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useLms } from "@/lib/store";
import type { Course, PaymentSettings, Notification } from "@/lib/types";

let coursesUnsub: Unsubscribe | null = null;
let paymentUnsub: Unsubscribe | null = null;
let notifUnsub: Unsubscribe | null = null;
let started = false;

/**
 * Start listening to Firestore for real-time updates.
 * Call once after Firebase auth is ready (or immediately for public data).
 */
export function startFirestoreSync(userId: string | null) {
  // Always tear down previous listeners
  stopFirestoreSync();

  console.log("[firestore-sync] starting sync, userId:", userId || "anonymous");

  // 1. Courses collection — REPLACE local courses entirely with Firestore data
  try {
    coursesUnsub = onSnapshot(
      collection(db, "courses"),
      (snap) => {
        const firestoreCourses: Course[] = [];
        snap.forEach((d) => {
          const data = d.data() as Course;
          if (data) {
            firestoreCourses.push({ ...data, id: d.id });
          }
        });
        console.log("[firestore-sync] courses read SUCCESS:", firestoreCourses.length, "courses from Firestore");
        // REPLACE — not merge. Firestore is the single source of truth.
        useLms.setState({ customCourses: firestoreCourses });
      },
      (err) => {
        console.error("[firestore-sync] courses read FAILED:", err.code, err.message);
        // On error, show empty (not stale localStorage data)
        useLms.setState({ customCourses: [] });
      }
    );
  } catch (e: any) {
    console.error("[firestore-sync] courses listen setup failed:", e.message);
  }

  // 2. Payment settings doc
  try {
    paymentUnsub = onSnapshot(
      doc(db, "config", "paymentSettings"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<PaymentSettings>;
          console.log("[firestore-sync] payment settings read SUCCESS");
          useLms.getState().setPaymentSettings(data);
        } else {
          console.log("[firestore-sync] payment settings doc does not exist yet");
        }
      },
      (err) => {
        console.error("[firestore-sync] payment settings read FAILED:", err.code, err.message);
      }
    );
  } catch (e: any) {
    console.error("[firestore-sync] payment listen setup failed:", e.message);
  }

  // 3. User notifications (only if logged in)
  if (userId) {
    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId)
      );
      notifUnsub = onSnapshot(
        q,
        (snap) => {
          const fsNotifs: Notification[] = [];
          snap.forEach((d) => {
            const data = d.data() as Notification;
            if (data) {
              fsNotifs.push({
                ...data,
                id: d.id,
                createdAt: data.createdAt || new Date().toISOString(),
              } as Notification);
            }
          });
          console.log("[firestore-sync] notifications read SUCCESS:", fsNotifs.length, "for user", userId);
          // Merge: add new Firestore notifications that aren't already in store
          const existing = useLms.getState().notifications;
          const existingIds = new Set(existing.map((n) => n.id));
          const newOnes = fsNotifs.filter((n) => !existingIds.has(n.id));
          if (newOnes.length > 0) {
            useLms.setState({
              notifications: [...newOnes, ...existing],
            });
          }
        },
        (err) => {
          console.error("[firestore-sync] notifications read FAILED:", err.code, err.message);
        }
      );
    } catch (e: any) {
      console.error("[firestore-sync] notifications listen setup failed:", e.message);
    }
  }

  started = true;
  console.log("[firestore-sync] sync started successfully");
}

export function stopFirestoreSync() {
  if (coursesUnsub) { coursesUnsub(); coursesUnsub = null; }
  if (paymentUnsub) { paymentUnsub(); paymentUnsub = null; }
  if (notifUnsub) { notifUnsub(); notifUnsub = null; }
  started = false;
  console.log("[firestore-sync] sync stopped");
}

export function isSyncRunning() {
  return started;
}

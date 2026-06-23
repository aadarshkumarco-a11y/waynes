// Firestore real-time sync module.
// Listens for changes to courses, payment settings, and user notifications
// from Firestore, merging them into the Zustand store.
// Admin panel (admin.html) writes to Firestore; this module picks up changes.

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
 * Call once after Firebase auth is ready.
 */
export function startFirestoreSync(userId: string | null) {
  // Always tear down previous listeners
  stopFirestoreSync();

  // 1. Courses collection — admin-added courses appear instantly
  try {
    coursesUnsub = onSnapshot(
      collection(db, "courses"),
      (snap) => {
        const firestoreCourses: Course[] = [];
        snap.forEach((d) => {
          const data = d.data() as Course;
          if (data && data.id) {
            firestoreCourses.push({ ...data, id: d.id });
          }
        });
        // Merge: keep local custom courses that aren't in Firestore,
        // plus all Firestore courses
        const localCustoms = useLms.getState().customCourses;
        const firestoreIds = new Set(firestoreCourses.map((c) => c.id));
        const localOnly = localCustoms.filter((c) => !firestoreIds.has(c.id));
        useLms.setState({ customCourses: [...firestoreCourses, ...localOnly] });
      },
      (err) => {
        // Silently fail — Firestore rules might not be set up yet
        console.warn("[firestore-sync] courses listener error:", err.message);
      }
    );
  } catch (e) {
    console.warn("[firestore-sync] courses listen failed:", e);
  }

  // 2. Payment settings doc
  try {
    paymentUnsub = onSnapshot(
      doc(db, "config", "paymentSettings"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<PaymentSettings>;
          useLms.getState().setPaymentSettings(data);
        }
      },
      (err) => {
        console.warn("[firestore-sync] payment listener error:", err.message);
      }
    );
  } catch (e) {
    console.warn("[firestore-sync] payment listen failed:", e);
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
          // Merge Firestore notifications into store (avoid duplicates by id)
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
          console.warn("[firestore-sync] notifications listener error:", err.message);
        }
      );
    } catch (e) {
      console.warn("[firestore-sync] notifications listen failed:", e);
    }
  }

  started = true;
}

export function stopFirestoreSync() {
  if (coursesUnsub) { coursesUnsub(); coursesUnsub = null; }
  if (paymentUnsub) { paymentUnsub(); paymentUnsub = null; }
  if (notifUnsub) { notifUnsub(); notifUnsub = null; }
  started = false;
}

export function isSyncRunning() {
  return started;
}

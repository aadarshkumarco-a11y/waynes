"use client";

import { useEffect, type ReactNode } from "react";
import { onFirebaseAuthChange } from "@/lib/firebase";
import { startFirestoreSync, stopFirestoreSync } from "@/lib/firestore-sync";
import { useLms } from "@/lib/store";

/**
 * Listens to Firebase auth state changes and syncs the authenticated user
 * into the Zustand store. Also starts/stops Firestore real-time sync
 * for courses, payment settings, and notifications.
 */
export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const unsub = onFirebaseAuthChange((fbUser) => {
      const store = useLms.getState();
      if (fbUser) {
        // Firebase user signed in — set in store
        const current = store.user;
        if (!current || current.id !== fbUser.id) {
          useLms.setState({
            user: {
              id: fbUser.id,
              email: fbUser.email,
              name: fbUser.name,
              avatar: fbUser.avatar,
              role: "STUDENT",
              title: "Learner",
              provider: "email",
              emailVerified: true,
            },
          });
        }
        // Start Firestore real-time sync (courses + payment + notifications)
        startFirestoreSync(fbUser.id);
      } else {
        // Signed out of Firebase — clear store (unless demo admin)
        if (store.user && store.user.id !== "user-admin" && store.user.id !== "user-demo") {
          useLms.setState({ user: null });
        }
        // Still sync courses + payment (public data) but not user notifications
        startFirestoreSync(null);
      }
    });
    return () => {
      unsub();
      stopFirestoreSync();
    };
  }, []);

  return <>{children}</>;
}

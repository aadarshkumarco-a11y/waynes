"use client";

import { useEffect, type ReactNode } from "react";
import { onFirebaseAuthChange, firebaseLogout } from "@/lib/firebase";
import { useLms } from "@/lib/store";

/**
 * Listens to Firebase auth state changes and syncs the authenticated user
 * into the Zustand store. Mounted once at the app root.
 */
export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const unsub = onFirebaseAuthChange((fbUser) => {
      const store = useLms.getState();
      if (fbUser) {
        // Firebase user signed in — set in store (merge with any existing)
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
      } else {
        // Signed out of Firebase — clear from store (unless it was a demo admin
        // session, which is local-only and shouldn't be cleared by Firebase)
        if (store.user && store.user.id !== "user-admin" && store.user.id !== "user-demo") {
          useLms.setState({ user: null });
        }
      }
    });
    return () => unsub();
  }, []);

  return <>{children}</>;
}

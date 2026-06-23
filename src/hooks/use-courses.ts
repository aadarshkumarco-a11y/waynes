"use client";

import { useMemo } from "react";
import { useLms } from "@/lib/store";
import type { Course } from "@/lib/types";

// =============================================================================
// COURSE LOADING — FIRESTORE IS THE SINGLE SOURCE OF TRUTH
// =============================================================================
// Courses come ONLY from Firestore via the firestore-sync real-time listener.
// No hardcoded catalog, no localStorage merge. If Firestore is empty, we show
// "No Courses Available Yet".
// =============================================================================

// Returns courses from Firestore (synced into store via onSnapshot listener).
// Unpublished courses are filtered out.
export function useCourses() {
  const customCourses = useLms((s) => s.customCourses);
  return useMemo(
    () => customCourses.filter((c) => c.published !== false),
    [customCourses]
  );
}

// Look up a single course by slug from Firestore data.
export function useCourseBySlug(slug: string | null): Course | undefined {
  const customCourses = useLms((s) => s.customCourses);
  return useMemo(() => {
    if (!slug) return undefined;
    return customCourses.find((c) => c.slug === slug);
  }, [slug, customCourses]);
}

// Look up a single course by ID from Firestore data.
export function useCourseById(id: string | null): Course | undefined {
  const customCourses = useLms((s) => s.customCourses);
  return useMemo(() => {
    if (!id) return undefined;
    return customCourses.find((c) => c.id === id);
  }, [id, customCourses]);
}

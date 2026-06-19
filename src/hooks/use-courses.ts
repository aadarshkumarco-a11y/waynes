"use client";

import { useMemo } from "react";
import { useLms } from "@/lib/store";
import { courses as catalogCourses, courseBySlug } from "@/lib/data/catalog";
import type { Course } from "@/lib/types";

// Returns the full course list with admin overrides (price/featured/published)
// applied. Unpublished courses (published === false via override) are filtered
// out so the storefront hides them.
export function useCourses() {
  const overrides = useLms((s) => s.courseOverrides);
  return useMemo(
    () =>
      catalogCourses
        .map((c) => ({ ...c, ...(overrides[c.id] || {}) }))
        .filter((c) => c.published !== false),
    [overrides]
  );
}

// Look up a single course by slug with overrides applied.
export function useCourseBySlug(slug: string | null): Course | undefined {
  const overrides = useLms((s) => s.courseOverrides);
  return useMemo(() => {
    if (!slug) return undefined;
    const base = courseBySlug[slug];
    if (!base) return undefined;
    return { ...base, ...(overrides[base.id] || {}) };
  }, [slug, overrides]);
}

export { catalogCourses };

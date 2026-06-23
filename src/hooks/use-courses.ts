"use client";

import { useMemo } from "react";
import { useLms } from "@/lib/store";
import { courses as catalogCourses, courseBySlug } from "@/lib/data/catalog";
import type { Course } from "@/lib/types";

// Returns the full course list: catalog courses (with admin overrides applied)
// + admin-added custom courses. Unpublished courses are filtered out.
export function useCourses() {
  const overrides = useLms((s) => s.courseOverrides);
  const customCourses = useLms((s) => s.customCourses);
  return useMemo(
    () => {
      const overridden = catalogCourses
        .map((c) => ({ ...c, ...(overrides[c.id] || {}) }))
        .filter((c) => c.published !== false);
      const customs = customCourses.filter((c) => c.published !== false);
      return [...customs, ...overridden];
    },
    [overrides, customCourses]
  );
}

// Look up a single course by slug: checks custom courses first, then catalog.
export function useCourseBySlug(slug: string | null): Course | undefined {
  const overrides = useLms((s) => s.courseOverrides);
  const customCourses = useLms((s) => s.customCourses);
  return useMemo(() => {
    if (!slug) return undefined;
    // Check custom courses first
    const custom = customCourses.find((c) => c.slug === slug);
    if (custom) return custom;
    // Then catalog with overrides
    const base = courseBySlug[slug];
    if (!base) return undefined;
    return { ...base, ...(overrides[base.id] || {}) };
  }, [slug, overrides, customCourses]);
}

export { catalogCourses };

"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/lms/course-card";
import { AnimatedReveal } from "@/components/lms/animated-reveal";
import { useLms } from "@/lib/store";
import { courses, categories } from "@/lib/data/catalog";
import { cn } from "@/lib/utils";

type Filter = "all" | string;

export function CourseShowcase() {
  const navigate = useLms((s) => s.navigate);
  const [filter, setFilter] = useState<Filter>("all");

  const featured = useMemo(() => courses.filter((c) => c.featured), []);

  const filtered = useMemo(() => {
    if (filter === "all") return featured;
    return courses.filter((c) => c.featured && c.categoryId === filter);
  }, [filter, featured]);

  // Build category pill list — only those with featured courses
  const pills = useMemo(() => {
    const featuredCats = new Set(featured.map((c) => c.categoryId));
    return categories.filter((c) => featuredCats.has(c.id));
  }, [featured]);

  return (
    <section className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedReveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge
              variant="outline"
              className="mb-3 gap-1.5 rounded-full border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300"
            >
              <Sparkles className="size-3.5" />
              Featured
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Most loved courses
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              Hand-picked, world-class courses that have transformed thousands of careers.
            </p>
          </div>
          <Button
            variant="ghost"
            className="group -ml-2 h-auto justify-start p-2 text-sm font-medium sm:ml-0 sm:justify-end"
            onClick={() => navigate("catalog")}
          >
            View all courses
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </AnimatedReveal>

        {/* Category pills */}
        <AnimatedReveal
          delay={100}
          className="mt-8 flex flex-wrap items-center gap-2"
        >
          <Pill active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </Pill>
          {pills.map((cat) => (
            <Pill
              key={cat.id}
              active={filter === cat.id}
              onClick={() => setFilter(cat.id)}
            >
              {cat.name}
            </Pill>
          ))}
        </AnimatedReveal>

        {/* Grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((course, i) => (
            <AnimatedReveal key={course.id} delay={i * 80} className="h-full">
              <CourseCard course={course} />
            </AnimatedReveal>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">
            No featured courses in this category yet. Try another filter.
          </div>
        )}
      </div>
    </section>
  );
}

function Pill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
        active
          ? "border-emerald-500 bg-emerald-500 text-primary-foreground shadow-glow"
          : "border-border bg-card/50 text-muted-foreground hover:border-emerald-500/40 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

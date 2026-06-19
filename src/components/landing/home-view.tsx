"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  BarChart3,
  Palette,
  BrainCircuit,
  Megaphone,
  Briefcase,
  Zap,
  ArrowRight,
  Users,
  Globe,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Star,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseCard } from "@/components/lms/course-card";
import { StarRating } from "@/components/lms/star-rating";
import { AnimatedReveal } from "@/components/lms/animated-reveal";
import { useLms } from "@/lib/store";
import { useCourses } from "@/hooks/use-courses";
import { categories, instructorMap, platformStats } from "@/lib/data/catalog";
import { formatPrice, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/types";

// ---------------------------------------------------------------------------
// Category icon mapping (catalog stores icon as a lucide name string)
// ---------------------------------------------------------------------------
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Code2,
  BarChart3,
  Palette,
  BrainCircuit,
  Megaphone,
  Briefcase,
};

// ---------------------------------------------------------------------------
// Sort options
// ---------------------------------------------------------------------------
type SortKey = "popular" | "newest" | "price-asc" | "price-desc" | "rating";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

function sortCourses(list: Course[], sort: SortKey): Course[] {
  const out = [...list];
  switch (sort) {
    case "newest":
      return out.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "price-asc":
      return out.sort((a, b) => a.price - b.price);
    case "price-desc":
      return out.sort((a, b) => b.price - a.price);
    case "rating":
      return out.sort((a, b) => b.rating - a.rating);
    case "popular":
    default:
      return out.sort((a, b) => b.studentCount - a.studentCount);
  }
}

function discountPct(c: Course): number {
  if (!c.comparePrice || c.comparePrice <= c.price) return 0;
  return Math.round(((c.comparePrice - c.price) / c.comparePrice) * 100);
}

function levelLabel(level: Course["level"]): string {
  return level.charAt(0) + level.slice(1).toLowerCase();
}

// ---------------------------------------------------------------------------
// Promo slides (auto-rotating)
// ---------------------------------------------------------------------------
const PROMO_SLIDES = [
  {
    eyebrow: "Skill up. Level up.",
    title: "Learn from industry leaders, ship real projects.",
    sub: "Hands-on courses in dev, design, data & AI — built for builders, not browsers.",
    badge: "Up to 60% off",
  },
  {
    eyebrow: "New season drop",
    title: "Fresh courses on LLMs, RAG & agentic systems.",
    sub: "Stay ahead with the tools shaping the next decade of software.",
    badge: "New arrivals",
  },
  {
    eyebrow: "Career boost",
    title: "Crack your next role with interview-ready tracks.",
    sub: "System design, ML & product — taught by ex-FAANG engineers.",
    badge: "Best for interviews",
  },
];

// ---------------------------------------------------------------------------
// Compact horizontal product card (Flash Deals / Bestsellers rows)
// ---------------------------------------------------------------------------
function ProductRowCard({ course }: { course: Course }) {
  const openCourse = useLms((s) => s.openCourse);
  const addToCart = useLms((s) => s.addToCart);
  const isInCart = useLms((s) => s.isInCart);
  const inCart = isInCart(course.id);
  const pct = discountPct(course);
  const instructor = instructorMap[course.instructorId];

  return (
    <div className="group relative w-[260px] shrink-0 overflow-hidden rounded-xl border border-border/60 bg-card shadow-premium transition-shadow hover:shadow-glow sm:w-[300px]">
      <button
        type="button"
        onClick={() => openCourse(course.slug)}
        className="relative block w-full"
        aria-label={`View ${course.title}`}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          {pct > 0 && (
            <Badge className="absolute left-2 top-2 gap-1 bg-rose-500/95 text-white hover:bg-rose-500">
              <Tag className="size-3" />-{pct}%
            </Badge>
          )}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white/90">
            <span className="rounded-full bg-black/45 px-2 py-0.5 backdrop-blur">
              {levelLabel(course.level)}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 backdrop-blur">
              <Users className="size-3" />
              {formatNumber(course.studentCount)}
            </span>
          </div>
        </div>
      </button>

      <div className="flex flex-col gap-1.5 p-3">
        <button
          type="button"
          onClick={() => openCourse(course.slug)}
          className="text-left text-sm font-semibold leading-snug tracking-tight line-clamp-2 transition-colors hover:text-primary"
        >
          {course.title}
        </button>
        {instructor && (
          <span className="line-clamp-1 text-xs text-muted-foreground">{instructor.name}</span>
        )}
        <StarRating rating={course.rating} size={12} showValue count={course.reviewCount} />
        <div className="mt-1 flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight">
              {formatPrice(course.price, course.currency)}
            </span>
            {course.comparePrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(course.comparePrice, course.currency)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant={inCart ? "secondary" : "default"}
            disabled={inCart}
            onClick={(e) => {
              e.stopPropagation();
              if (!inCart) addToCart(course.id);
            }}
            aria-label={inCart ? `In cart: ${course.title}` : `Add ${course.title} to cart`}
          >
            {inCart ? "In Cart" : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// HomeView — eCommerce storefront
// =========================================================================
export function HomeView() {
  const courses = useCourses();
  const navigate = useLms((s) => s.navigate);
  const openCourse = useLms((s) => s.openCourse);

  const [activeCat, setActiveCat] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("popular");
  const [slide, setSlide] = useState(0);

  // Auto-rotate promo slides
  useEffect(() => {
    const t = setInterval(() => {
      setSlide((s) => (s + 1) % PROMO_SLIDES.length);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  // Derived product collections
  const flashDeals = useMemo(
    () =>
      courses
        .filter((c) => discountPct(c) > 0)
        .sort((a, b) => discountPct(b) - discountPct(a))
        .slice(0, 6),
    [courses]
  );

  const bestsellers = useMemo(
    () => [...courses].sort((a, b) => b.studentCount - a.studentCount).slice(0, 6),
    [courses]
  );

  const maxDiscount = useMemo(
    () => Math.max(0, ...courses.map(discountPct)),
    [courses]
  );

  const liveCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of courses) map[c.categoryId] = (map[c.categoryId] ?? 0) + 1;
    return map;
  }, [courses]);

  const filtered = useMemo(() => {
    const list =
      activeCat === "all" ? courses : courses.filter((c) => c.categoryId === activeCat);
    return sortCourses(list, sort);
  }, [courses, activeCat, sort]);

  const shopAll = () => navigate("catalog");
  const goDeals = () => {
    if (typeof document !== "undefined") {
      document
        .getElementById("flash-deals")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  const browseCategory = (catId: string) => {
    setActiveCat(catId);
    if (typeof document !== "undefined") {
      document
        .getElementById("all-courses")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const heroThumbs = flashDeals.length >= 2 ? flashDeals : bestsellers;
  const heroBadgePct = Math.max(60, maxDiscount);

  return (
    <div id="home" className="flex flex-col gap-10 pb-16 md:gap-14">
      {/* ----------------------------------------------------------------- */}
      {/* 1. PROMO HERO BANNER (slim, conversion-focused)                   */}
      {/* ----------------------------------------------------------------- */}
      <section
        aria-label="Featured promotions"
        className="relative mx-3 mt-3 overflow-hidden rounded-3xl gradient-brand shadow-glow sm:mx-4 md:mx-6 lg:mx-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" aria-hidden />
        <div
          className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-white/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-28 -left-16 size-72 rounded-full bg-emerald-300/25 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-6 px-5 py-7 sm:px-8 sm:py-9 md:flex-row md:items-center md:justify-between md:px-12 md:py-11">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="flex flex-col gap-3"
              >
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
                  <Sparkles className="size-3.5" />
                  {PROMO_SLIDES[slide].eyebrow}
                </span>
                <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
                  {PROMO_SLIDES[slide].title}
                </h1>
                <p className="max-w-xl text-sm text-white/85 sm:text-base">
                  {PROMO_SLIDES[slide].sub}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={shopAll}
                className="bg-white text-emerald-700 hover:bg-white/90"
              >
                <ShoppingBag className="size-4" />
                Shop All Courses
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={goDeals}
                className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Zap className="size-4" />
                Today&apos;s Deals
              </Button>
              <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-400">
                Up to {heroBadgePct}% off
              </Badge>
            </div>

            {/* slide dots */}
            <div
              className="mt-5 flex items-center gap-1.5"
              role="tablist"
              aria-label="Promo slides"
            >
              {PROMO_SLIDES.map((s, i) => (
                <button
                  key={s.eyebrow}
                  type="button"
                  role="tab"
                  aria-selected={i === slide}
                  aria-label={`Show promo ${i + 1}: ${s.eyebrow}`}
                  onClick={() => setSlide(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === slide ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Floating product thumbnails */}
          <div className="relative hidden shrink-0 md:block" aria-hidden>
            <div className="grid grid-cols-2 gap-3">
              {heroThumbs.slice(0, 2).map((c, i) => {
                const pct = discountPct(c);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => openCourse(c.slug)}
                    className={cn(
                      "group/card relative w-44 overflow-hidden rounded-xl bg-white/10 p-2 text-left backdrop-blur transition-transform hover:-translate-y-1",
                      i === 1 && "translate-y-4"
                    )}
                  >
                    <div className="relative aspect-video overflow-hidden rounded-lg">
                      <img
                        src={c.thumbnail}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      {pct > 0 && (
                        <span className="absolute left-1 top-1 rounded-md bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          -{pct}%
                        </span>
                      )}
                    </div>
                    <div className="mt-2 px-1">
                      <p className="line-clamp-1 text-xs font-semibold text-white">{c.title}</p>
                      <p className="text-xs font-bold text-white">
                        {formatPrice(c.price, c.currency)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 2. TRUST STRIP                                                    */}
      {/* ----------------------------------------------------------------- */}
      <section
        aria-label="Why learners choose Waynes"
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <ul className="flex flex-wrap items-center divide-x divide-border/60 rounded-xl border border-border/60 bg-card/60 px-2 py-3 text-sm shadow-premium">
          {[
            {
              icon: Star,
              value: platformStats.rating.toFixed(1),
              label: "Average rating",
            },
            {
              icon: Users,
              value: `${formatNumber(platformStats.students)}+`,
              label: "Active learners",
            },
            {
              icon: Globe,
              value: `${platformStats.countries}`,
              label: "Countries served",
            },
            {
              icon: ShieldCheck,
              value: "7-day",
              label: "Money-back guarantee",
            },
          ].map(({ icon: Icon, value, label }) => (
            <li
              key={label}
              className="flex min-w-[140px] flex-1 items-center justify-center gap-2 px-3 py-1"
            >
              <Icon className="size-4 shrink-0 text-primary" aria-hidden />
              <span className="flex items-baseline gap-1.5">
                <span className="font-semibold tabular-nums">{value}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 3. CATEGORY BAR                                                   */}
      {/* ----------------------------------------------------------------- */}
      <section
        aria-label="Browse by category"
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
          <CategoryPill
            active={activeCat === "all"}
            onClick={() => setActiveCat("all")}
            label="All"
            count={courses.length}
          />
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.icon] ?? Sparkles;
            return (
              <CategoryPill
                key={cat.id}
                active={activeCat === cat.id}
                onClick={() => setActiveCat(cat.id)}
                label={cat.name}
                count={liveCounts[cat.id] ?? cat.courseCount}
                icon={<Icon className="size-4" aria-hidden />}
              />
            );
          })}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 4. FLASH DEALS                                                    */}
      {/* ----------------------------------------------------------------- */}
      {flashDeals.length > 0 && (
        <section
          id="flash-deals"
          aria-label="Flash deals"
          className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <SectionHeader
            icon={<Zap className="size-5 text-amber-400" aria-hidden />}
            title="Flash Deals"
            subtitle="Limited-time discounts on top courses"
            onAction={shopAll}
          />
          <AnimatedReveal>
            <div className="no-scrollbar -mx-1 flex items-stretch gap-4 overflow-x-auto px-1 pb-3">
              {flashDeals.map((c) => (
                <ProductRowCard key={c.id} course={c} />
              ))}
            </div>
          </AnimatedReveal>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 5. MAIN PRODUCT GRID                                              */}
      {/* ----------------------------------------------------------------- */}
      <section
        id="all-courses"
        aria-label="All courses"
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">All Courses</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "course" : "courses"}
              {activeCat !== "all" && (
                <>
                  {" "}
                  in{" "}
                  <span className="font-medium text-foreground">
                    {categories.find((c) => c.id === activeCat)?.name ?? "category"}
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs text-muted-foreground">
              Sort by
            </label>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger id="sort-select" size="sm" className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((c, i) => (
              <AnimatedReveal key={c.id} delay={(i % 4) * 60}>
                <CourseCard course={c} />
              </AnimatedReveal>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-card/40 py-16 text-center">
            <p className="text-base font-medium">No courses in this category yet.</p>
            <p className="text-sm text-muted-foreground">Try another category or browse all.</p>
            <Button size="sm" variant="outline" onClick={shopAll} className="mt-1">
              Browse all courses
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 6. BESTSELLERS                                                    */}
      {/* ----------------------------------------------------------------- */}
      {bestsellers.length > 0 && (
        <section
          aria-label="Bestsellers"
          className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <SectionHeader
            icon={<span aria-hidden>🔥</span>}
            title="Bestsellers"
            subtitle="Most enrolled courses this month"
            onAction={shopAll}
          />
          <AnimatedReveal>
            <div className="no-scrollbar -mx-1 flex items-stretch gap-4 overflow-x-auto px-1 pb-3">
              {bestsellers.map((c) => (
                <ProductRowCard key={c.id} course={c} />
              ))}
            </div>
          </AnimatedReveal>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 7. CATEGORIES GRID                                                */}
      {/* ----------------------------------------------------------------- */}
      <section
        aria-label="Shop by category"
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Shop by Category</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {categories.length} categories · {courses.length} courses
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.icon] ?? Sparkles;
            const count = liveCounts[cat.id] ?? cat.courseCount;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => browseCategory(cat.id)}
                className="group relative flex flex-col items-start gap-3 overflow-hidden rounded-xl border border-border/60 bg-card p-4 text-left shadow-premium transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
                aria-label={`Browse ${cat.name} courses`}
              >
                <div className="flex size-10 items-center justify-center rounded-lg gradient-brand-soft text-primary">
                  <Icon className="size-5" aria-hidden />
                </div>
                <div className="flex flex-col">
                  <span className="line-clamp-2 text-sm font-semibold tracking-tight">
                    {cat.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {count} {count === 1 ? "course" : "courses"}
                  </span>
                </div>
                <ChevronRight className="absolute right-3 top-3 size-4 text-muted-foreground/50 transition-all group-hover:right-2 group-hover:text-primary" />
              </button>
            );
          })}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 8. SLIM CTA BAND                                                  */}
      {/* ----------------------------------------------------------------- */}
      <section
        aria-label="Start learning"
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="relative overflow-hidden rounded-2xl gradient-brand px-6 py-7 shadow-glow sm:px-10 sm:py-8">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" aria-hidden />
          <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Ready to start learning?
              </h2>
              <p className="mt-1 text-sm text-white/85">
                Browse {courses.length} expert-led courses and join {formatNumber(platformStats.students)}+ learners worldwide.
              </p>
            </div>
            <Button
              size="lg"
              onClick={shopAll}
              className="bg-white text-emerald-700 hover:bg-white/90"
            >
              <ShoppingBag className="size-4" />
              Browse Courses
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function CategoryPill({
  active,
  onClick,
  label,
  count,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
        active
          ? "gradient-brand border-transparent text-white shadow-glow"
          : "border-border/70 bg-card text-foreground hover:border-primary/40 hover:bg-accent"
      )}
    >
      {icon}
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
          active ? "bg-white/25 text-white" : "bg-muted text-muted-foreground"
        )}
      >
        {count}
      </span>
    </button>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div className="flex items-center gap-2.5">
        {icon}
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  );
}

export default HomeView;

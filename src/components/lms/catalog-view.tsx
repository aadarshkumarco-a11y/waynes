"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  BarChart3,
  Palette,
  BrainCircuit,
  Megaphone,
  Briefcase,
  SlidersHorizontal,
  SearchX,
  X,
  RotateCcw,
  Star,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CourseCard } from "@/components/lms/course-card";
import { AnimatedReveal } from "@/components/lms/animated-reveal";
import { useLms } from "@/lib/store";
import {
  categories,
} from "@/lib/data/catalog";
import { useCourses } from "@/hooks/use-courses";
import { formatPrice } from "@/lib/format";
import type { CourseLevel } from "@/lib/types";

// ---------------------------------------------------------------------------
// Category icon mapping (catalog stores icon as a lucide name string)
// ---------------------------------------------------------------------------
const ICONS: Record<string, LucideIcon> = {
  Code2,
  BarChart3,
  Palette,
  BrainCircuit,
  Megaphone,
  Briefcase,
};

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Code2;
  return <Icon className={className} />;
}

// ---------------------------------------------------------------------------
// Sort options
// ---------------------------------------------------------------------------
type SortKey = "popular" | "newest" | "price-asc" | "price-desc" | "rating";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

const LEVELS: { value: CourseLevel; label: string }[] = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

const PRICE_MIN = 0;
const PRICE_MAX = 10000;

// ---------------------------------------------------------------------------
// Filter panel (shared between desktop sidebar + mobile sheet)
// ---------------------------------------------------------------------------
interface FilterState {
  categories: Set<string>;
  levels: Set<CourseLevel>;
  price: [number, number];
  sort: SortKey;
}

function initialFilters(): FilterState {
  return {
    categories: new Set(),
    levels: new Set(),
    price: [PRICE_MIN, PRICE_MAX],
    sort: "popular",
  };
}

function FilterPanelBody({
  state,
  setState,
  onReset,
}: {
  state: FilterState;
  setState: (next: FilterState) => void;
  onReset: () => void;
}) {
  const toggleCategory = (id: string) => {
    const next = new Set(state.categories);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setState({ ...state, categories: next });
  };
  const toggleLevel = (lvl: CourseLevel) => {
    const next = new Set(state.levels);
    if (next.has(lvl)) next.delete(lvl);
    else next.add(lvl);
    setState({ ...state, levels: next });
  };

  return (
    <div className="flex flex-col gap-7">
      {/* Categories */}
      <div>
        <h4 className="mb-3 text-sm font-semibold tracking-tight">Categories</h4>
        <div className="flex flex-col gap-2.5">
          {categories.map((cat) => {
            const checked = state.categories.has(cat.id);
            return (
              <div
                key={cat.id}
                className="group flex items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-accent/50"
              >
                <Checkbox
                  id={`cat-${cat.id}`}
                  checked={checked}
                  onCheckedChange={() => toggleCategory(cat.id)}
                />
                <Label
                  htmlFor={`cat-${cat.id}`}
                  className="flex flex-1 cursor-pointer items-center gap-2 text-sm font-medium"
                >
                  <span className="grid size-7 place-items-center rounded-md bg-primary/10 text-primary">
                    <CategoryIcon name={cat.icon} className="size-3.5" />
                  </span>
                  <span className="flex-1">{cat.name}</span>
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-medium">
                    {cat.courseCount}
                  </Badge>
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Level */}
      <div>
        <h4 className="mb-3 text-sm font-semibold tracking-tight">Level</h4>
        <div className="flex flex-col gap-2.5">
          {LEVELS.map((lvl) => {
            const checked = state.levels.has(lvl.value);
            return (
              <div
                key={lvl.value}
                className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-accent/50"
              >
                <Checkbox
                  id={`lvl-${lvl.value}`}
                  checked={checked}
                  onCheckedChange={() => toggleLevel(lvl.value)}
                />
                <Label htmlFor={`lvl-${lvl.value}`} className="cursor-pointer text-sm font-medium">
                  {lvl.label}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Price range */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold tracking-tight">Price Range</h4>
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatPrice(state.price[0])} – {formatPrice(state.price[1])}
          </span>
        </div>
        <Slider
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={500}
          value={state.price}
          onValueChange={(v) => setState({ ...state, price: [v[0] ?? 0, v[1] ?? PRICE_MAX] as [number, number] })}
          className="mt-4"
        />
        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
          <span>{formatPrice(PRICE_MIN)}</span>
          <span>{formatPrice(PRICE_MAX)}</span>
        </div>
      </div>

      <Separator />

      {/* Reset */}
      <Button variant="outline" size="sm" onClick={onReset} className="w-full">
        <RotateCcw className="size-3.5" />
        Reset Filters
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton card grid (loading state)
// ---------------------------------------------------------------------------
function CatalogSkeletons() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden p-0">
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <div className="flex items-center gap-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex items-end justify-between border-t pt-3">
              <div className="flex flex-col gap-1">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyState({ onReset, hasSearch, onClearSearch }: { onReset: () => void; hasSearch: boolean; onClearSearch: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 px-6 py-20 text-center"
    >
      <div className="grid size-16 place-items-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="size-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No courses found</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        We couldn&apos;t find any courses matching your filters. Try adjusting your search or resetting the filters.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Button onClick={onReset} variant="default" size="sm">
          <RotateCcw className="size-3.5" />
          Reset Filters
        </Button>
        {hasSearch && (
          <Button onClick={onClearSearch} variant="outline" size="sm">
            <X className="size-3.5" />
            Clear Search
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------
export function CatalogView() {
  const courses = useCourses();
  const searchQuery = useLms((s) => s.searchQuery);
  const setSearchQuery = useLms((s) => s.setSearchQuery);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Brief loading skeleton on first mount (~400ms)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const activeFilterCount =
    filters.categories.size + filters.levels.size + (filters.price[0] !== PRICE_MIN || filters.price[1] !== PRICE_MAX ? 1 : 0);

  // Filter + sort pipeline
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = courses.filter((c) => {
      // Search across title, subtitle, tags
      if (q) {
        const haystack = `${c.title} ${c.subtitle} ${c.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      // Category
      if (filters.categories.size > 0 && !filters.categories.has(c.categoryId)) return false;
      // Level
      if (filters.levels.size > 0 && !filters.levels.has(c.level)) return false;
      // Price
      if (c.price < filters.price[0] || c.price > filters.price[1]) return false;
      return true;
    });

    list = [...list];
    switch (filters.sort) {
      case "newest":
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
      default:
        list.sort((a, b) => b.studentCount - a.studentCount);
        break;
    }
    return list;
  }, [searchQuery, filters, courses]);

  const resetFilters = () => setFilters(initialFilters());
  const clearSearch = () => setSearchQuery("");

  return (
    <div className="relative min-h-screen bg-background">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-primary/3 to-transparent" />
        <div className="absolute inset-0 bg-dots opacity-50" />
      </div>

      {/* Page header */}
      <header className="mx-auto w-full max-w-7xl px-4 pb-8 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <AnimatedReveal>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary">
                <BrainCircuit className="size-3.5" />
                Catalog
              </Badge>
              <span className="text-xs text-muted-foreground">
                {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "course" : "courses"} found`}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
              Explore <span className="text-gradient-brand">Courses</span>
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Browse our complete library of premium, expert-led courses. Filter by category, level, and price to find the perfect next step in your learning journey.
            </p>

            {/* Active search chip */}
            {searchQuery.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center gap-2"
              >
                <span className="text-xs text-muted-foreground">Showing results for:</span>
                <Badge variant="outline" className="gap-1.5 py-1 pl-2 pr-1">
                  <SearchX className="size-3" />
                  <span className="font-medium">&ldquo;{searchQuery}&rdquo;</span>
                  <button
                    onClick={clearSearch}
                    className="ml-1 grid size-4 place-items-center rounded-full bg-muted hover:bg-foreground/10"
                    aria-label="Clear search"
                  >
                    <X className="size-2.5" />
                  </button>
                </Badge>
              </motion.div>
            )}
          </div>
        </AnimatedReveal>
      </header>

      {/* Layout: sidebar + grid */}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-24 sm:px-6 lg:flex-row lg:px-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">
            <Card className="glass shadow-premium p-5">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold">Filters</h3>
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="size-5 justify-center p-0 text-[10px]">
                      {activeFilterCount}
                    </Badge>
                  )}
                </div>
              </div>
              <FilterPanelBody state={filters} setState={setFilters} onReset={resetFilters} />
            </Card>
          </div>
        </aside>

        {/* Mobile filter trigger */}
        <div className="lg:hidden">
          <div className="sticky top-[68px] z-20 -mx-4 mb-2 flex items-center gap-2 border-b bg-background/80 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="size-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="default" className="ml-1 size-5 justify-center p-0 text-[10px]">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-full flex-col gap-0 p-0 sm:max-w-sm">
                <SheetHeader className="border-b px-5 py-4">
                  <SheetTitle className="flex items-center gap-2">
                    <SlidersHorizontal className="size-4 text-primary" />
                    Filters
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex-1">
                  <div className="p-5">
                    <FilterPanelBody
                      state={filters}
                      setState={setFilters}
                      onReset={() => {
                        resetFilters();
                        setMobileOpen(false);
                      }}
                    />
                  </div>
                </ScrollArea>
                <div className="border-t p-4">
                  <SheetClose asChild>
                    <Button className="w-full">Show {filtered.length} results</Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort select (mobile) */}
            <Select
              value={filters.sort}
              onValueChange={(v) => setFilters({ ...filters, sort: v as SortKey })}
            >
              <SelectTrigger size="sm" className="ml-auto w-[170px]">
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

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {/* Desktop sort + count */}
          <div className="mb-5 hidden items-center justify-between lg:flex">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "course" : "courses"}
            </p>
            <div className="flex items-center gap-2">
              <Label htmlFor="sort-desktop" className="text-xs text-muted-foreground">
                Sort by
              </Label>
              <Select
                value={filters.sort}
                onValueChange={(v) => setFilters({ ...filters, sort: v as SortKey })}
              >
                <SelectTrigger id="sort-desktop" size="sm" className="w-[180px]">
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

          {/* Grid or states */}
          {loading ? (
            <CatalogSkeletons />
          ) : filtered.length === 0 ? (
            <EmptyState onReset={resetFilters} hasSearch={!!searchQuery.trim()} onClearSearch={clearSearch} />
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.map((course, i) => (
                <AnimatedReveal key={course.id} delay={Math.min(i * 60, 360)} y={20}>
                  <CourseCard course={course} className="h-full" />
                </AnimatedReveal>
              ))}
            </motion.div>
          )}

          {/* Footer reassurance */}
          {!loading && filtered.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl border bg-card/50 px-6 py-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                4.8 average rating
              </span>
              <span>·</span>
              <span>30-day money-back guarantee</span>
              <span>·</span>
              <span>Lifetime access on every course</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CatalogView;

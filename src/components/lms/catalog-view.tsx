"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bug,
  Cpu,
  Globe,
  Network,
  RotateCcw,
  Search,
  SearchX,
  Skull,
  SlidersHorizontal,
  Swords,
  Terminal,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CourseCard } from "@/components/lms/course-card";
import { AnimatedReveal } from "@/components/lms/animated-reveal";
import { useLms } from "@/lib/store";
import { categories } from "@/lib/data/catalog";
import { useCourses } from "@/hooks/use-courses";
import { formatPrice } from "@/lib/format";
import type { CourseLevel } from "@/lib/types";

// ---------------------------------------------------------------------------
// Category icon mapping — cyberpunk hacking domains
// ---------------------------------------------------------------------------
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Globe,
  Network,
  Bug,
  Cpu,
  Swords,
  Search,
};

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = CATEGORY_ICONS[name] ?? Terminal;
  return <Icon className={className} />;
}

// ---------------------------------------------------------------------------
// Sort + level options
// ---------------------------------------------------------------------------
type SortKey = "popular" | "newest" | "price-asc" | "price-desc" | "rating";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
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
// Filter state
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

// ---------------------------------------------------------------------------
// Filter panel body (shared desktop + mobile)
// ---------------------------------------------------------------------------
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
    <div className="flex flex-col gap-6 font-mono">
      {/* Header strip */}
      <div className="flex items-center gap-2 border-b border-primary/20 pb-3 text-xs uppercase tracking-widest text-primary">
        <Terminal className="size-3.5" />
        <span>filter_module</span>
      </div>

      {/* Categories */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {"// category"}
        </h4>
        <div className="flex flex-col gap-1">
          {categories.map((cat) => {
            const checked = state.categories.has(cat.id);
            return (
              <div
                key={cat.id}
                className="group flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-primary/5"
              >
                <Checkbox
                  id={`cat-${cat.id}`}
                  checked={checked}
                  onCheckedChange={() => toggleCategory(cat.id)}
                  className="border-primary/40 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <Label
                  htmlFor={`cat-${cat.id}`}
                  className="flex flex-1 cursor-pointer items-center gap-2 text-sm"
                >
                  <span className="grid size-7 place-items-center rounded-md border border-primary/20 bg-primary/5 text-primary">
                    <CategoryIcon name={cat.icon} className="size-3.5" />
                  </span>
                  <span className="flex-1">{cat.name}</span>
                  <Badge
                    variant="outline"
                    className="border-primary/30 px-1.5 py-0 font-mono text-[10px] text-primary/80"
                  >
                    {cat.courseCount}
                  </Badge>
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      <Separator className="bg-primary/15" />

      {/* Level */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {"// skill_level"}
        </h4>
        <div className="flex flex-col gap-1">
          {LEVELS.map((lvl) => {
            const checked = state.levels.has(lvl.value);
            return (
              <div
                key={lvl.value}
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-primary/5"
              >
                <Checkbox
                  id={`lvl-${lvl.value}`}
                  checked={checked}
                  onCheckedChange={() => toggleLevel(lvl.value)}
                  className="border-primary/40 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <Label htmlFor={`lvl-${lvl.value}`} className="cursor-pointer text-sm">
                  {lvl.label}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      <Separator className="bg-primary/15" />

      {/* Price range */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {"// price_range"}
          </h4>
          <span className="font-mono text-xs tabular-nums text-primary">
            {formatPrice(state.price[0])} – {formatPrice(state.price[1])}
          </span>
        </div>
        <Slider
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={500}
          value={state.price}
          onValueChange={(v) =>
            setState({ ...state, price: [v[0] ?? 0, v[1] ?? PRICE_MAX] as [number, number] })
          }
          className="mt-3"
        />
        <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
          <span>{formatPrice(PRICE_MIN)}</span>
          <span>{formatPrice(PRICE_MAX)}</span>
        </div>
      </div>

      <Separator className="bg-primary/15" />

      {/* Reset */}
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="w-full justify-start border-primary/30 font-mono text-xs uppercase tracking-widest text-primary hover:bg-primary/10 hover:text-primary"
      >
        <RotateCcw className="size-3.5" />
        &gt; reset_filters
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton loading state
// ---------------------------------------------------------------------------
function CatalogSkeletons() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="terminal-window overflow-hidden p-0">
          <Skeleton className="aspect-video w-full rounded-none bg-primary/5" />
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24 bg-primary/10" />
              <Skeleton className="h-3 w-16 bg-primary/5" />
            </div>
            <Skeleton className="h-5 w-4/5 bg-primary/10" />
            <Skeleton className="h-3 w-full bg-primary/5" />
            <Skeleton className="h-3 w-2/3 bg-primary/5" />
            <div className="flex items-end justify-between border-t border-primary/10 pt-3">
              <Skeleton className="h-5 w-16 bg-primary/10" />
              <Skeleton className="h-8 w-24 rounded-md bg-primary/10" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state — terminal style
// ---------------------------------------------------------------------------
function EmptyState({
  onReset,
  hasSearch,
  onClearSearch,
}: {
  onReset: () => void;
  hasSearch: boolean;
  onClearSearch: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="terminal-window mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center"
    >
      <div className="mb-4 flex size-16 items-center justify-center rounded-full border border-primary/30 bg-primary/5 text-primary glow-green">
        <SearchX className="size-7" />
      </div>
      <p className="font-mono text-xs uppercase tracking-widest text-primary">
        $ scan complete
      </p>
      <h3 className="mt-2 text-xl font-bold tracking-tight text-glow-green">
        $ no_results found
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        No targets match the current filter criteria. Adjust your query or
        reset the filters to expand the search perimeter.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button
          onClick={onReset}
          variant="default"
          size="sm"
          className="glow-green gap-2 font-mono uppercase tracking-widest"
        >
          <RotateCcw className="size-3.5" />
          &gt; reset_filters
        </Button>
        {hasSearch && (
          <Button
            onClick={onClearSearch}
            variant="outline"
            size="sm"
            className="border-primary/30 font-mono uppercase tracking-widest text-primary"
          >
            <X className="size-3.5" />
            clear_query
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
    filters.categories.size +
    filters.levels.size +
    (filters.price[0] !== PRICE_MIN || filters.price[1] !== PRICE_MAX ? 1 : 0);

  // Filter + sort pipeline
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = courses.filter((c) => {
      if (q) {
        const haystack = `${c.title} ${c.subtitle} ${c.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.categories.size > 0 && !filters.categories.has(c.categoryId)) return false;
      if (filters.levels.size > 0 && !filters.levels.has(c.level)) return false;
      if (c.price < filters.price[0] || c.price > filters.price[1]) return false;
      return true;
    });

    const sorted = [...list];
    switch (filters.sort) {
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
      default:
        sorted.sort((a, b) => b.studentCount - a.studentCount);
        break;
    }
    return sorted;
  }, [searchQuery, filters, courses]);

  const resetFilters = () => setFilters(initialFilters());
  const clearSearch = () => setSearchQuery("");

  return (
    <div className="relative min-h-screen bg-background">
      {/* Decorative background — grid + glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px] overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute left-1/4 top-0 size-72 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-1/4 top-10 size-72 translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
      </div>

      {/* Page header */}
      <header className="mx-auto w-full max-w-7xl px-4 pb-8 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <AnimatedReveal>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="outline"
                className="gap-1.5 border-primary/40 bg-primary/5 font-mono text-xs uppercase tracking-widest text-primary"
              >
                <Skull className="size-3.5" />
                waynes // catalog
              </Badge>
              <span className="font-mono text-xs text-muted-foreground">
                {loading ? (
                  <span className="cursor-blink">scanning database</span>
                ) : (
                  <>
                    <span className="text-primary">{filtered.length}</span> /{" "}
                    {courses.length} targets indexed
                  </>
                )}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
              <span className="text-primary text-glow-green">&gt;</span>{" "}
              <span className="text-gradient-brand">COURSE_CATALOG</span>
              <span className="cursor-blink" />
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Select your target. Execute your skills. Every course is a payload
              designed to escalate your access in the world of ethical hacking.
            </p>

            {/* Terminal-style search */}
            <div className="relative w-full max-w-2xl">
              <div className="terminal-window flex items-center gap-2 px-3 py-2.5">
                <span className="font-mono text-sm text-primary">&gt;</span>
                <Search className="size-4 text-primary/70" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="grep -r 'exploit' ./catalog ..."
                  aria-label="Search courses"
                  className="w-full bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    aria-label="Clear search"
                    className="grid size-5 place-items-center rounded text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Active search chip */}
            {searchQuery.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center gap-2"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  $ query:
                </span>
                <Badge
                  variant="outline"
                  className="gap-1.5 border-primary/40 py-1 pl-2 pr-1 font-mono text-xs text-primary"
                >
                  <Search className="size-3" />
                  <span className="font-medium">&ldquo;{searchQuery}&rdquo;</span>
                  <button
                    onClick={clearSearch}
                    className="ml-1 grid size-4 place-items-center rounded-full bg-muted hover:bg-primary/20"
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
            <Card className="terminal-window p-5">
              <div className="mb-5 flex items-center justify-between border-b border-primary/15 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-primary" />
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                    filters
                  </h3>
                </div>
                {activeFilterCount > 0 && (
                  <Badge className="size-5 justify-center bg-primary p-0 font-mono text-[10px] text-primary-foreground glow-green">
                    {activeFilterCount}
                  </Badge>
                )}
              </div>
              <FilterPanelBody state={filters} setState={setFilters} onReset={resetFilters} />
            </Card>
          </div>
        </aside>

        {/* Mobile filter trigger */}
        <div className="lg:hidden">
          <div className="sticky top-[68px] z-20 -mx-4 mb-2 flex items-center gap-2 border-b border-primary/15 bg-background/80 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-primary/30 font-mono text-xs uppercase tracking-widest text-primary"
                >
                  <SlidersHorizontal className="size-4" />
                  filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-1 size-5 justify-center bg-primary p-0 font-mono text-[10px] text-primary-foreground">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="terminal-window flex w-full flex-col gap-0 border-primary/20 p-0 sm:max-w-sm"
              >
                <SheetHeader className="border-b border-primary/15 px-5 py-4">
                  <SheetTitle className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-primary">
                    <Terminal className="size-4" />
                    filter_module
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex-1 scrollbar-thin">
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
                <div className="border-t border-primary/15 p-4">
                  <SheetClose asChild>
                    <Button className="glow-green w-full gap-2 font-mono text-xs uppercase tracking-widest">
                      <ArrowRight className="size-4" />
                      exec — {filtered.length} results
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort select (mobile) */}
            <Select
              value={filters.sort}
              onValueChange={(v) => setFilters({ ...filters, sort: v as SortKey })}
            >
              <SelectTrigger
                size="sm"
                className="ml-auto w-[170px] border-primary/30 font-mono text-xs"
              >
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
            <p className="font-mono text-xs text-muted-foreground">
              <span className="text-primary">$</span> ls -la /courses{" "}
              <span className="text-primary">→</span> {filtered.length}{" "}
              {filtered.length === 1 ? "target" : "targets"}
            </p>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="sort-desktop"
                className="font-mono text-xs uppercase tracking-widest text-muted-foreground"
              >
                sort:
              </Label>
              <Select
                value={filters.sort}
                onValueChange={(v) => setFilters({ ...filters, sort: v as SortKey })}
              >
                <SelectTrigger
                  id="sort-desktop"
                  size="sm"
                  className="w-[200px] border-primary/30 font-mono text-xs"
                >
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
            <EmptyState
              onReset={resetFilters}
              hasSearch={!!searchQuery.trim()}
              onClearSearch={clearSearch}
            />
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

          {/* Footer reassurance — terminal style */}
          {!loading && filtered.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-lg border border-primary/15 bg-card/50 px-6 py-4 font-mono text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="text-primary">●</span>
                secure_channel: encrypted
              </span>
              <span className="text-primary/40">|</span>
              <span>30-day refund policy</span>
              <span className="text-primary/40">|</span>
              <span>lifetime access granted</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CatalogView;

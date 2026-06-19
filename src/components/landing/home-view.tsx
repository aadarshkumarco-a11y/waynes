"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  PlayCircle,
  Star,
  Users,
  Globe,
  Network,
  Bug,
  Cpu,
  Swords,
  Search,
  Shield,
  ChevronRight,
  Terminal,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/lms/course-card";
import { StarRating } from "@/components/lms/star-rating";
import { AnimatedReveal } from "@/components/lms/animated-reveal";
import { useLms } from "@/lib/store";
import { useCourses } from "@/hooks/use-courses";
import { categories, platformStats, testimonials } from "@/lib/data/catalog";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Category icon mapping (catalog stores icon name as a string)
// ---------------------------------------------------------------------------
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Globe,
  Network,
  Bug,
  Cpu,
  Swords,
  Search,
};

// ---------------------------------------------------------------------------
// Typewriter — types out a terminal-style line, then fades in the headline
// ---------------------------------------------------------------------------
function Typewriter({
  text,
  speed = 45,
  onDone,
}: {
  text: string;
  speed?: number;
  onDone?: () => void;
}) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (count >= text.length) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(t);
  }, [count, text, speed, onDone]);

  return (
    <span className="font-mono text-xs text-primary/80 sm:text-sm">
      {text.slice(0, count)}
      <span className="cursor-blink text-primary" />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Section heading — terminal comment style
// ---------------------------------------------------------------------------
function SectionHeading({
  label,
  action,
}: {
  label: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-primary sm:text-base">
        <span className="text-muted-foreground/60">{"//"}</span> {label}
      </h2>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="group flex shrink-0 items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          {action.label}
          <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Floating badge chip
// ---------------------------------------------------------------------------
function FloatBadge({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={cn(
        "glass absolute flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[11px] text-primary shadow-glow",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

// =========================================================================
// HomeView — hacking/cyberpunk storefront (simple, terminal-vibe)
// =========================================================================
export function HomeView() {
  const courses = useCourses();
  const navigate = useLms((s) => s.navigate);
  const setAuthOpen = useLms((s) => s.setAuthOpen);

  const [booted, setBooted] = useState(false);

  const featured = useMemo(
    () => courses.filter((c) => c.featured).slice(0, 4),
    [courses]
  );

  const goCatalog = () => navigate("catalog");
  const goPricing = () => navigate("pricing");

  return (
    <div className="relative">
      {/* Ambient background blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-32 top-0 size-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-32 top-1/3 size-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:space-y-24">
        {/* ============================================================
            (a) HERO — terminal window
            ============================================================ */}
        <AnimatedReveal>
          <section
            aria-label="Hero"
            className="terminal-window scanlines relative overflow-hidden rounded-lg"
          >
            {/* Title bar */}
            <div className="relative z-10 flex items-center justify-between border-b border-primary/30 bg-background/80 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-destructive/80" />
                <span className="size-3 rounded-full bg-warning/80" />
                <span className="size-3 rounded-full bg-primary/90 glow-green" />
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                root@waynes: <span className="text-primary/80">~</span>
                <span className="text-muted-foreground/60">#</span> ./access.sh
              </span>
              <span className="font-mono text-xs text-muted-foreground/60">bash</span>
            </div>

            {/* Body */}
            <div className="bg-grid relative z-10 grid gap-6 p-6 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:p-14">
              {/* Left — copy */}
              <div className="relative">
                {/* Boot line */}
                <div className="mb-4 min-h-[1.25rem]">
                  {!booted ? (
                    <Typewriter
                      text="> initializing access..."
                      onDone={() => setBooted(true)}
                    />
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-mono text-xs text-primary/80 sm:text-sm"
                    >
                      {"> access granted. welcome, operator."}
                      <span className="cursor-blink text-primary" />
                    </motion.span>
                  )}
                </div>

                {/* Headline */}
                <AnimatePresence>
                  {booted && (
                    <motion.h1
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="glitch font-mono text-3xl font-black leading-[1.05] tracking-tight text-primary text-glow-green sm:text-5xl lg:text-6xl"
                    >
                      Hack the Planet.
                      <br />
                      <span className="text-gradient-brand">Legally.</span>
                    </motion.h1>
                  )}
                </AnimatePresence>

                <p className="mt-4 max-w-md font-mono text-sm text-muted-foreground sm:text-base">
                  Master ethical hacking from elite hackers. Real labs, real
                  CVEs, real careers.
                </p>

                {/* CTAs */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button
                    onClick={goCatalog}
                    className="gap-2 rounded-md font-mono text-xs uppercase tracking-wider glow-green sm:text-sm"
                  >
                    <Terminal className="size-4" /> Browse Courses
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAuthOpen(true, "signup")}
                    className="gap-2 rounded-md border-primary/40 font-mono text-xs uppercase tracking-wider text-primary hover:bg-primary/10 hover:text-primary sm:text-sm"
                  >
                    <PlayCircle className="size-4" /> Watch Demo
                  </Button>
                </div>

                {/* Fake terminal output */}
                <div className="mt-6 rounded-md border border-primary/20 bg-background/60 p-3 font-mono text-[11px] leading-relaxed sm:text-xs">
                  <div className="text-muted-foreground">
                    <span className="text-primary/70">$</span> nmap -sV waynes.io
                  </div>
                  <div className="text-cyan-400/80">
                    {"> "}{courses.length || platformStats.courses} courses found. All systems go.
                    <span className="cursor-blink text-primary" />
                  </div>
                </div>

                {/* Floating badges — desktop only, absolutely positioned */}
                <FloatBadge delay={0.6} className="-right-4 top-4 hidden lg:flex">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  {platformStats.rating} rating
                </FloatBadge>
                <FloatBadge delay={0.8} className="right-8 top-24 hidden lg:flex">
                  <Users className="size-3" />
                  {formatNumber(platformStats.students)}+ hackers
                </FloatBadge>
                <FloatBadge delay={1.0} className="-right-2 top-44 hidden lg:flex">
                  <Shield className="size-3" /> OSCP-ready
                </FloatBadge>
              </div>

              {/* Right — visual terminal stack (hidden on small) */}
              <div className="relative hidden lg:block">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="terminal-window relative overflow-hidden rounded-lg"
                >
                  <div className="flex items-center gap-2 border-b border-primary/20 px-3 py-2">
                    <span className="size-2.5 rounded-full bg-destructive/70" />
                    <span className="size-2.5 rounded-full bg-warning/70" />
                    <span className="size-2.5 rounded-full bg-primary/80" />
                    <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                      payload.sh
                    </span>
                  </div>
                  <pre className="overflow-hidden p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
                    <span className="text-primary/70">$</span> whoami{"\n"}
                    <span className="text-primary">anonymous_operator</span>{"\n\n"}
                    <span className="text-primary/70">$</span> ls /skills{"\n"}
                    <span className="text-cyan-400/80">recon/  exploit/  report/</span>{"\n\n"}
                    <span className="text-primary/70">$</span> ./learn --start{"\n"}
                    <span className="text-primary">{">"} booting labs...</span>{"\n"}
                    <span className="text-primary">{">"} 8 courses loaded</span>{"\n"}
                    <span className="text-primary">{">"} access: <span className="text-amber-400">GRANTED</span></span>
                    <span className="cursor-blink text-primary" />
                  </pre>
                </motion.div>
              </div>
            </div>
          </section>
        </AnimatedReveal>

        {/* ============================================================
            (b) TRUST STRIP
            ============================================================ */}
        <AnimatedReveal delay={50}>
          <section aria-label="Trust signals">
            <div className="glass flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-md px-4 py-3 sm:gap-x-12">
              <TrustItem
                icon={<Users className="size-3.5" />}
                value={formatNumber(platformStats.students)}
                label="hackers"
              />
              <TrustItem
                icon={<Terminal className="size-3.5" />}
                value={String(platformStats.courses)}
                label="courses"
              />
              <TrustItem
                icon={<Globe className="size-3.5" />}
                value={String(platformStats.countries)}
                label="countries"
              />
              <TrustItem
                icon={<Shield className="size-3.5" />}
                value="7-day"
                label="refund"
              />
            </div>
          </section>
        </AnimatedReveal>

        {/* ============================================================
            (c) CATEGORIES
            ============================================================ */}
        <AnimatedReveal>
          <section aria-label="Categories">
            <h2 className="mb-4 font-mono text-sm font-bold uppercase tracking-wider text-primary sm:text-base">
              <span className="text-muted-foreground/60">{">"}</span> select your path
            </h2>
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.icon] ?? Terminal;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={goCatalog}
                    className="group flex shrink-0 items-center gap-2 rounded-md border border-border/60 bg-card px-4 py-2.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary hover:glow-green"
                  >
                    <Icon className="size-4 text-primary/70 transition-transform group-hover:scale-110" />
                    <span className="uppercase tracking-wider">{cat.name}</span>
                    <span className="text-[10px] text-muted-foreground/60">
                      [{cat.courseCount}]
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </AnimatedReveal>

        {/* ============================================================
            (d) FEATURED COURSES
            ============================================================ */}
        {featured.length > 0 && (
          <AnimatedReveal>
            <section aria-label="Featured courses">
              <SectionHeading
                label="FEATURED EXPLOITS"
                action={{ label: "View all", onClick: goCatalog }}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((c, i) => (
                  <AnimatedReveal key={c.id} delay={i * 60} y={20}>
                    <CourseCard course={c} className="h-full" />
                  </AnimatedReveal>
                ))}
              </div>
            </section>
          </AnimatedReveal>
        )}

        {/* ============================================================
            (e) ALL COURSES
            ============================================================ */}
        <AnimatedReveal>
          <section aria-label="All courses" id="all-courses" className="scroll-mt-24">
            <SectionHeading label={`ALL COURSES · ${courses.length} results`} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c, i) => (
                <AnimatedReveal key={c.id} delay={Math.min(i, 6) * 40} y={20}>
                  <CourseCard course={c} className="h-full" />
                </AnimatedReveal>
              ))}
            </div>
          </section>
        </AnimatedReveal>

        {/* ============================================================
            (f) STATS BAND
            ============================================================ */}
        <AnimatedReveal>
          <section
            aria-label="Platform stats"
            className="bg-grid relative overflow-hidden rounded-lg border border-primary/20 bg-background/60"
          >
            <div className="grid grid-cols-2 divide-x divide-y divide-primary/15 sm:grid-cols-4 sm:divide-y-0">
              <StatCell
                value={formatNumber(platformStats.students)}
                label="HACKERS"
              />
              <StatCell
                value={String(platformStats.courses)}
                label="COURSES"
              />
              <StatCell
                value={`${platformStats.hoursOfContent}+`}
                label="HOURS"
              />
              <StatCell
                value={String(platformStats.countries)}
                label="COUNTRIES"
              />
            </div>
          </section>
        </AnimatedReveal>

        {/* ============================================================
            (g) TESTIMONIALS — FIELD REPORTS
            ============================================================ */}
        <AnimatedReveal>
          <section aria-label="Field reports">
            <SectionHeading label="FIELD REPORTS" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.slice(0, 3).map((t, i) => (
                <AnimatedReveal key={t.id} delay={i * 70} y={20}>
                  <figure className="glass flex h-full flex-col gap-3 rounded-md p-5">
                    <StarRating rating={t.rating} size={12} />
                    <blockquote className="flex-1 font-mono text-xs leading-relaxed text-foreground/90">
                      <span className="text-primary/60">{"> "}</span>
                      {t.quote}
                    </blockquote>
                    <figcaption className="flex items-center gap-2 border-t border-primary/15 pt-3">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="size-7 rounded-full border border-primary/40 object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-primary">
                          {t.name}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {t.role}
                        </span>
                      </div>
                    </figcaption>
                  </figure>
                </AnimatedReveal>
              ))}
            </div>
          </section>
        </AnimatedReveal>

        {/* ============================================================
            (h) FINAL CTA — terminal window
            ============================================================ */}
        <AnimatedReveal>
          <section
            aria-label="Get started"
            className="terminal-window scanlines relative overflow-hidden rounded-lg"
          >
            <div className="relative z-10 flex flex-col items-center gap-4 p-8 text-center sm:p-12">
              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-primary glow-green" />
                root@waynes: <span className="text-primary/80">~</span>
                <span className="text-muted-foreground/60">#</span> ./enroll
              </div>
              <h2 className="glitch font-mono text-2xl font-black tracking-tight text-primary text-glow-green sm:text-4xl">
                {">"} ready_to_start = True
              </h2>
              <p className="max-w-md font-mono text-xs text-muted-foreground sm:text-sm">
                Provision your access. Pick a path. Start hacking in under 60
                seconds.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  onClick={goCatalog}
                  className="gap-2 rounded-md font-mono text-xs uppercase tracking-wider glow-green sm:text-sm"
                >
                  <Sparkles className="size-4" /> Get Access
                </Button>
                <Button
                  variant="outline"
                  onClick={goPricing}
                  className="gap-2 rounded-md border-primary/40 font-mono text-xs uppercase tracking-wider text-primary hover:bg-primary/10 hover:text-primary sm:text-sm"
                >
                  View Pricing <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </section>
        </AnimatedReveal>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function TrustItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
      <span className="text-primary/70">{icon}</span>
      <span className="font-bold text-foreground">{value}</span>
      <span>{label}</span>
    </div>
  );
}

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-6 text-center sm:p-8">
      <span className="font-mono text-3xl font-black tracking-tight text-primary text-glow-green sm:text-5xl">
        {value}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export default HomeView;

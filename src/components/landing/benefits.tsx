"use client";

import { motion } from "framer-motion";
import {
  Check,
  PlayCircle,
  Download,
  Users2,
  RefreshCw,
  Award,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedReveal } from "@/components/lms/animated-reveal";
import { useLms } from "@/lib/store";

type Benefit = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const BENEFITS: Benefit[] = [
  {
    icon: RefreshCw,
    title: "Lifetime access & free updates",
    description: "Enroll once and own the course forever — including every future update.",
  },
  {
    icon: Award,
    title: "Verifiable completion certificates",
    description: "Get a unique verification ID and downloadable PDF on finishing any course.",
  },
  {
    icon: Download,
    title: "Downloadable resources",
    description: "Source code, cheat sheets, templates, swipe files — all yours to keep.",
  },
  {
    icon: Users2,
    title: "Private community access",
    description: "Join 95K+ learners, get feedback, find mentors, and grow together.",
  },
];

export function Benefits() {
  const navigate = useLms((s) => s.navigate);

  return (
    <section className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column — copy + benefits */}
          <AnimatedReveal className="min-w-0">
            <Badge
              variant="outline"
              className="mb-3 gap-1.5 rounded-full border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300"
            >
              What you get
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to{" "}
              <span className="text-gradient-brand">truly learn</span>
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Not just videos. A complete learning system designed to take you from
              beginner to job-ready professional — with the tools, community, and
              credentials to back it up.
            </p>

            <ul className="mt-8 space-y-4">
              {BENEFITS.map((b, i) => {
                const Icon = b.icon;
                return (
                  <AnimatedReveal key={b.title} delay={i * 80} y={12}>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                        <Check className="size-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Icon className="size-4 text-muted-foreground" />
                          <p className="font-semibold">{b.title}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {b.description}
                        </p>
                      </div>
                    </li>
                  </AnimatedReveal>
                );
              })}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="group h-12 rounded-xl px-6"
                onClick={() => navigate("catalog")}
              >
                Start learning
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-xl px-6"
                onClick={() => navigate("pricing")}
              >
                View pricing
              </Button>
            </div>
          </AnimatedReveal>

          {/* Right column — mock player / dashboard */}
          <AnimatedReveal delay={150} y={24} className="min-w-0">
            <MockPlayer />
          </AnimatedReveal>
        </div>
      </div>
    </section>
  );
}

function MockPlayer() {
  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute -inset-3 -z-10 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-teal-400/10 to-violet-500/10 blur-2xl" />

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative overflow-hidden rounded-2xl border bg-card/80 shadow-premium backdrop-blur"
      >
        {/* Player header */}
        <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="size-3 rounded-full bg-rose-400/80" />
            <div className="size-3 rounded-full bg-amber-400/80" />
            <div className="size-3 rounded-full bg-emerald-400/80" />
          </div>
          <p className="ml-2 min-w-0 truncate text-xs font-medium text-muted-foreground">
            learniverse.io/learn/fullstack-nextjs-mastery/lesson/3
          </p>
        </div>

        {/* Video area */}
        <div className="relative aspect-video bg-gradient-to-br from-emerald-900/40 via-slate-900 to-slate-950">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-white/90 text-primary shadow-glow">
              <PlayCircle className="size-8" />
            </div>
            <p className="text-sm font-medium text-white/90">
              Server Components Deep Dive
            </p>
            <p className="text-xs text-white/60">Lesson 3 · 28 min</p>
          </div>

          {/* Progress bar */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
            <div className="h-full w-2/3 bg-gradient-to-r from-emerald-400 to-teal-300" />
          </div>
        </div>

        {/* Body — lesson list / progress */}
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          {/* Progress card */}
          <div className="rounded-xl border bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your progress
              </p>
              <span className="text-xs font-bold text-emerald-500">62%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">12 of 19 lessons done</p>
          </div>

          {/* Certificate preview */}
          <div className="rounded-xl border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <Award className="size-4 text-amber-500" />
              <p className="text-xs font-semibold">Certificate ready</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Finish 7 more lessons to unlock your verifiable certificate.
            </p>
          </div>
        </div>

        {/* Up next list */}
        <div className="border-t bg-muted/20 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Up next
          </p>
          <div className="space-y-2">
            {[
              { title: "Fetching & Caching Data", dur: "36m", done: false },
              { title: "Streaming & Suspense", dur: "24m", done: false },
              { title: "Cheat Sheet: Data Fetching", dur: "5m", done: false },
            ].map((l) => (
              <div
                key={l.title}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60"
              >
                <PlayCircle className="size-4 shrink-0 text-emerald-500" />
                <p className="flex-1 truncate text-xs font-medium">{l.title}</p>
                <span className="text-xs text-muted-foreground">{l.dur}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Floating mini badge */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute -bottom-4 -right-3 sm:-right-5"
      >
        <div className="glass flex items-center gap-2 rounded-xl px-3 py-2 shadow-premium">
          <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500">
            <Award className="size-4" />
          </div>
          <div>
            <p className="text-xs font-bold leading-none">Certified</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">on completion</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

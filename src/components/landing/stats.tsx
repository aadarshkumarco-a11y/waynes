"use client";

import { useEffect, useRef, useState } from "react";
import {
  Users,
  BookOpen,
  Clock,
  Globe,
  Star,
  TrendingUp,
} from "lucide-react";
import { platformStats } from "@/lib/data/catalog";
import { AnimatedReveal } from "@/components/lms/animated-reveal";
import { cn } from "@/lib/utils";

type Stat = {
  icon: typeof Users;
  label: string;
  value: number;
  display: (v: number) => string;
  suffix?: string;
  accent: string;
};

const STATS: Stat[] = [
  {
    icon: Users,
    label: "Active Learners",
    value: platformStats.students,
    display: (v) => v.toLocaleString("en-IN"),
    suffix: "+",
    accent: "from-emerald-500/20 to-emerald-500/5 text-emerald-500",
  },
  {
    icon: BookOpen,
    label: "Premium Courses",
    value: platformStats.courses,
    display: (v) => v.toString(),
    accent: "from-teal-500/20 to-teal-500/5 text-teal-500",
  },
  {
    icon: Clock,
    label: "Hours of Content",
    value: platformStats.hoursOfContent,
    display: (v) => v.toLocaleString("en-IN"),
    suffix: "+",
    accent: "from-amber-500/20 to-amber-500/5 text-amber-500",
  },
  {
    icon: Globe,
    label: "Countries",
    value: platformStats.countries,
    display: (v) => v.toString(),
    accent: "from-violet-500/20 to-violet-500/5 text-violet-400",
  },
  {
    icon: Star,
    label: "Avg. Rating",
    value: platformStats.rating,
    display: (v) => v.toFixed(1),
    accent: "from-rose-500/20 to-rose-500/5 text-rose-400",
  },
  {
    icon: TrendingUp,
    label: "Completion Rate",
    value: platformStats.completionRate,
    display: (v) => v.toString(),
    suffix: "%",
    accent: "from-emerald-500/20 to-teal-500/5 text-emerald-500",
  },
];

function useCountUp(target: number, run: boolean, duration = 1600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return value;
}

export function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="relative py-16 sm:py-20" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedReveal className="mb-10 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Trusted worldwide
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            The numbers behind the platform
          </h2>
        </AnimatedReveal>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-6">
          {STATS.map((stat, i) => (
            <AnimatedReveal key={stat.label} delay={i * 80}>
              <StatCard stat={stat} run={inView} />
            </AnimatedReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, run }: { stat: Stat; run: boolean }) {
  const Icon = stat.icon;
  const value = useCountUp(stat.value, run);
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border bg-card/60 p-5 shadow-premium backdrop-blur transition-all hover:-translate-y-1 hover:shadow-glow">
      <div
        className={cn(
          "mb-3 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br",
          stat.accent
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
        {stat.display(value)}
        {stat.suffix}
      </div>
      <div className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
        {stat.label}
      </div>
      {/* hover line */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 scale-x-0 bg-gradient-to-r from-emerald-500 to-teal-400 transition-transform duration-500 group-hover:scale-x-100" />
    </div>
  );
}

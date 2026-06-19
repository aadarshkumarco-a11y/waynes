"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, ShieldCheck, Infinity as InfinityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedReveal } from "@/components/lms/animated-reveal";
import { useLms } from "@/lib/store";
import { cn } from "@/lib/utils";

type Plan = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  period?: string;
  cta: string;
  ctaAction: () => void;
  features: string[];
  highlighted?: boolean;
  badge?: string;
};

export function Pricing() {
  const navigate = useLms((s) => s.navigate);
  const setAuthOpen = useLms((s) => s.setAuthOpen);

  const plans: Plan[] = [
    {
      id: "starter",
      name: "Starter",
      tagline: "Explore free lessons and find your path.",
      price: "Free",
      cta: "Get started",
      ctaAction: () => setAuthOpen(true, "signup"),
      features: [
        "Access to free preview lessons",
        "Browse the full catalog",
        "Community read access",
        "Personalized recommendations",
        "No credit card required",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      tagline: "Best for serious learners. Unlock any single course.",
      price: "₹2,999",
      period: "/ course",
      cta: "Explore courses",
      ctaAction: () => navigate("catalog"),
      highlighted: true,
      badge: "Most Popular",
      features: [
        "Full lifetime access to a course",
        "Verifiable completion certificate",
        "Downloadable resources & source code",
        "Private community access",
        "Mobile & offline learning",
        "7-day money-back guarantee",
      ],
    },
    {
      id: "lifetime",
      name: "Lifetime",
      tagline: "All courses, forever. The complete Waynes library.",
      price: "₹49,999",
      period: " one-time",
      cta: "View plans",
      ctaAction: () => navigate("pricing"),
      features: [
        "Lifetime access to ALL current courses",
        "All future courses included free",
        "Unlimited verifiable certificates",
        "Priority community & mentor access",
        "Early access to new content",
        "Dedicated support",
      ],
    },
  ];

  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[130px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedReveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Pricing
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Simple pricing, <span className="text-gradient-brand">serious value</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Start free, upgrade when you&apos;re ready. No subscriptions, no surprises.
          </p>
        </AnimatedReveal>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <AnimatedReveal key={plan.id} delay={i * 90} className="h-full">
              <PlanCard plan={plan} />
            </AnimatedReveal>
          ))}
        </div>

        {/* Money-back note */}
        <AnimatedReveal delay={250} className="mt-8 flex justify-center">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>
              <span className="font-semibold text-foreground">7-day money-back guarantee</span>{" "}
              on every paid course.
            </span>
          </div>
        </AnimatedReveal>
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card/70 p-6 shadow-premium backdrop-blur transition-all",
        plan.highlighted
          ? "border-emerald-500/50 shadow-glow lg:scale-[1.03]"
          : "hover:border-emerald-500/30"
      )}
    >
      {/* Highlighted gradient ring */}
      {plan.highlighted && (
        <div className="pointer-events-none absolute -inset-px -z-10 rounded-2xl bg-gradient-to-br from-emerald-500/40 via-teal-400/20 to-violet-400/20 opacity-60 blur-sm" />
      )}

      {plan.badge && (
        <div className="absolute right-4 top-4">
          <Badge className="gap-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-glow">
            <Sparkles className="size-3" />
            {plan.badge}
          </Badge>
        </div>
      )}

      <div className="mb-1 flex items-center gap-2">
        {plan.id === "lifetime" && (
          <InfinityIcon className="size-4 text-emerald-500" />
        )}
        <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{plan.tagline}</p>

      <div className="mt-5 flex items-baseline gap-1">
        <span
          className={cn(
            "text-4xl font-bold tracking-tight",
            plan.highlighted && "text-gradient-brand"
          )}
        >
          {plan.price}
        </span>
        {plan.period && (
          <span className="text-sm text-muted-foreground">{plan.period}</span>
        )}
      </div>

      <Button
        size="lg"
        variant={plan.highlighted ? "default" : "outline"}
        className={cn(
          "mt-6 h-12 rounded-xl",
          plan.highlighted && "shadow-glow"
        )}
        onClick={plan.ctaAction}
      >
        {plan.cta}
      </Button>

      <ul className="mt-6 space-y-3 border-t pt-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <div
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                plan.highlighted
                  ? "bg-emerald-500/20 text-emerald-500"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Check className="size-3.5" />
            </div>
            <span className="text-foreground/90">{f}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

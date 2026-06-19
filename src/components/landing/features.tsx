"use client";

import {
  Infinity as InfinityIcon,
  Award,
  Users2,
  Smartphone,
  Wrench,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";
import { AnimatedReveal } from "@/components/lms/animated-reveal";
import { cn } from "@/lib/utils";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
  iconBg: string;
};

const FEATURES: Feature[] = [
  {
    icon: InfinityIcon,
    title: "Lifetime Access",
    description:
      "Buy once, learn forever. Every course you enroll in stays yours — including all future updates and new lessons.",
    accent: "text-emerald-500",
    iconBg: "bg-emerald-500/15",
  },
  {
    icon: Award,
    title: "Verifiable Certificates",
    description:
      "Earn industry-recognized certificates with unique verification IDs. Share on LinkedIn, download as PDF.",
    accent: "text-amber-500",
    iconBg: "bg-amber-500/15",
  },
  {
    icon: Users2,
    title: "World-Class Instructors",
    description:
      "Learn from engineers, designers & founders at Google, Netflix, Stripe, Figma and other top companies.",
    accent: "text-teal-500",
    iconBg: "bg-teal-500/15",
  },
  {
    icon: Smartphone,
    title: "Mobile Learning",
    description:
      "Beautifully optimized for mobile and tablet. Pick up where you left off, on any device, anywhere.",
    accent: "text-violet-400",
    iconBg: "bg-violet-500/15",
  },
  {
    icon: Wrench,
    title: "Project-Based",
    description:
      "No fluff. Every course is built around real, production-grade projects you can ship and showcase.",
    accent: "text-rose-400",
    iconBg: "bg-rose-500/15",
  },
  {
    icon: MessagesSquare,
    title: "Community Access",
    description:
      "Join a private community of 95K+ learners. Get feedback, find collaborators, and grow together.",
    accent: "text-emerald-500",
    iconBg: "bg-emerald-500/15",
  },
];

export function Features() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[140px]" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedReveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Why Learniverse
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Built for learners who actually{" "}
            <span className="text-gradient-brand">ship</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Every detail of the platform is designed to help you go from beginner to
            professional — and stay there.
          </p>
        </AnimatedReveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <AnimatedReveal key={feature.title} delay={i * 80} className="h-full">
              <FeatureCard feature={feature} />
            </AnimatedReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border bg-card/60 p-6 shadow-premium backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/40 hover:shadow-glow">
      <div
        className={cn(
          "mb-4 flex size-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
          feature.iconBg
        )}
      >
        <Icon className={cn("size-6", feature.accent)} />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{feature.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>

      {/* Hover gradient corner */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 opacity-0 blur-2xl transition-opacity duration-300 group-hover:from-emerald-500/20 group-hover:to-teal-500/10 group-hover:opacity-100" />
    </div>
  );
}

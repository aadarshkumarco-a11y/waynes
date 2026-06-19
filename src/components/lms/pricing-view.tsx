"use client";

import { Check, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedReveal } from "@/components/lms/animated-reveal";
import { Faq } from "@/components/landing/faq";
import { CtaSection } from "@/components/landing/cta";
import { useLms } from "@/lib/store";
import { formatPrice } from "@/lib/format";

const TIERS = [
  {
    name: "Starter",
    price: 0,
    period: "Free forever",
    desc: "Explore free lessons and decide if Learniverse is right for you.",
    features: [
      "Access to preview lessons",
      "Community access",
      "Weekly newsletter",
      "Mobile & web access",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: 2999,
    period: "per course",
    desc: "Buy individual courses with lifetime access and certificates.",
    features: [
      "Full course access — lifetime",
      "Verifiable completion certificate",
      "Downloadable resources",
      "Notes & bookmarks",
      "Priority support",
      "Future updates included",
    ],
    cta: "Browse Courses",
    highlight: true,
  },
  {
    name: "Lifetime",
    price: 49999,
    period: "one-time",
    desc: "Unlock every current and future course with a single payment.",
    features: [
      "All current courses — lifetime",
      "All future courses included",
      "Certificates for every course",
      "Early access to new content",
      "Private community + AMAs",
      "1:1 mentorship credits",
    ],
    cta: "Get Lifetime",
    highlight: false,
  },
];

const COMPARISON = [
  { feature: "Course access", starter: "Preview only", pro: "Single course", lifetime: "All courses" },
  { feature: "Certificate", starter: "—", pro: "✓", lifetime: "✓" },
  { feature: "Downloadable resources", starter: "—", pro: "✓", lifetime: "✓" },
  { feature: "Notes & bookmarks", starter: "—", pro: "✓", lifetime: "✓" },
  { feature: "Future courses", starter: "—", pro: "—", lifetime: "✓" },
  { feature: "Priority support", starter: "—", pro: "✓", lifetime: "✓" },
  { feature: "Community + AMAs", starter: "Basic", pro: "—", lifetime: "✓" },
  { feature: "Mentorship credits", starter: "—", pro: "—", lifetime: "✓" },
];

export function PricingView() {
  const navigate = useLms((s) => s.navigate);
  const setAuthOpen = useLms((s) => s.setAuthOpen);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <AnimatedReveal className="mx-auto max-w-2xl text-center">
        <Badge variant="secondary" className="mb-3 gap-1">
          <Sparkles className="size-3" /> Simple, transparent pricing
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Invest in <span className="text-gradient-brand">your growth</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Pay per course or unlock everything for life. No subscriptions, no hidden fees —
          just skills that pay off.
        </p>
      </AnimatedReveal>

      {/* Tiers */}
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {TIERS.map((tier, i) => (
          <AnimatedReveal key={tier.name} delay={i * 80}>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className={`relative h-full rounded-2xl border bg-card p-6 shadow-premium ${
                tier.highlight ? "border-primary shadow-glow ring-1 ring-primary" : ""
              }`}
            >
              {tier.highlight && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1 gradient-brand text-white">
                  <Sparkles className="size-3" /> Most Popular
                </Badge>
              )}
              <h3 className="text-lg font-semibold">{tier.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tier.desc}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">
                  {tier.price === 0 ? "Free" : formatPrice(tier.price)}
                </span>
                <span className="text-sm text-muted-foreground">/ {tier.period}</span>
              </div>
              <Button
                className="mt-5 w-full"
                variant={tier.highlight ? "default" : "outline"}
                onClick={() =>
                  tier.name === "Starter" ? setAuthOpen(true, "signup") : navigate("catalog")
                }
              >
                {tier.cta} <ArrowRight className="size-4" />
              </Button>
              <ul className="mt-6 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatedReveal>
        ))}
      </div>

      {/* Guarantee */}
      <AnimatedReveal className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="size-4 text-emerald-500" />
        7-day no-questions-asked refund on every course.
      </AnimatedReveal>

      {/* Comparison table */}
      <AnimatedReveal className="mt-16">
        <h2 className="mb-6 text-center text-2xl font-bold">Compare plans</h2>
        <div className="overflow-x-auto scrollbar-thin rounded-2xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-semibold">Feature</th>
                <th className="p-4 text-center font-semibold">Starter</th>
                <th className="p-4 text-center font-semibold text-primary">Pro</th>
                <th className="p-4 text-center font-semibold">Lifetime</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.feature} className="border-b last:border-0">
                  <td className="p-4 font-medium">{row.feature}</td>
                  <td className="p-4 text-center text-muted-foreground">{row.starter}</td>
                  <td className="p-4 text-center">{row.pro}</td>
                  <td className="p-4 text-center">{row.lifetime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimatedReveal>

      {/* FAQ */}
      <div className="mt-20">
        <Faq />
      </div>

      {/* CTA */}
      <div className="mt-20">
        <CtaSection />
      </div>
    </div>
  );
}

export default PricingView;

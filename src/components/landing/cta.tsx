"use client";

import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedReveal } from "@/components/lms/animated-reveal";
import { useLms } from "@/lib/store";

export function CtaSection() {
  const navigate = useLms((s) => s.navigate);
  const setAuthOpen = useLms((s) => s.setAuthOpen);

  return (
    <section className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedReveal>
          <div className="relative overflow-hidden rounded-3xl gradient-brand px-6 py-14 shadow-glow sm:px-12 sm:py-20">
            {/* Grid + glow overlay */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-grid opacity-25" />
              <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/20 blur-[100px]" />
              <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-teal-300/30 blur-[100px]" />
            </div>

            {/* Floating sparkles */}
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-8 top-8 hidden sm:block"
            >
              <Sparkles className="size-8 text-white/70" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0], rotate: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute left-10 bottom-10 hidden sm:block"
            >
              <Sparkles className="size-6 text-white/60" />
            </motion.div>

            <div className="relative mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
                Start learning today
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-white/85 sm:text-lg">
                Join 95,000+ learners who are leveling up their careers with world-class
                courses. Lifetime access, verifiable certificates, and a 7-day money-back
                guarantee.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  className="group h-12 rounded-xl px-6 text-base shadow-premium"
                  onClick={() => setAuthOpen(true, "signup")}
                >
                  Sign up free
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-xl border-white/30 bg-white/10 px-6 text-base text-white backdrop-blur hover:bg-white/20 hover:text-white"
                  onClick={() => navigate("catalog")}
                >
                  <PlayCircle className="size-4" />
                  Explore courses
                </Button>
              </div>

              <p className="mt-5 text-xs text-white/70">
                No credit card required · Cancel anytime · 7-day refund
              </p>
            </div>
          </div>
        </AnimatedReveal>
      </div>
    </section>
  );
}

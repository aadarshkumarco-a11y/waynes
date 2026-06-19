"use client";

import { motion } from "framer-motion";
import {
  PlayCircle,
  Sparkles,
  Star,
  Users,
  Globe,
  ArrowRight,
  ShieldCheck,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/lms/star-rating";
import { useLms } from "@/lib/store";
import { platformStats, courses } from "@/lib/data/catalog";
import { formatNumber } from "@/lib/format";

const TRUST_LOGOS = [
  "Google",
  "Netflix",
  "Stripe",
  "Figma",
  "Notion",
  "Atlassian",
  "Razorpay",
  "Swiggy",
  "Cred",
];

export function Hero() {
  const navigate = useLms((s) => s.navigate);
  const setAuthOpen = useLms((s) => s.setAuthOpen);
  const featured = courses.find((c) => c.featured) ?? courses[0];

  return (
    <section className="relative overflow-hidden">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid mask-fade-b opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
        {/* Glow blobs */}
        <div className="absolute -top-32 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="absolute top-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-teal-400/15 blur-[120px]" />
        <div className="absolute top-60 -left-32 h-[24rem] w-[24rem] rounded-full bg-violet-400/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8 lg:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          {/* Left column — copy */}
          <div className="flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="mb-5 gap-1.5 rounded-full border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300"
              >
                <Sparkles className="size-3.5" />
                <span className="font-medium">New: LLM Engineering with RAG & Agents</span>
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl"
            >
              Master the skills that
              <br className="hidden sm:block" />{" "}
              <span className="text-gradient-brand">define the future</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-5 max-w-xl text-base text-muted-foreground text-pretty sm:text-lg"
            >
              Learn from world-class engineers, designers, and founders. Production-grade
              courses, project-based learning, verifiable certificates, and a community
              that ships — all in one premium platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Button
                size="lg"
                className="group h-12 rounded-xl px-6 text-base shadow-glow"
                onClick={() => navigate("catalog")}
              >
                Explore Courses
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-xl px-6 text-base"
                onClick={() => setAuthOpen(true, "signup")}
              >
                <PlayCircle className="size-4" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <StarRating rating={platformStats.rating} size={16} />
                <span className="font-semibold text-foreground">
                  {platformStats.rating.toFixed(1)}
                </span>
                <span>rating</span>
              </div>
              <div className="hidden h-4 w-px bg-border sm:block" />
              <div className="flex items-center gap-1.5">
                <Users className="size-4 text-emerald-500" />
                <span className="font-semibold text-foreground">
                  {formatNumber(platformStats.students)}+
                </span>
                <span>students</span>
              </div>
              <div className="hidden h-4 w-px bg-border sm:block" />
              <div className="flex items-center gap-1.5">
                <Globe className="size-4 text-emerald-500" />
                <span className="font-semibold text-foreground">
                  {platformStats.countries}
                </span>
                <span>countries</span>
              </div>
            </motion.div>
          </div>

          {/* Right column — floating showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-md lg:mx-0 lg:ml-auto"
          >
            <HeroShowcase featured={featured} />
          </motion.div>
        </div>

        {/* Marquee trust bar */}
        <div className="relative mt-16 sm:mt-20">
          <p className="mb-5 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Our graduates work at the world&apos;s best companies
          </p>
          <div className="relative overflow-hidden mask-fade-x [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="flex w-max animate-marquee items-center gap-12 pr-12">
              {[...TRUST_LOGOS, ...TRUST_LOGOS].map((logo, i) => (
                <span
                  key={`${logo}-${i}`}
                  className="select-none text-lg font-semibold tracking-tight text-muted-foreground/60 transition-colors hover:text-foreground sm:text-xl"
                  aria-label={logo}
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroShowcase({ featured }: { featured: (typeof courses)[number] }) {
  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-emerald-500/20 via-teal-400/10 to-violet-400/10 blur-2xl" />

      {/* Main course preview card */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="glass-strong relative overflow-hidden rounded-2xl shadow-premium"
      >
        <div className="relative aspect-video overflow-hidden">
          <img
            src={featured.thumbnail}
            alt={featured.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.08 }}
              className="flex size-16 items-center justify-center rounded-full bg-white/90 text-primary shadow-glow backdrop-blur"
            >
              <PlayCircle className="size-8" />
            </motion.div>
          </div>
          {/* Bottom overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4">
            <Badge className="mb-2 bg-emerald-500/90 text-white hover:bg-emerald-500">
              ★ Featured Course
            </Badge>
            <p className="line-clamp-1 text-sm font-semibold text-white">
              {featured.title}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-white/80">
              <StarRating rating={featured.rating} size={12} />
              <span>{featured.rating.toFixed(1)}</span>
              <span>·</span>
              <span>{formatNumber(featured.studentCount)} students</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating badge — top right */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -right-3 -top-3 sm:-right-6 sm:-top-6"
      >
        <div className="glass flex items-center gap-2 rounded-xl px-3 py-2 shadow-premium">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-400/20 text-amber-500">
            <Star className="size-4 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold leading-none">4.9★ rating</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">avg. across courses</p>
          </div>
        </div>
      </motion.div>

      {/* Floating badge — bottom left */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-4 -left-3 sm:-bottom-6 sm:-left-6"
      >
        <div className="glass flex items-center gap-2 rounded-xl px-3 py-2 shadow-premium">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500">
            <Users className="size-4" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold leading-none">95K+ students</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">learning right now</p>
          </div>
        </div>
      </motion.div>

      {/* Floating badge — middle right */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute -right-4 top-1/2 hidden sm:block"
      >
        <div className="glass flex items-center gap-2 rounded-xl px-3 py-2 shadow-premium">
          <div className="flex size-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
            <Trophy className="size-4" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold leading-none">Certificates</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">verifiable & shareable</p>
          </div>
        </div>
      </motion.div>

      {/* Floating badge — bottom right (mobile) */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-8 right-2 sm:hidden"
      >
        <div className="glass flex items-center gap-2 rounded-xl px-3 py-2 shadow-premium">
          <ShieldCheck className="size-4 text-emerald-500" />
          <p className="text-xs font-bold">7-day refund</p>
        </div>
      </motion.div>

      {/* Decorative lightning */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute -left-6 top-1/3 hidden lg:block"
      >
        <div className="glass flex size-10 items-center justify-center rounded-xl shadow-premium">
          <Zap className="size-5 text-amber-500" />
        </div>
      </motion.div>
    </div>
  );
}

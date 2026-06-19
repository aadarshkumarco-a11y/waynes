"use client";

import { motion } from "framer-motion";
import { Star, Users, BookOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AnimatedReveal } from "@/components/lms/animated-reveal";
import { instructors } from "@/lib/data/catalog";
import { formatNumber } from "@/lib/format";

export function Instructors() {
  return (
    <section className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedReveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Learn from the best
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Instructors who&apos;ve{" "}
            <span className="text-gradient-brand">been there</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Engineers, designers, and leaders from Google, Netflix, Stripe, Figma and more —
            teaching what actually works in production.
          </p>
        </AnimatedReveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {instructors.map((ins, i) => (
            <AnimatedReveal key={ins.id} delay={i * 70} className="h-full">
              <InstructorCard
                name={ins.name}
                title={ins.title}
                avatar={ins.avatar}
                bio={ins.bio}
                rating={ins.rating}
                students={ins.students}
                courseCount={ins.courses}
                expertise={ins.expertise}
              />
            </AnimatedReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function InstructorCard({
  name,
  title,
  avatar,
  bio,
  rating,
  students,
  courseCount,
  expertise,
}: {
  name: string;
  title: string;
  avatar: string;
  bio: string;
  rating: number;
  students: number;
  courseCount: number;
  expertise: string[];
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative h-full overflow-hidden rounded-2xl border bg-card/60 shadow-premium backdrop-blur"
    >
      {/* Cover gradient */}
      <div className="relative h-24 overflow-hidden bg-gradient-to-br from-emerald-500/30 via-teal-500/20 to-violet-500/20">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
      </div>

      <div className="px-5 pb-5">
        {/* Avatar overlapping cover */}
        <div className="-mt-10 mb-3 flex items-end justify-between">
          <Avatar className="size-20 border-4 border-card shadow-premium">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-amber-600 dark:text-amber-400">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold">{rating.toFixed(1)}</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold tracking-tight">{name}</h3>
        <p className="mt-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {title}
        </p>

        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{bio}</p>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5 text-emerald-500" />
            <span className="font-semibold text-foreground">
              {formatNumber(students)}
            </span>
            students
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="size-3.5 text-emerald-500" />
            <span className="font-semibold text-foreground">{courseCount}</span>
            courses
          </div>
        </div>

        {/* Expertise */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {expertise.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="rounded-full bg-muted/60 text-[11px] font-medium"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Hover corner glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-emerald-500/0 blur-2xl transition-all duration-300 group-hover:bg-emerald-500/15" />
    </motion.div>
  );
}

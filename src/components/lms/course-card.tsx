"use client";

import { Clock, PlayCircle, Users, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/lms/star-rating";
import { useLms } from "@/lib/store";
import { courseStats, instructorMap } from "@/lib/data/catalog";
import { formatDuration, formatNumber, formatPrice } from "@/lib/format";
import type { Course } from "@/lib/types";
import { cn } from "@/lib/utils";

function levelLabel(level: Course["level"]): string {
  return level.toLowerCase() === "beginner"
    ? "BEGINNER"
    : level.toLowerCase() === "advanced"
    ? "ADVANCED"
    : "INTERMEDIATE";
}

function discountPct(c: Course): number {
  if (!c.comparePrice || c.comparePrice <= c.price) return 0;
  return Math.round(((c.comparePrice - c.price) / c.comparePrice) * 100);
}

export function CourseCard({
  course,
  className,
  compact = false,
}: {
  course: Course;
  className?: string;
  compact?: boolean;
}) {
  const openCourse = useLms((s) => s.openCourse);
  const addToCart = useLms((s) => s.addToCart);
  const isInCart = useLms((s) => s.isInCart);
  const isEnrolled = useLms((s) => s.isEnrolled);

  const { duration } = courseStats(course);
  const instructor = instructorMap[course.instructorId];
  const enrolled = isEnrolled(course.id);
  const inCart = isInCart(course.id);
  const pct = discountPct(course);

  const ctaLabel = enrolled ? "ACCESS" : inCart ? "IN CART ✓" : "ENROLL";
  const ctaIcon = enrolled ? <CheckCircle2 className="size-3.5" /> : null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn("group h-full", className)}
    >
      <Card className="relative flex h-full flex-col overflow-hidden rounded-md border-border/60 bg-card p-0 transition-colors hover:border-primary hover:glow-green">
        {/* Thumbnail */}
        <button
          type="button"
          onClick={() => openCourse(course.slug)}
          className="relative block w-full overflow-hidden"
          aria-label={`View ${course.title}`}
        >
          <div className="relative aspect-video overflow-hidden bg-muted">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
            {/* Scanlines on hover */}
            <div className="scanlines absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Level badge — top-left */}
            <Badge
              variant="outline"
              className="absolute left-2 top-2 border-primary/60 bg-background/70 font-mono text-[10px] uppercase tracking-wider text-primary backdrop-blur"
            >
              {levelLabel(course.level)}
            </Badge>

            {/* Discount badge — top-right */}
            {pct > 0 && (
              <Badge className="absolute right-2 top-2 gap-0.5 bg-destructive/90 font-mono text-[10px] font-bold text-white glow-red hover:bg-destructive">
                -{pct}%
              </Badge>
            )}

            {/* Play overlay on hover */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="grid size-12 place-items-center rounded-full border border-primary bg-primary/15 text-primary backdrop-blur glow-green">
                <PlayCircle className="size-6" />
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary text-glow-green">
                Initiate
              </span>
            </div>
          </div>
        </button>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-2.5 p-3.5">
          {/* Title */}
          <button
            type="button"
            onClick={() => openCourse(course.slug)}
            className="text-left font-mono text-sm font-bold leading-snug tracking-tight line-clamp-2 transition-colors hover:text-primary"
          >
            {course.title}
          </button>

          {/* Instructor */}
          {instructor && (
            <div className="flex items-center gap-1.5">
              <img
                src={instructor.avatar}
                alt={instructor.name}
                className="size-4 rounded-full border border-primary/30 object-cover"
              />
              <span className="font-mono text-[11px] text-muted-foreground">
                {instructor.name}
              </span>
            </div>
          )}

          {/* Rating */}
          <StarRating rating={course.rating} size={11} showValue count={course.reviewCount} />

          {/* Price + CTA */}
          <div className="mt-auto flex items-end justify-between gap-2 border-t border-primary/15 pt-2.5">
            <div className="flex flex-col">
              <span className="font-mono text-base font-bold transition-all group-hover:text-primary group-hover:text-glow-green">
                {formatPrice(course.price, course.currency)}
              </span>
              {course.comparePrice && (
                <span className="font-mono text-[11px] text-muted-foreground line-through">
                  {formatPrice(course.comparePrice, course.currency)}
                </span>
              )}
            </div>
            <Button
              size="sm"
              variant={inCart ? "secondary" : "default"}
              disabled={enrolled || inCart}
              onClick={(e) => {
                e.stopPropagation();
                if (!enrolled && !inCart) addToCart(course.id);
              }}
              className={cn(
                "gap-1 rounded-none font-mono text-[11px] uppercase tracking-wider",
                enrolled && "border-primary/40 bg-primary/10 text-primary hover:bg-primary/10"
              )}
              aria-label={`${ctaLabel} — ${course.title}`}
            >
              {ctaIcon}
              {ctaLabel}
            </Button>
          </div>

          {/* Bottom stats — hidden when compact */}
          {!compact && (
            <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="size-3" />
                {formatNumber(course.studentCount)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {formatDuration(duration)}
              </span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

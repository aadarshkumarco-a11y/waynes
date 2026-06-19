"use client";

import { Clock, PlayCircle, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/lms/star-rating";
import { useLms } from "@/lib/store";
import { courseStats } from "@/lib/data/catalog";
import { formatDuration, formatNumber, formatPrice } from "@/lib/format";
import { instructorMap } from "@/lib/data/catalog";
import type { Course } from "@/lib/types";
import { cn } from "@/lib/utils";

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
  const isEnrolled = useLms((s) => s.isEnrolled);
  const { lessonCount, duration } = courseStats(course);
  const instructor = instructorMap[course.instructorId];
  const enrolled = isEnrolled(course.id);
  const discount = course.comparePrice
    ? Math.round(((course.comparePrice - course.price) / course.comparePrice) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn("group h-full", className)}
    >
      <Card className="relative h-full overflow-hidden p-0 shadow-premium transition-shadow hover:shadow-glow">
        {/* Thumbnail */}
        <button
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {course.featured && (
              <Badge className="absolute left-3 top-3 gap-1 bg-amber-400/90 text-amber-950 hover:bg-amber-400">
                ★ Featured
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="absolute right-3 top-3 bg-rose-500/90 text-white hover:bg-rose-500">
                -{discount}%
              </Badge>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="flex size-14 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg backdrop-blur">
                <PlayCircle className="size-7" />
              </div>
            </div>
            <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-white/90">
              <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 backdrop-blur">
                <Users className="size-3" />
                {formatNumber(course.studentCount)}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 backdrop-blur">
                <Clock className="size-3" />
                {formatDuration(duration)}
              </span>
            </div>
          </div>
        </button>

        {/* Body */}
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-medium">
              {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
            </Badge>
            <span className="text-xs text-muted-foreground">{lessonCount} lessons</span>
          </div>

          <button
            onClick={() => openCourse(course.slug)}
            className="text-left text-base font-semibold leading-snug tracking-tight line-clamp-2 transition-colors hover:text-primary"
          >
            {course.title}
          </button>

          {!compact && (
            <p className="text-sm text-muted-foreground line-clamp-2">{course.subtitle}</p>
          )}

          {/* Instructor */}
          {instructor && (
            <div className="flex items-center gap-2">
              <img
                src={instructor.avatar}
                alt={instructor.name}
                className="size-6 rounded-full object-cover"
              />
              <span className="text-xs text-muted-foreground">{instructor.name}</span>
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center justify-between">
            <StarRating rating={course.rating} count={course.reviewCount} showValue />
          </div>

          {/* Price + CTA */}
          <div className="mt-1 flex items-end justify-between gap-2 border-t pt-3">
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight">
                {formatPrice(course.price, course.currency)}
              </span>
              {course.comparePrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(course.comparePrice, course.currency)}
                </span>
              )}
            </div>
            {enrolled ? (
              <Button size="sm" variant="outline" onClick={() => openCourse(course.slug)}>
                Go to Course
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(course.id);
                }}
              >
                Add to Cart
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

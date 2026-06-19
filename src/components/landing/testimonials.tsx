"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/lms/star-rating";
import { AnimatedReveal } from "@/components/lms/animated-reveal";
import { testimonials, featuredReviews, courseMap } from "@/lib/data/catalog";
import { cn } from "@/lib/utils";

export function Testimonials() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-1/4 top-0 h-[28rem] w-[28rem] rounded-full bg-amber-400/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[28rem] w-[28rem] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedReveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Loved by learners
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Real stories from real careers
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            From juniors to seniors, from career-switchers to founders — see how
            Waynes helped them level up.
          </p>
        </AnimatedReveal>

        {/* Testimonials masonry-ish grid */}
        <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5 [&>*]:break-inside-avoid">
          {testimonials.map((t, i) => (
            <AnimatedReveal key={t.id} delay={i * 60}>
              <TestimonialCard
                name={t.name}
                role={t.role}
                avatar={t.avatar}
                quote={t.quote}
                rating={t.rating}
              />
            </AnimatedReveal>
          ))}
        </div>

        {/* Featured recent reviews */}
        <div className="mt-16">
          <AnimatedReveal className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300"
            >
              <Star className="size-3 fill-amber-400 text-amber-400" />
              Recent reviews
            </Badge>
            <div className="h-px flex-1 bg-border" />
          </AnimatedReveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredReviews.map((r, i) => {
              const course = courseMap[r.courseId];
              return (
                <AnimatedReveal key={r.id} delay={i * 80}>
                  <ReviewCard
                    name={r.userName}
                    avatar={r.userAvatar}
                    rating={r.rating}
                    comment={r.comment}
                    courseTitle={course?.title}
                    date={r.date}
                  />
                </AnimatedReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  name,
  role,
  avatar,
  quote,
  rating,
}: {
  name: string;
  role: string;
  avatar?: string;
  quote: string;
  rating: number;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative overflow-hidden rounded-2xl border bg-card/60 p-6 shadow-premium backdrop-blur"
    >
      <Quote className="absolute right-4 top-4 size-8 text-emerald-500/15 transition-colors group-hover:text-emerald-500/25" />

      <StarRating rating={rating} size={16} />

      <p className="mt-4 text-sm leading-relaxed text-foreground text-pretty sm:text-[15px]">
        &ldquo;{quote}&rdquo;
      </p>

      <div className="mt-5 flex items-center gap-3">
        <Avatar className="size-10 border">
          {avatar ? <AvatarImage src={avatar} alt={name} /> : null}
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold leading-tight">{name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ReviewCard({
  name,
  avatar,
  rating,
  comment,
  courseTitle,
  date,
}: {
  name: string;
  avatar?: string;
  rating: number;
  comment: string;
  courseTitle?: string;
  date: string;
}) {
  return (
    <div className="rounded-2xl border bg-card/50 p-5 shadow-premium backdrop-blur transition-all hover:-translate-y-1 hover:shadow-glow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar className="size-8 border">
            {avatar ? <AvatarImage src={avatar} alt={name} /> : null}
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs font-semibold leading-tight">{name}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {new Date(date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold">{rating}</span>
        </div>
      </div>

      <p className="mt-3 text-sm text-foreground text-pretty">{comment}</p>

      {courseTitle && (
        <div
          className={cn(
            "mt-3 truncate rounded-md bg-muted/40 px-2.5 py-1.5 text-[11px] text-muted-foreground"
          )}
        >
          On: <span className="font-medium text-foreground">{courseTitle}</span>
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Bug,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  Download,
  FileText,
  Globe,
  Infinity as InfinityIcon,
  Lock,
  Network,
  PlayCircle,
  Search,
  ShieldCheck,
  Skull,
  Sparkles,
  Star,
  Swords,
  Terminal,
  Trash2,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { StarRating } from "@/components/lms/star-rating";
import { AnimatedReveal } from "@/components/lms/animated-reveal";
import { useLms } from "@/lib/store";
import {
  categories,
  courseStats,
  featuredReviews,
  instructorMap,
} from "@/lib/data/catalog";
import {
  formatDate,
  formatDuration,
  formatNumber,
  formatPrice,
} from "@/lib/format";
import { useCourseBySlug } from "@/hooks/use-courses";
import type { Course, LessonType } from "@/lib/types";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Icon helpers
// ---------------------------------------------------------------------------
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Globe,
  Network,
  Bug,
  Cpu,
  Swords,
  Search,
};

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = CATEGORY_ICONS[name] ?? Terminal;
  return <Icon className={className} />;
}

const LESSON_TYPE_ICONS: Record<LessonType, LucideIcon> = {
  VIDEO: PlayCircle,
  PDF: FileText,
  TEXT: Code2,
  DOWNLOAD: Download,
};

// ---------------------------------------------------------------------------
// Section heading — terminal style
// ---------------------------------------------------------------------------
function SectionTitle({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center gap-2.5 border-b border-primary/15 pb-3">
      <span className="grid size-8 place-items-center rounded-md border border-primary/30 bg-primary/5 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="flex flex-col">
        <span className="font-mono text-[10px] uppercase tracking-widest text-primary/70">
          {label}
        </span>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{children}</h2>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Purchase card — terminal window style (desktop sticky + mobile bottom)
// ---------------------------------------------------------------------------
function PurchaseCard({
  course,
  onAddToCart,
  onBuyNow,
  onCheckout,
  onRemove,
  onContinue,
  enrolled,
  inCart,
  progress,
  className,
}: {
  course: Course;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onCheckout: () => void;
  onRemove: () => void;
  onContinue: () => void;
  enrolled: boolean;
  inCart: boolean;
  progress?: number;
  className?: string;
}) {
  const { lessonCount, duration } = courseStats(course);
  const discount = course.comparePrice
    ? Math.round(((course.comparePrice - course.price) / course.comparePrice) * 100)
    : 0;

  const includes = [
    { icon: PlayCircle, label: `${lessonCount} on-demand lessons` },
    { icon: Clock, label: `${formatDuration(duration)} of content` },
    { icon: Download, label: "Downloadable resources" },
    { icon: Award, label: "Certificate of completion" },
    { icon: InfinityIcon, label: "Full lifetime access" },
    { icon: ShieldCheck, label: "30-day money-back guarantee" },
  ];

  return (
    <Card className={cn("terminal-window overflow-hidden", className)}>
      {/* Window header */}
      <div className="flex items-center gap-2 border-b border-primary/15 bg-primary/5 px-4 py-2">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-destructive/70" />
          <span className="size-2.5 rounded-full bg-amber-500/70" />
          <span className="size-2.5 rounded-full bg-primary/70" />
        </div>
        <span className="ml-2 font-mono text-[11px] uppercase tracking-widest text-primary/80">
          enroll.sh
        </span>
      </div>

      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="scanlines pointer-events-none absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            className="grid size-14 place-items-center rounded-full border border-primary/40 bg-black/60 text-primary backdrop-blur transition-transform hover:scale-105 glow-green"
            aria-label="Watch preview"
          >
            <PlayCircle className="size-7" />
          </button>
        </div>
        <Badge className="absolute left-3 top-3 gap-1 border border-primary/40 bg-black/70 font-mono text-[10px] uppercase tracking-widest text-primary backdrop-blur hover:bg-black/70">
          <PlayCircle className="size-3" />
          preview
        </Badge>
      </div>

      <div className="flex flex-col gap-4 p-5">
        {/* Price */}
        <div className="flex flex-col gap-1">
          <div className="flex items-end gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-glow-green">
              {formatPrice(course.price, course.currency)}
            </span>
            {course.comparePrice && (
              <span className="pb-1 font-mono text-sm text-muted-foreground line-through">
                {formatPrice(course.comparePrice, course.currency)}
              </span>
            )}
            {discount > 0 && (
              <Badge className="mb-1 ml-auto gap-1 border border-destructive/40 bg-destructive/15 font-mono text-destructive">
                -{discount}%
              </Badge>
            )}
          </div>
          {discount > 0 && (
            <p className="font-mono text-xs text-muted-foreground">
              <span className="text-primary">$</span> you_save{" "}
              <span className="font-semibold text-primary">
                {formatPrice(course.comparePrice! - course.price, course.currency)}
              </span>
            </p>
          )}
        </div>

        {/* Progress (if enrolled) */}
        {enrolled && typeof progress === "number" && (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
            <div className="mb-1.5 flex items-center justify-between font-mono text-xs">
              <span className="text-primary">$ progress</span>
              <span className="font-semibold tabular-nums text-primary">{progress}%</span>
            </div>
            <Progress
              value={progress}
              className="h-1.5 [&>div]:bg-primary [&>div]:glow-green"
            />
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          {enrolled ? (
            <Button
              size="lg"
              onClick={onContinue}
              className="glow-green gap-2 font-mono uppercase tracking-widest"
            >
              <PlayCircle className="size-4" />
              {progress && progress > 0 ? "Continue Learning" : "Go to Course"}
              <ArrowRight className="size-4" />
            </Button>
          ) : inCart ? (
            <>
              <Button
                size="lg"
                onClick={onCheckout}
                className="glow-green gap-2 font-mono uppercase tracking-widest"
              >
                <Terminal className="size-4" />
                In Cart — Checkout
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="w-full gap-2 font-mono text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={onRemove}
              >
                <Trash2 className="size-4" />
                remove_from_cart
              </Button>
            </>
          ) : (
            <>
              <Button
                size="lg"
                onClick={onBuyNow}
                className="glow-green gap-2 font-mono uppercase tracking-widest"
              >
                <Sparkles className="size-4" />
                Buy Now
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onAddToCart}
                className="gap-2 border-primary/30 font-mono uppercase tracking-widest text-primary hover:bg-primary/10"
              >
                <Terminal className="size-4" />
                Add to Cart
              </Button>
            </>
          )}
        </div>

        {/* Money-back note */}
        {!enrolled && (
          <p className="flex items-center justify-center gap-1.5 text-center font-mono text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" />
            30-day money-back guarantee
          </p>
        )}

        <Separator className="bg-primary/15" />

        {/* Includes */}
        <div>
          <p className="mb-2.5 font-mono text-xs font-semibold uppercase tracking-widest text-primary/80">
            {"// includes"}
          </p>
          <ul className="flex flex-col gap-2">
            {includes.map((item) => (
              <li key={item.label} className="flex items-center gap-2.5 text-sm">
                <item.icon className="size-4 shrink-0 text-primary" />
                <span className="text-foreground/90">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Not found state — terminal 404
// ---------------------------------------------------------------------------
function CourseNotFound() {
  const navigate = useLms((s) => s.navigate);
  return (
    <div className="relative mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="terminal-window px-8 py-12"
      >
        <div className="mb-4 flex size-16 items-center justify-center rounded-full border border-destructive/40 bg-destructive/5 text-destructive glow-red">
          <Skull className="size-9" />
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-destructive">
          error 404
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-glow-red sm:text-3xl">
          404: TARGET NOT FOUND
        </h1>
        <p className="mt-3 max-w-md font-mono text-sm text-muted-foreground">
          <span className="text-destructive">$</span> the requested course does
          not exist in the database. it may have been removed, renamed, or
          never existed.
        </p>
        <Button
          className="mt-6 gap-2 font-mono uppercase tracking-widest"
          onClick={() => navigate("catalog")}
        >
          <ArrowLeft className="size-4" />
          &lt; back_to_catalog
        </Button>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------
export function CourseDetailView() {
  const courseSlug = useLms((s) => s.courseSlug);
  const user = useLms((s) => s.user);
  const openLesson = useLms((s) => s.openLesson);
  const openCheckout = useLms((s) => s.openCheckout);
  const addToCart = useLms((s) => s.addToCart);
  const removeFromCart = useLms((s) => s.removeFromCart);
  const isInCart = useLms((s) => s.isInCart);
  const isEnrolled = useLms((s) => s.isEnrolled);
  const getEnrollment = useLms((s) => s.getEnrollment);
  const setAuthOpen = useLms((s) => s.setAuthOpen);
  const navigate = useLms((s) => s.navigate);

  const course = useCourseBySlug(courseSlug);

  // Derived data
  const enrolled = course ? isEnrolled(course.id) : false;
  const inCart = course ? isInCart(course.id) : false;
  const enrollment = course ? getEnrollment(course.id) : undefined;
  const progress = enrollment?.progress ?? 0;
  const instructor = course ? instructorMap[course.instructorId] : undefined;
  const category = course ? categories.find((c) => c.id === course.categoryId) : undefined;
  const { lessonCount, duration } = course ? courseStats(course) : { lessonCount: 0, duration: 0 };

  // First lesson (for "Go to Course") + last viewed
  const firstLesson = useMemo(() => {
    if (!course) return null;
    return course.sections[0]?.lessons[0] ?? null;
  }, [course]);

  const continueLessonId = enrollment?.lastViewedLessonId ?? firstLesson?.id ?? null;

  // Reviews: prefer ones for this course, fall back to all featured
  const courseReviews = useMemo(() => {
    if (!course) return [];
    const forThis = featuredReviews.filter((r) => r.courseId === course.id);
    return forThis.length > 0 ? forThis : featuredReviews;
  }, [course]);

  if (!course) {
    return <CourseNotFound />;
  }

  // CTA handlers
  const requireAuth = (cb: () => void) => {
    if (!user) {
      setAuthOpen(true, "login");
      return;
    }
    cb();
  };

  const handleAddToCart = () => addToCart(course.id);
  const handleBuyNow = () => requireAuth(() => openCheckout(course.id));
  const handleCheckout = () => requireAuth(() => openCheckout(course.id));
  const handleContinue = () => {
    if (continueLessonId) openLesson(course.slug, continueLessonId);
  };

  const discount = course.comparePrice
    ? Math.round(((course.comparePrice - course.price) / course.comparePrice) * 100)
    : 0;

  return (
    <div className="relative min-h-screen bg-background">
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden">
        {/* Banner */}
        <div className="absolute inset-0 -z-10">
          {course.banner ? (
            <img
              src={course.banner}
              alt=""
              aria-hidden="true"
              className="size-full object-cover"
            />
          ) : (
            <div className="size-full bg-gradient-to-br from-primary/30 to-primary/5" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background" />
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="absolute left-1/3 top-0 size-72 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pt-12 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList className="font-mono text-xs">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <button onClick={() => navigate("home")} className="hover:text-primary">
                    ~ /home
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-primary/40" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <button onClick={() => navigate("catalog")} className="hover:text-primary">
                    catalog
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {category && (
                <>
                  <BreadcrumbSeparator className="text-primary/40" />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <button onClick={() => navigate("catalog")} className="hover:text-primary">
                        {category.slug}
                      </button>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator className="text-primary/40" />
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1 max-w-[180px] text-primary sm:max-w-xs">
                  {course.slug}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <AnimatedReveal>
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                {course.featured && (
                  <Badge className="gap-1 border border-primary/40 bg-primary/15 font-mono text-primary glow-green">
                    <Star className="size-3 fill-current" />
                    FEATURED
                  </Badge>
                )}
                {category && (
                  <Badge
                    variant="outline"
                    className="gap-1.5 border-primary/30 font-mono text-primary"
                  >
                    <CategoryIcon name={category.icon} className="size-3" />
                    {category.name}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="border-primary/30 font-mono uppercase tracking-widest"
                >
                  {course.level}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold leading-tight tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]">
                <span className="text-primary text-glow-green">&gt;</span>{" "}
                <span className="text-gradient-brand">{course.title}</span>
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                {course.subtitle}
              </p>

              {/* Rating + students */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary text-glow-green">
                    {course.rating.toFixed(1)}
                  </span>
                  <StarRating rating={course.rating} size={16} />
                  <span className="text-muted-foreground">
                    ({formatNumber(course.reviewCount)} reviews)
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="size-4 text-primary" />
                  {formatNumber(course.studentCount)} students
                </span>
              </div>

              {/* Instructor mini */}
              {instructor && (
                <div className="terminal-window inline-flex w-full items-center gap-3 p-3 sm:w-fit">
                  <Avatar className="size-10 border border-primary/30">
                    <AvatarImage src={instructor.avatar} alt={instructor.name} />
                    <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-sm font-semibold text-primary">
                        {instructor.name}
                      </span>
                      <CheckCircle2 className="size-3.5 text-primary" />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {instructor.title}
                    </span>
                  </div>
                </div>
              )}

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  { icon: BookOpen, label: "lessons", value: String(lessonCount) },
                  { icon: Clock, label: "duration", value: formatDuration(duration) },
                  { icon: Terminal, label: "level", value: course.level },
                  { icon: Globe, label: "lang", value: course.language },
                  { icon: Calendar, label: "updated", value: formatDate(course.updatedAt) },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="terminal-window flex flex-col gap-1 p-3"
                  >
                    <stat.icon className="size-4 text-primary" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {stat.label}
                    </span>
                    <span className="font-mono text-sm font-semibold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedReveal>
        </div>
      </section>

      {/* ===================== BODY ===================== */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-32 sm:px-6 lg:pb-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Left content column */}
          <div className="flex flex-col gap-12">
            {/* WHAT YOU WILL LEARN */}
            <AnimatedReveal>
              <section aria-label="What you will learn">
                <SectionTitle icon={Sparkles} label="// what_you_will_learn">
                  What You Will Learn
                </SectionTitle>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {course.benefits.map((b, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: Math.min(i * 0.04, 0.3) }}
                      className="flex items-start gap-2.5 rounded-md border border-primary/10 bg-card/40 p-3"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-sm text-foreground/90">{b}</span>
                    </motion.div>
                  ))}
                </div>
              </section>
            </AnimatedReveal>

            {/* CURRICULUM */}
            <AnimatedReveal>
              <section aria-label="Curriculum">
                <SectionTitle icon={Terminal} label="// curriculum">
                  Curriculum
                </SectionTitle>
                <div className="terminal-window p-0">
                  <div className="flex items-center justify-between border-b border-primary/15 px-4 py-3 font-mono text-xs">
                    <span className="text-primary">
                      $ tree --lessons={lessonCount}
                    </span>
                    <span className="text-muted-foreground">
                      {course.sections.length} sections · {formatDuration(duration)}
                    </span>
                  </div>
                  <Accordion type="multiple" className="w-full" defaultValue={[course.sections[0]?.id ?? ""]}>
                    {course.sections.map((section, idx) => {
                      const sectionLessons = section.lessons.length;
                      const sectionDuration = section.lessons.reduce(
                        (n, l) => n + l.durationMins,
                        0
                      );
                      return (
                        <AccordionItem
                          key={section.id}
                          value={section.id}
                          className="border-b border-primary/15 last:border-0"
                        >
                          <AccordionTrigger className="px-4 py-3 font-mono text-sm hover:bg-primary/5 hover:no-underline [&>svg]:text-primary">
                            <div className="flex flex-1 items-center gap-3 text-left">
                              <span className="grid size-7 shrink-0 place-items-center rounded border border-primary/30 bg-primary/5 font-mono text-xs text-primary">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <div className="flex min-w-0 flex-1 flex-col">
                                <span className="truncate font-semibold text-foreground">
                                  {section.title}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {sectionLessons} lessons · {formatDuration(sectionDuration)}
                                </span>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-0">
                            <ul className="flex flex-col">
                              {section.lessons.map((lesson) => {
                                const Icon = LESSON_TYPE_ICONS[lesson.type];
                                const canPlay = lesson.preview || enrolled;
                                return (
                                  <li
                                    key={lesson.id}
                                    className={cn(
                                      "flex items-center gap-3 border-t border-primary/10 px-4 py-2.5 font-mono text-sm transition-colors",
                                      canPlay
                                        ? "cursor-pointer hover:bg-primary/5"
                                        : "opacity-60"
                                    )}
                                    onClick={() => {
                                      if (canPlay) openLesson(course.slug, lesson.id);
                                    }}
                                    role={canPlay ? "button" : undefined}
                                    tabIndex={canPlay ? 0 : undefined}
                                    onKeyDown={(e) => {
                                      if (canPlay && (e.key === "Enter" || e.key === " ")) {
                                        e.preventDefault();
                                        openLesson(course.slug, lesson.id);
                                      }
                                    }}
                                  >
                                    <Icon className="size-4 shrink-0 text-primary/70" />
                                    <span className="flex-1 truncate text-foreground/90">
                                      {lesson.title}
                                    </span>
                                    {lesson.preview && !enrolled && (
                                      <Badge className="border border-primary/40 bg-primary/10 px-1.5 py-0 font-mono text-[10px] uppercase tracking-widest text-primary">
                                        preview
                                      </Badge>
                                    )}
                                    {!lesson.preview && !enrolled && (
                                      <Lock className="size-3.5 text-muted-foreground" />
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      {lesson.durationMins}m
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              </section>
            </AnimatedReveal>

            {/* REQUIREMENTS */}
            <AnimatedReveal>
              <section aria-label="Requirements">
                <SectionTitle icon={ShieldCheck} label="// requirements">
                  Requirements
                </SectionTitle>
                <div className="terminal-window p-5">
                  <ul className="flex flex-col gap-2.5 font-mono text-sm">
                    {course.requirements.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-foreground/90">
                        <span className="text-primary">&gt;</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </AnimatedReveal>

            {/* INSTRUCTOR */}
            {instructor && (
              <AnimatedReveal>
                <section aria-label="Instructor">
                  <SectionTitle icon={Skull} label="// instructor">
                    Instructor
                  </SectionTitle>
                  <Card className="terminal-window p-5 sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row">
                      <Avatar className="size-20 shrink-0 border-2 border-primary/40 glow-green">
                        <AvatarImage src={instructor.avatar} alt={instructor.name} />
                        <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-1 flex-col gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-mono text-lg font-bold text-primary text-glow-green">
                              {instructor.name}
                            </h3>
                            <CheckCircle2 className="size-4 text-primary" />
                          </div>
                          <p className="font-mono text-xs text-muted-foreground">
                            {instructor.title}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">{instructor.bio}</p>
                        <div className="flex flex-wrap gap-4 font-mono text-xs">
                          <span className="flex items-center gap-1.5">
                            <Star className="size-3.5 fill-primary text-primary" />
                            {instructor.rating.toFixed(1)} rating
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="size-3.5 text-primary" />
                            {formatNumber(instructor.students)} students
                          </span>
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="size-3.5 text-primary" />
                            {instructor.courses} courses
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {instructor.expertise.map((tag) => (
                            <Badge
                              key={tag}
                              className="border border-primary/40 bg-primary/10 font-mono text-xs text-primary"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </section>
              </AnimatedReveal>
            )}

            {/* FIELD REPORTS */}
            <AnimatedReveal>
              <section aria-label="Field reports">
                <SectionTitle icon={Search} label="// field_reports">
                  Field Reports
                </SectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[200px_1fr]">
                  {/* Rating summary */}
                  <Card className="terminal-window flex flex-col items-center justify-center gap-2 p-5">
                    <span className="font-mono text-4xl font-bold text-primary text-glow-green">
                      {course.rating.toFixed(1)}
                    </span>
                    <StarRating rating={course.rating} size={16} />
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatNumber(course.reviewCount)} reports
                    </span>
                  </Card>

                  {/* Review cards */}
                  <div className="flex flex-col gap-3">
                    {courseReviews.map((r) => (
                      <Card key={r.id} className="terminal-window p-4">
                        <div className="mb-2 flex items-center gap-3">
                          <Avatar className="size-8 border border-primary/30">
                            <AvatarImage src={r.userAvatar} alt={r.userName} />
                            <AvatarFallback>{r.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-1 flex-col">
                            <span className="font-mono text-sm font-semibold text-primary">
                              {r.userName}
                            </span>
                            <StarRating rating={r.rating} size={12} />
                          </div>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {formatDate(r.date)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">&ldquo;{r.comment}&rdquo;</p>
                      </Card>
                    ))}
                  </div>
                </div>
              </section>
            </AnimatedReveal>

            {/* FAQ */}
            <AnimatedReveal>
              <section aria-label="FAQ">
                <SectionTitle icon={FileText} label="// faq">
                  Frequently Asked Questions
                </SectionTitle>
                <Card className="terminal-window p-0">
                  <Accordion type="single" collapsible className="w-full">
                    {course.faqs.map((faq, i) => (
                      <AccordionItem
                        key={i}
                        value={`faq-${i}`}
                        className="border-b border-primary/15 last:border-0"
                      >
                        <AccordionTrigger className="px-5 py-4 font-mono text-sm text-left hover:bg-primary/5 hover:no-underline [&>svg]:text-primary">
                          <span className="flex items-start gap-2">
                            <span className="text-primary">$</span>
                            <span>{faq.q}</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-4 font-mono text-sm text-muted-foreground">
                          <span className="flex items-start gap-2">
                            <span className="text-primary">&gt;</span>
                            <span>{faq.a}</span>
                          </span>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Card>
              </section>
            </AnimatedReveal>
          </div>

          {/* Right column — sticky purchase card on desktop (hidden on mobile) */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <PurchaseCard
                course={course}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onCheckout={handleCheckout}
                onRemove={() => removeFromCart(course.id)}
                onContinue={handleContinue}
                enrolled={enrolled}
                inCart={inCart}
                progress={progress}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===================== MOBILE STICKY BOTTOM BAR ===================== */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-primary/20 bg-background/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-primary text-glow-green">
                {formatPrice(course.price, course.currency)}
              </span>
              {course.comparePrice && (
                <span className="font-mono text-xs text-muted-foreground line-through">
                  {formatPrice(course.comparePrice, course.currency)}
                </span>
              )}
              {discount > 0 && (
                <Badge className="border border-destructive/40 bg-destructive/15 font-mono text-[10px] text-destructive">
                  -{discount}%
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-1 gap-2">
            {enrolled ? (
              <Button
                onClick={handleContinue}
                className="glow-green flex-1 gap-2 font-mono uppercase tracking-widest"
                size="sm"
              >
                <PlayCircle className="size-4" />
                Continue
                <ArrowRight className="size-4" />
              </Button>
            ) : inCart ? (
              <>
                <Button
                  onClick={handleCheckout}
                  className="glow-green flex-1 gap-2 font-mono uppercase tracking-widest"
                  size="sm"
                >
                  <Terminal className="size-4" />
                  Checkout
                </Button>
                <Button
                  onClick={() => removeFromCart(course.id)}
                  variant="outline"
                  size="sm"
                  className="border-destructive/30 text-destructive"
                  aria-label="Remove from cart"
                >
                  <X className="size-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="border-primary/30 font-mono uppercase tracking-widest text-primary"
                  size="sm"
                >
                  <Terminal className="size-4" />
                  Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  className="glow-green flex-1 gap-2 font-mono uppercase tracking-widest"
                  size="sm"
                >
                  <Sparkles className="size-4" />
                  Buy Now
                  <ArrowRight className="size-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetailView;

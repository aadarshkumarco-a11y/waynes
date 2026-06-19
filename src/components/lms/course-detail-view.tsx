"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  Download,
  FileText,
  Globe2,
  GraduationCap,
  Infinity as InfinityIcon,
  Lock,
  Megaphone,
  Palette,
  PlayCircle,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Trash2,
  Users,
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
  Code2,
  BarChart3,
  Palette,
  BrainCircuit,
  Megaphone,
  Briefcase,
};

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = CATEGORY_ICONS[name] ?? Code2;
  return <Icon className={className} />;
}

const LESSON_TYPE_ICONS: Record<LessonType, LucideIcon> = {
  VIDEO: PlayCircle,
  PDF: FileText,
  TEXT: BookOpen,
  DOWNLOAD: Download,
};

// ---------------------------------------------------------------------------
// Section heading
// ---------------------------------------------------------------------------
function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{children}</h2>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Purchase card (shared, used in desktop sticky sidebar)
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
    <Card className={cn("overflow-hidden shadow-premium", className)}>
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            className="grid size-14 place-items-center rounded-full bg-white/90 text-primary shadow-lg backdrop-blur transition-transform hover:scale-105"
            aria-label="Watch preview"
          >
            <PlayCircle className="size-7" />
          </button>
        </div>
        <Badge className="absolute left-3 top-3 gap-1 bg-black/60 text-white backdrop-blur hover:bg-black/60">
          <PlayCircle className="size-3" />
          Preview this course
        </Badge>
      </div>

      <div className="flex flex-col gap-4 p-5">
        {/* Price */}
        <div className="flex flex-col gap-1">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold tracking-tight">
              {formatPrice(course.price, course.currency)}
            </span>
            {course.comparePrice && (
              <span className="pb-1 text-sm text-muted-foreground line-through">
                {formatPrice(course.comparePrice, course.currency)}
              </span>
            )}
            {discount > 0 && (
              <Badge className="mb-1 ml-auto gap-1 bg-rose-500/90 text-white hover:bg-rose-500">
                -{discount}%
              </Badge>
            )}
          </div>
          {discount > 0 && (
            <p className="text-xs text-muted-foreground">
              You save{" "}
              <span className="font-semibold text-foreground">
                {formatPrice(course.comparePrice! - course.price, course.currency)}
              </span>{" "}
              — limited time offer
            </p>
          )}
        </div>

        {/* Progress (if enrolled) */}
        {enrolled && typeof progress === "number" && (
          <div className="rounded-lg border bg-primary/5 p-3">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium text-primary">Your progress</span>
              <span className="font-semibold tabular-nums">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          {enrolled ? (
            <Button size="lg" className="w-full gap-2" onClick={onContinue}>
              <PlayCircle className="size-4" />
              {progress && progress > 0 ? "Continue Learning" : "Go to Course"}
            </Button>
          ) : inCart ? (
            <>
              <Button size="lg" className="w-full gap-2" onClick={onCheckout}>
                <ShoppingCart className="size-4" />
                In Cart — Checkout
              </Button>
              <Button size="sm" variant="ghost" className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={onRemove}>
                <Trash2 className="size-4" />
                Remove from cart
              </Button>
            </>
          ) : (
            <>
              <Button size="lg" className="w-full gap-2" onClick={onBuyNow}>
                <Sparkles className="size-4" />
                Buy Now
              </Button>
              <Button size="lg" variant="outline" className="w-full gap-2" onClick={onAddToCart}>
                <ShoppingCart className="size-4" />
                Add to Cart
              </Button>
            </>
          )}
        </div>

        {/* Money-back note */}
        {!enrolled && (
          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" />
            30-day money-back guarantee
          </p>
        )}

        <Separator />

        {/* Includes */}
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            This course includes
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
// Not found state
// ---------------------------------------------------------------------------
function CourseNotFound() {
  const navigate = useLms((s) => s.navigate);
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="grid size-20 place-items-center rounded-full bg-muted text-muted-foreground">
        <BookOpen className="size-9" />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
        Course not found
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The course you&apos;re looking for may have been removed or is no longer available. Browse our catalog to discover more courses.
      </p>
      <Button className="mt-6 gap-2" onClick={() => navigate("catalog")}>
        <ArrowLeft className="size-4" />
        Back to Catalog
      </Button>
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

  const continueLessonId =
    enrollment?.lastViewedLessonId ?? firstLesson?.id ?? null;

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

  const handleAddToCart = () => {
    addToCart(course.id);
  };
  const handleBuyNow = () => requireAuth(() => openCheckout(course.id));
  const handleCheckout = () => requireAuth(() => openCheckout(course.id));
  const handleContinue = () => {
    if (continueLessonId) {
      openLesson(course.slug, continueLessonId);
    }
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
          <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/75 to-background" />
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pt-12 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList className="text-xs">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <button onClick={() => navigate("home")} className="hover:text-foreground">
                    Home
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <button onClick={() => navigate("catalog")} className="hover:text-foreground">
                    Catalog
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <button onClick={() => navigate("catalog")} className="hover:text-foreground">
                        {category.name}
                      </button>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1 max-w-[180px] sm:max-w-xs">
                  {course.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
            {/* Left: title, rating, stats */}
            <AnimatedReveal>
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center gap-2">
                  {course.featured && (
                    <Badge className="gap-1 bg-amber-400/90 text-amber-950 hover:bg-amber-400">
                      <Star className="size-3 fill-current" />
                      Featured
                    </Badge>
                  )}
                  {category && (
                    <Badge variant="secondary" className="gap-1.5">
                      <CategoryIcon name={category.icon} className="size-3" />
                      {category.name}
                    </Badge>
                  )}
                  <Badge variant="outline" className="font-medium">
                    {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
                  </Badge>
                </div>

                <h1 className="text-3xl font-bold leading-tight tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]">
                  {course.title}
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                  {course.subtitle}
                </p>

                {/* Rating + students */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-amber-500">
                      {course.rating.toFixed(1)}
                    </span>
                    <StarRating rating={course.rating} size={16} />
                    <span className="text-muted-foreground">
                      ({formatNumber(course.reviewCount)} reviews)
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="size-4" />
                    {formatNumber(course.studentCount)} students
                  </span>
                </div>

                {/* Instructor mini */}
                {instructor && (
                  <div className="flex items-center gap-3 rounded-xl border bg-card/60 p-3 backdrop-blur sm:inline-flex sm:w-fit">
                    <Avatar className="size-10 border">
                      <AvatarImage src={instructor.avatar} alt={instructor.name} />
                      <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold">{instructor.name}</span>
                        <CheckCircle2 className="size-3.5 text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground">{instructor.title}</span>
                    </div>
                  </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                  {[
                    { icon: BookOpen, label: "Lessons", value: String(lessonCount) },
                    { icon: Clock, label: "Duration", value: formatDuration(duration) },
                    { icon: BarChart3, label: "Level", value: course.level.charAt(0) + course.level.slice(1).toLowerCase() },
                    { icon: Globe2, label: "Language", value: course.language },
                    { icon: Calendar, label: "Updated", value: formatDate(course.updatedAt) },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex flex-col gap-1 rounded-lg border bg-card/60 p-3 backdrop-blur"
                    >
                      <stat.icon className="size-4 text-primary" />
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {stat.label}
                      </span>
                      <span className="text-sm font-semibold">{stat.value}</span>
                    </div>
                  ))}
                </div>

                {/* Last updated + tags */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Sparkles className="size-3" />
                    Tags:
                  </span>
                  {course.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="px-2 py-0.5 text-[10px] font-medium">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </AnimatedReveal>

            {/* Right: mobile/tablet purchase card (desktop uses sticky) */}
            <div className="lg:hidden">
              <AnimatedReveal delay={120}>
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
              </AnimatedReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== MAIN BODY ===================== */}
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.7fr_1fr] lg:px-8">
        {/* LEFT: content sections */}
        <div className="flex min-w-0 flex-col gap-12">
          {/* What you'll learn */}
          <AnimatedReveal>
            <section aria-labelledby="learn-h">
              <SectionTitle icon={GraduationCap}>
                <span id="learn-h">What you&apos;ll learn</span>
              </SectionTitle>
              <div className="grid grid-cols-1 gap-3 rounded-2xl border bg-card/50 p-5 sm:p-6 md:grid-cols-2">
                {course.benefits.map((b, i) => (
                  <motion.div
                    key={b}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(i * 0.05, 0.4) }}
                    className="flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-sm leading-relaxed text-foreground/90">{b}</span>
                  </motion.div>
                ))}
              </div>
            </section>
          </AnimatedReveal>

          {/* Course content */}
          <AnimatedReveal>
            <section aria-labelledby="content-h">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <SectionTitle icon={BookOpen}>
                    <span id="content-h">Course content</span>
                  </SectionTitle>
                  <p className="-mt-3 text-sm text-muted-foreground">
                    {course.sections.length} sections · {lessonCount} lessons ·{" "}
                    {formatDuration(duration)} total
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border bg-card">
                <Accordion type="multiple" defaultValue={[course.sections[0]?.id].filter(Boolean) as string[]}>
                  {course.sections.map((section) => {
                    const secLessons = section.lessons.length;
                    const secDuration = section.lessons.reduce((n, l) => n + l.durationMins, 0);
                    return (
                      <AccordionItem key={section.id} value={section.id} className="border-b last:border-b-0">
                        <AccordionTrigger className="px-5 py-4 hover:no-underline">
                          <div className="flex flex-1 flex-col gap-1 pr-3 text-left">
                            <span className="text-sm font-semibold sm:text-base">{section.title}</span>
                            <span className="text-xs font-normal text-muted-foreground">
                              {secLessons} {secLessons === 1 ? "lesson" : "lessons"} · {formatDuration(secDuration)}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-0">
                          <ul className="divide-y border-t">
                            {section.lessons.map((lesson) => {
                              const Icon = LESSON_TYPE_ICONS[lesson.type];
                              const locked = !lesson.preview && !enrolled;
                              const clickable = lesson.preview || enrolled;
                              return (
                                <li key={lesson.id}>
                                  <button
                                    type="button"
                                    disabled={!clickable}
                                    onClick={() => clickable && openLesson(course.slug, lesson.id)}
                                    className={cn(
                                      "flex w-full items-center gap-3 px-5 py-3 text-left transition-colors",
                                      clickable
                                        ? "cursor-pointer hover:bg-accent/50"
                                        : "cursor-default"
                                    )}
                                  >
                                    <Icon
                                      className={cn(
                                        "size-4 shrink-0",
                                        locked ? "text-muted-foreground" : "text-primary"
                                      )}
                                    />
                                    <span className="flex-1 text-sm font-medium">
                                      {lesson.title}
                                    </span>
                                    {lesson.preview && !enrolled && (
                                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10">
                                        Preview
                                      </Badge>
                                    )}
                                    {locked && (
                                      <Lock className="size-3.5 text-muted-foreground" />
                                    )}
                                    <span className="text-xs tabular-nums text-muted-foreground">
                                      {formatDuration(lesson.durationMins)}
                                    </span>
                                  </button>
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

              {/* Quick start CTA */}
              {!enrolled && (
                <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border bg-primary/5 p-4 text-sm">
                  <Lock className="size-4 text-primary" />
                  <span className="flex-1 text-muted-foreground">
                    {course.sections.reduce((n, s) => n + s.lessons.filter((l) => l.preview).length, 0)} preview lessons available — enroll to unlock the full course.
                  </span>
                  <Button size="sm" variant="outline" onClick={handleBuyNow}>
                    Enroll Now
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              )}
            </section>
          </AnimatedReveal>

          {/* Requirements */}
          <AnimatedReveal>
            <section aria-labelledby="req-h">
              <SectionTitle icon={CheckCircle2}>
                <span id="req-h">Requirements</span>
              </SectionTitle>
              <ul className="flex flex-col gap-2.5 rounded-2xl border bg-card/50 p-5 sm:p-6">
                {course.requirements.map((r) => (
                  <li key={r} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="leading-relaxed text-foreground/90">{r}</span>
                  </li>
                ))}
              </ul>
            </section>
          </AnimatedReveal>

          {/* Description */}
          <AnimatedReveal>
            <section aria-labelledby="desc-h">
              <SectionTitle icon={BookOpen}>
                <span id="desc-h">Description</span>
              </SectionTitle>
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {course.description}
              </p>
            </section>
          </AnimatedReveal>

          {/* Instructor */}
          {instructor && (
            <AnimatedReveal>
              <section aria-labelledby="ins-h">
                <SectionTitle icon={GraduationCap}>
                  <span id="ins-h">Your Instructor</span>
                </SectionTitle>
                <Card className="overflow-hidden p-0">
                  <div className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row">
                    <div className="flex flex-col items-center gap-3 md:w-48 md:shrink-0">
                      <Avatar className="size-24 border-2 border-primary/20">
                        <AvatarImage src={instructor.avatar} alt={instructor.name} />
                        <AvatarFallback className="text-2xl">{instructor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="text-center">
                        <h3 className="text-base font-semibold">{instructor.name}</h3>
                        <p className="text-xs text-muted-foreground">{instructor.title}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{instructor.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">instructor rating</span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-4">
                      <p className="text-sm leading-relaxed text-muted-foreground">{instructor.bio}</p>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border bg-card p-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="size-3" />
                            Students
                          </div>
                          <p className="mt-1 text-sm font-semibold">{formatNumber(instructor.students)}</p>
                        </div>
                        <div className="rounded-lg border bg-card p-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <BookOpen className="size-3" />
                            Courses
                          </div>
                          <p className="mt-1 text-sm font-semibold">{instructor.courses}</p>
                        </div>
                        <div className="rounded-lg border bg-card p-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Star className="size-3" />
                            Rating
                          </div>
                          <p className="mt-1 text-sm font-semibold">{instructor.rating.toFixed(1)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Expertise
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {instructor.expertise.map((e) => (
                            <Badge key={e} variant="secondary" className="gap-1">
                              <Sparkles className="size-3 text-primary" />
                              {e}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>
            </AnimatedReveal>
          )}

          {/* Reviews */}
          <AnimatedReveal>
            <section aria-labelledby="rev-h">
              <SectionTitle icon={Star}>
                <span id="rev-h">Student Reviews</span>
              </SectionTitle>
              <Card className="p-5 sm:p-6">
                {/* Summary */}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex flex-col items-center justify-center gap-1 sm:w-44">
                    <span className="text-5xl font-bold text-amber-500">
                      {course.rating.toFixed(1)}
                    </span>
                    <StarRating rating={course.rating} size={18} />
                    <span className="text-xs text-muted-foreground">
                      {formatNumber(course.reviewCount)} reviews
                    </span>
                  </div>
                  <Separator orientation="vertical" className="hidden h-32 sm:block" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const pct =
                        star === 5 ? 78 : star === 4 ? 16 : star === 3 ? 4 : star === 2 ? 1 : 1;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="w-3 text-xs text-muted-foreground">{star}</span>
                          <Star className="size-3 fill-amber-400 text-amber-400" />
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-amber-400"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator className="my-5" />

                {/* Review cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {courseReviews.map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4 }}
                      className="flex flex-col gap-3 rounded-xl border bg-card p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarImage src={review.userAvatar} alt={review.userName} />
                          <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{review.userName}</span>
                          <div className="flex items-center gap-2">
                            <StarRating rating={review.rating} size={12} />
                            <span className="text-[11px] text-muted-foreground">
                              {formatDate(review.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    </motion.div>
                  ))}
                </div>

                {courseReviews.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No reviews yet — be the first to review this course.
                  </p>
                )}
              </Card>
            </section>
          </AnimatedReveal>

          {/* FAQs */}
          {course.faqs.length > 0 && (
            <AnimatedReveal>
              <section aria-labelledby="faq-h">
                <SectionTitle icon={ShieldCheck}>
                  <span id="faq-h">Frequently Asked Questions</span>
                </SectionTitle>
                <Card className="p-2 sm:p-3">
                  <Accordion type="single" collapsible>
                    {course.faqs.map((faq, i) => (
                      <AccordionItem key={i} value={`faq-${i}`} className="border-b last:border-b-0">
                        <AccordionTrigger className="px-3 text-left text-sm font-medium hover:no-underline">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="px-3 text-sm text-muted-foreground">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Card>
              </section>
            </AnimatedReveal>
          )}
        </div>

        {/* RIGHT: sticky purchase card (desktop only) */}
        <aside className="hidden lg:block">
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

            {/* Mini trust badges */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 rounded-lg border bg-card/50 p-3">
                <ShieldCheck className="size-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold">Secure</span>
                  <span className="text-[10px] text-muted-foreground">Verified payments</span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-card/50 p-3">
                <Award className="size-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold">Certified</span>
                  <span className="text-[10px] text-muted-foreground">On completion</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ===================== MOBILE STICKY BOTTOM BAR ===================== */}
      {!enrolled && (
        <div className="sticky bottom-0 z-30 border-t bg-background/95 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold">{formatPrice(course.price, course.currency)}</span>
                {course.comparePrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(course.comparePrice, course.currency)}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <span className="text-[10px] font-medium text-rose-500">
                  {discount}% off
                </span>
              )}
            </div>
            <div className="ml-auto flex flex-1 items-center gap-2">
              {inCart ? (
                <>
                  <Button className="flex-1 gap-2" size="sm" onClick={handleCheckout}>
                    <ShoppingCart className="size-4" />
                    Checkout
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => removeFromCart(course.id)}
                    aria-label="Remove from cart"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleAddToCart}>
                    <ShoppingCart className="size-4" />
                    <span className="sr-only sm:not-sr-only">Cart</span>
                  </Button>
                  <Button className="flex-1 gap-2" size="sm" onClick={handleBuyNow}>
                    <Sparkles className="size-4" />
                    Buy Now
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetailView;

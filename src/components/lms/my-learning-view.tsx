"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  PlayCircle,
  Search,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLms } from "@/lib/store";
import { courseMap, instructorMap } from "@/lib/data/catalog";
import { courseStats } from "@/lib/data/catalog";
import {
  formatDateTime,
  formatDuration,
  formatPrice,
  timeAgo,
} from "@/lib/format";
import type { Enrollment, Order, OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type FilterKey = "all" | "in-progress" | "completed";

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30",
  APPROVED: "bg-primary/15 text-primary border-primary/30",
  REJECTED: "bg-destructive/15 text-destructive border-destructive/30",
  REFUNDED: "bg-muted text-muted-foreground border-border",
};

export function MyLearningView() {
  const user = useLms((s) => s.user);
  const enrollments = useLms((s) => s.enrollments);
  const orders = useLms((s) => s.orders);
  const certificates = useLms((s) => s.certificates);
  const openLesson = useLms((s) => s.openLesson);
  const openCourse = useLms((s) => s.openCourse);
  const openCertificate = useLms((s) => s.openCertificate);
  const navigate = useLms((s) => s.navigate);
  const setAuthOpen = useLms((s) => s.setAuthOpen);

  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const myEnrollments = useMemo<Enrollment[]>(
    () => (user ? enrollments.filter((e) => e.userId === user.id) : []),
    [user, enrollments]
  );
  const myOrders = useMemo<Order[]>(
    () => (user ? orders.filter((o) => o.userEmail === user.email) : []),
    [user, orders]
  );
  const myCerts = useMemo(
    () => (user ? certificates.filter((c) => c.userId === user.id) : []),
    [user, certificates]
  );

  const stats = useMemo(() => {
    const enrolled = myEnrollments.length;
    const completed = myEnrollments.filter((e) => e.completed).length;
    const inProgress = enrolled - completed;
    return { enrolled, completed, inProgress, certs: myCerts.length };
  }, [myEnrollments, myCerts]);

  const filtered = useMemo(() => {
    return myEnrollments
      .filter((e) => {
        if (filter === "in-progress") return !e.completed;
        if (filter === "completed") return e.completed;
        return true;
      })
      .filter((e) => {
        if (!query.trim()) return true;
        const course = courseMap[e.courseId];
        if (!course) return false;
        return course.title.toLowerCase().includes(query.toLowerCase());
      })
      .sort((a, b) => {
        // active first, then lastViewedAt desc
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return (
          new Date(b.lastViewedAt ?? b.enrolledAt).getTime() -
          new Date(a.lastViewedAt ?? a.enrolledAt).getTime()
        );
      });
  }, [myEnrollments, filter, query]);

  // ---------------- NOT LOGGED IN ----------------
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center"
      >
        <div className="mb-5 flex size-20 items-center justify-center rounded-full gradient-brand shadow-glow">
          <BookOpen className="size-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Sign in to view your learning
        </h2>
        <p className="mt-2 text-muted-foreground">
          Track your enrolled courses, lesson progress, certificates, and orders — all
          in one place.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={() => setAuthOpen(true, "login")}>
            Sign in
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("catalog")}>
            <Compass className="size-4" />
            Browse catalog
          </Button>
        </div>
      </motion.div>
    );
  }

  // ---------------- EMPTY ----------------
  if (myEnrollments.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Header stats={stats} />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-10 flex flex-col items-center rounded-2xl border border-dashed bg-muted/20 p-12 text-center"
        >
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <BookOpen className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No courses yet</h3>
          <p className="mt-1 max-w-sm text-muted-foreground">
            You haven&apos;t enrolled in any courses. Explore our catalog and start
            your learning journey today.
          </p>
          <Button className="mt-5" size="lg" onClick={() => navigate("catalog")}>
            <Compass className="size-4" />
            Explore the catalog
          </Button>
        </motion.div>

        {myOrders.length > 0 && <OrdersList orders={myOrders} />}
      </div>
    );
  }

  // ---------------- MAIN ----------------
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <Header stats={stats} />

      {/* Filters + search */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
          <TabsList>
            <TabsTrigger value="all">
              All <span className="ml-1 text-xs opacity-70">{stats.enrolled}</span>
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress <span className="ml-1 text-xs opacity-70">{stats.inProgress}</span>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed <span className="ml-1 text-xs opacity-70">{stats.completed}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your courses…"
            className="pl-9"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed bg-muted/20 p-10 text-center text-sm text-muted-foreground">
          No courses match your filter.
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((enr, i) => {
            const course = courseMap[enr.courseId];
            if (!course) return null;
            return (
              <LearningCard
                key={enr.id}
                enrollment={enr}
                index={i}
                hasCertificate={myCerts.some((c) => c.courseId === enr.courseId)}
                onContinue={(lessonId) =>
                  openLesson(course.slug, lessonId ?? enr.lastViewedLessonId ?? "")
                }
                onCourse={() => openCourse(course.slug)}
                onCertificate={(certId) => openCertificate(certId)}
              />
            );
          })}
        </div>
      )}

      {/* Orders */}
      {myOrders.length > 0 && <OrdersList orders={myOrders} />}
    </div>
  );
}

export default MyLearningView;

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
function Header({
  stats,
}: {
  stats: { enrolled: number; completed: number; inProgress: number; certs: number };
}) {
  const cards = [
    {
      label: "Enrolled",
      value: stats.enrolled,
      icon: BookOpen,
      tint: "text-primary",
    },
    {
      label: "In progress",
      value: stats.inProgress,
      icon: TrendingUp,
      tint: "text-amber-500",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      tint: "text-primary",
    },
    {
      label: "Certificates",
      value: stats.certs,
      icon: Award,
      tint: "text-amber-500",
    },
  ];
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">My Learning</h1>
      <p className="mt-1 text-muted-foreground">
        Pick up where you left off and keep your streak alive.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="glass flex items-center gap-3 p-4">
              <div className={cn("flex size-10 items-center justify-center rounded-lg bg-muted/60", c.tint)}>
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums leading-none">{c.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.label}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Learning card
// ---------------------------------------------------------------------------
function LearningCard({
  enrollment,
  index,
  hasCertificate,
  onContinue,
  onCourse,
  onCertificate,
}: {
  enrollment: Enrollment;
  index: number;
  hasCertificate: boolean;
  onContinue: (lessonId?: string) => void;
  onCourse: () => void;
  onCertificate: (verifyId: string) => void;
}) {
  const course = courseMap[enrollment.courseId];
  const instructor = instructorMap[course.instructorId];
  const { lessonCount, duration } = courseStats(course);
  const cert = useLms((s) =>
    s.certificates.find(
      (c) => c.userId === enrollment.userId && c.courseId === enrollment.courseId
    )
  );
  const pct = enrollment.progress;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -4 }}
    >
      <Card className="group flex h-full flex-col overflow-hidden p-0 shadow-premium transition-shadow hover:shadow-glow">
        {/* Thumbnail */}
        <button
          onClick={onCourse}
          className="relative block aspect-video w-full overflow-hidden bg-muted"
          aria-label={`Open ${course.title}`}
        >
          <img
            src={course.thumbnail}
            alt={course.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute left-3 top-3">
            {enrollment.completed ? (
              <Badge className="bg-primary/90 text-primary-foreground hover:bg-primary">
                <CheckCircle2 className="size-3" /> Completed
              </Badge>
            ) : (
              <Badge className="bg-amber-400/90 text-amber-950 hover:bg-amber-400">
                <Clock className="size-3" /> In progress
              </Badge>
            )}
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
            <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 backdrop-blur">
              <PlayCircle className="size-3" />
              {lessonCount} lessons
            </span>
            <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 backdrop-blur">
              <Clock className="size-3" />
              {formatDuration(duration)}
            </span>
          </div>
        </button>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          <button
            onClick={onCourse}
            className="text-left text-base font-semibold leading-snug line-clamp-2 transition-colors hover:text-primary"
          >
            {course.title}
          </button>

          {instructor && (
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage src={instructor.avatar} alt={instructor.name} />
                <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{instructor.name}</span>
            </div>
          )}

          {/* Progress */}
          <div className="mt-1">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium">
                {enrollment.completed ? "Completed" : "Progress"}
              </span>
              <span className="tabular-nums text-muted-foreground">{pct}%</span>
            </div>
            <Progress
              value={pct}
              className={cn(enrollment.completed && "[&_>div]:bg-primary")}
            />
          </div>

          {/* Last viewed */}
          {enrollment.lastViewedAt && !enrollment.completed && (
            <p className="text-xs text-muted-foreground">
              Last viewed {timeAgo(enrollment.lastViewedAt)}
            </p>
          )}

          {/* Actions */}
          <div className="mt-auto flex flex-wrap items-center gap-2 border-t pt-3">
            {enrollment.completed ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onContinue()}
                >
                  <PlayCircle className="size-4" />
                  Review
                </Button>
                {cert && (
                  <Button
                    size="sm"
                    onClick={() => onCertificate(cert.verifyId)}
                  >
                    <Award className="size-4" />
                    Certificate
                  </Button>
                )}
              </>
            ) : (
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onContinue(enrollment.lastViewedLessonId)}
              >
                <PlayCircle className="size-4" />
                Continue
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Orders list (mini-section)
// ---------------------------------------------------------------------------
function OrdersList({ orders }: { orders: Order[] }) {
  const sorted = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return (
    <div className="mt-12">
      <div className="mb-4 flex items-center gap-2">
        <FileText className="size-5 text-primary" />
        <h2 className="text-xl font-semibold">Your orders</h2>
        <Badge variant="secondary" className="font-medium">
          {orders.length}
        </Badge>
      </div>
      <Card className="overflow-hidden p-0 shadow-premium">
        <div className="divide-y">
          {sorted.map((o) => (
            <div
              key={o.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                  <img
                    src={o.courseThumbnail}
                    alt={o.courseTitle}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-semibold">{o.courseTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-mono">{o.orderNumber}</span>
                    <span className="mx-1.5">·</span>
                    {formatDateTime(o.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatPrice(o.finalAmount, o.currency)}
                  </p>
                  {o.discount > 0 && (
                    <p className="text-xs text-primary">
                      saved {formatPrice(o.discount, o.currency)}
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={cn("font-medium capitalize", ORDER_STATUS_STYLES[o.status])}
                >
                  {o.status.toLowerCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

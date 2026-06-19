"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  PlayCircle,
  Search,
  Skull,
  Terminal,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLms } from "@/lib/store";
import { courseMap, instructorMap, courseStats } from "@/lib/data/catalog";
import { formatDateTime, formatDuration, formatPrice, timeAgo } from "@/lib/format";
import type { Enrollment, Order, OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type FilterKey = "all" | "in-progress" | "completed";

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "border-amber-500/40 bg-amber-500/10 text-amber-500",
  APPROVED: "border-primary/40 bg-primary/10 text-primary",
  REJECTED: "border-destructive/40 bg-destructive/10 text-destructive",
  REFUNDED: "border-violet-500/40 bg-violet-500/10 text-violet-400",
};

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  REFUNDED: "REFUNDED",
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
      <div className="relative mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="terminal-window px-8 py-12"
        >
          <div className="mb-4 flex size-16 items-center justify-center rounded-full border border-destructive/40 bg-destructive/5 text-destructive glow-red">
            <Lock className="size-9" />
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-destructive">
            error 403
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-glow-red sm:text-3xl">
            ACCESS DENIED
          </h1>
          <p className="mt-3 max-w-md font-mono text-sm text-muted-foreground">
            <span className="text-destructive">$</span> authentication required
            to access the arsenal. sign in to view your enrolled courses,
            progress, and certificates.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              onClick={() => setAuthOpen(true, "login")}
              className="glow-green gap-2 font-mono uppercase tracking-widest"
            >
              <Terminal className="size-4" />
              AUTHENTICATE
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("catalog")}
              className="border-primary/30 font-mono uppercase tracking-widest text-primary"
            >
              <Search className="size-4" />
              browse_catalog
            </Button>
          </div>
        </motion.div>
      </div>
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
          className="terminal-window mt-10 flex flex-col items-center px-6 py-16 text-center"
        >
          <div className="mb-4 flex size-16 items-center justify-center rounded-full border border-primary/30 bg-primary/5 text-primary">
            <Terminal className="size-8" />
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            $ scan complete
          </p>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-glow-green">
            {"// NO_COURSES_FOUND"}
          </h3>
          <p className="mt-2 max-w-sm font-mono text-sm text-muted-foreground">
            <span className="text-primary">$</span> your arsenal is empty.
            browse the catalog and acquire your first exploit course.
          </p>
          <Button
            className="mt-5 gap-2 font-mono uppercase tracking-widest glow-green"
            size="lg"
            onClick={() => navigate("catalog")}
          >
            <Search className="size-4" />
            &gt; browse_catalog
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
          <TabsList className="border border-primary/20 bg-card/40">
            <TabsTrigger
              value="all"
              className="font-mono text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              All <span className="ml-1 opacity-70">{stats.enrolled}</span>
            </TabsTrigger>
            <TabsTrigger
              value="in-progress"
              className="font-mono text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Active <span className="ml-1 opacity-70">{stats.inProgress}</span>
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="font-mono text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Cleared <span className="ml-1 opacity-70">{stats.completed}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-72">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-primary">
            &gt;
          </span>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="grep arsenal..."
            aria-label="Search your courses"
            className="border-primary/30 bg-card/40 pl-7 font-mono text-sm placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="terminal-window mt-10 p-10 text-center font-mono text-sm text-muted-foreground">
          <span className="text-destructive">!</span> no courses match the
          current filter.
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((enr, i) => {
            const course = courseMap[enr.courseId];
            if (!course) return null;
            const cert = myCerts.find((c) => c.courseId === enr.courseId);
            return (
              <LearningCard
                key={enr.id}
                enrollment={enr}
                index={i}
                certificate={cert}
                onContinue={(lessonId) =>
                  openLesson(course.slug, lessonId ?? enr.lastViewedLessonId ?? "")
                }
                onCourse={() => openCourse(course.slug)}
                onCertificate={(verifyId) => openCertificate(verifyId)}
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
// Header — MY_ARSENAL
// ---------------------------------------------------------------------------
function Header({
  stats,
}: {
  stats: { enrolled: number; completed: number; inProgress: number; certs: number };
}) {
  const cards = [
    { label: "enrolled", value: stats.enrolled, icon: BookOpen, tint: "text-primary" },
    { label: "in_progress", value: stats.inProgress, icon: TrendingUp, tint: "text-amber-500" },
    { label: "completed", value: stats.completed, icon: CheckCircle2, tint: "text-primary" },
    { label: "certificates", value: stats.certs, icon: Award, tint: "text-amber-500" },
  ];
  return (
    <div>
      <Badge
        variant="outline"
        className="mb-3 border-primary/40 bg-primary/5 font-mono text-xs uppercase tracking-widest text-primary"
      >
        <Skull className="size-3" />
        waynes // dashboard
      </Badge>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        <span className="text-primary text-glow-green">&gt;</span>{" "}
        <span className="text-gradient-brand">MY_ARSENAL</span>
        <span className="cursor-blink" />
      </h1>
      <p className="mt-1 font-mono text-sm text-muted-foreground">
        <span className="text-primary">$</span> your acquired exploits,
        progress tracker, and earned certificates.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="terminal-window flex items-center gap-3 p-4">
              <div
                className={cn(
                  "grid size-10 place-items-center rounded-md border border-primary/20 bg-primary/5",
                  c.tint
                )}
              >
                <Icon className="size-5" />
              </div>
              <div>
                <p className="font-mono text-2xl font-bold tabular-nums leading-none text-glow-green">
                  {String(c.value).padStart(2, "0")}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {c.label}
                </p>
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
  certificate,
  onContinue,
  onCourse,
  onCertificate,
}: {
  enrollment: Enrollment;
  index: number;
  certificate?: { verifyId: string } | undefined;
  onContinue: (lessonId?: string) => void;
  onCourse: () => void;
  onCertificate: (verifyId: string) => void;
}) {
  const course = courseMap[enrollment.courseId];
  const instructor = instructorMap[course.instructorId];
  const { lessonCount, duration } = courseStats(course);
  const pct = enrollment.progress;
  const completedLessons = Math.round((pct / 100) * lessonCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -4 }}
    >
      <Card className="terminal-window group flex h-full flex-col overflow-hidden p-0 transition-shadow hover:glow-green">
        {/* Window header */}
        <div className="flex items-center gap-2 border-b border-primary/15 bg-primary/5 px-3 py-1.5">
          <div className="flex gap-1.5">
            <span className="size-2 rounded-full bg-destructive/70" />
            <span className="size-2 rounded-full bg-amber-500/70" />
            <span className="size-2 rounded-full bg-primary/70" />
          </div>
          <span className="ml-1 font-mono text-[10px] uppercase tracking-widest text-primary/80">
            {enrollment.completed ? "cleared" : "active"}
          </span>
        </div>

        {/* Thumbnail with scanlines */}
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="scanlines pointer-events-none absolute inset-0" />
          <div className="absolute left-3 top-3">
            {enrollment.completed ? (
              <Badge className="border border-primary/40 bg-primary/20 font-mono text-[10px] uppercase tracking-widest text-primary backdrop-blur glow-green">
                <CheckCircle2 className="size-3" /> COMPLETED ✓
              </Badge>
            ) : (
              <Badge className="border border-amber-500/40 bg-amber-500/20 font-mono text-[10px] uppercase tracking-widest text-amber-500 backdrop-blur">
                <Clock className="size-3" /> IN PROGRESS
              </Badge>
            )}
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[11px] text-white">
            <span className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur">
              <PlayCircle className="size-3 text-primary" />
              {lessonCount} lessons
            </span>
            <span className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur">
              <Clock className="size-3 text-primary" />
              {formatDuration(duration)}
            </span>
          </div>
        </button>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          <button
            onClick={onCourse}
            className="text-left font-mono text-base font-semibold leading-snug line-clamp-2 transition-colors hover:text-primary"
          >
            {course.title}
          </button>

          {instructor && (
            <div className="flex items-center gap-2">
              <Avatar className="size-6 border border-primary/30">
                <AvatarImage src={instructor.avatar} alt={instructor.name} />
                <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-mono text-xs text-muted-foreground">
                <span className="text-primary">@</span> {instructor.name}
              </span>
            </div>
          )}

          {/* Progress */}
          <div className="mt-1">
            <div className="mb-1.5 flex items-center justify-between font-mono text-xs">
              <span className="text-muted-foreground">
                <span className="text-primary">$</span> progress
              </span>
              <span className="tabular-nums text-primary">
                {completedLessons}/{lessonCount} · {pct}%
              </span>
            </div>
            <Progress
              value={pct}
              className={cn(
                "h-1.5 [&>div]:bg-primary",
                enrollment.completed && "[&>div]:glow-green"
              )}
            />
          </div>

          {/* Last viewed */}
          {enrollment.lastViewedAt && !enrollment.completed && (
            <p className="font-mono text-[11px] text-muted-foreground">
              <span className="text-primary">&gt;</span> last active{" "}
              {timeAgo(enrollment.lastViewedAt)}
            </p>
          )}

          {/* Actions */}
          <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-primary/15 pt-3">
            {enrollment.completed ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2 border-primary/30 font-mono uppercase tracking-widest text-primary"
                  onClick={() => onContinue()}
                >
                  <PlayCircle className="size-4" />
                  REVIEW
                </Button>
                {certificate && (
                  <Button
                    size="sm"
                    onClick={() => onCertificate(certificate.verifyId)}
                    className="glow-green gap-2 font-mono uppercase tracking-widest"
                  >
                    <Award className="size-4" />
                    CERT
                  </Button>
                )}
              </>
            ) : (
              <Button
                size="sm"
                className="glow-green flex-1 gap-2 font-mono uppercase tracking-widest"
                onClick={() => onContinue(enrollment.lastViewedLessonId)}
              >
                <Zap className="size-4" />
                CONTINUE
                <Check className="size-4" />
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
      <div className="mb-4 flex items-center gap-2 border-b border-primary/15 pb-3">
        <FileText className="size-5 text-primary" />
        <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-primary">
          {"// transaction_log"}
        </h2>
        <Badge
          variant="outline"
          className="border-primary/30 font-mono text-xs text-primary"
        >
          {orders.length}
        </Badge>
      </div>
      <Card className="terminal-window overflow-hidden p-0">
        <div className="divide-y divide-primary/10">
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
                  <div className="scanlines pointer-events-none absolute inset-0" />
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-1 font-mono text-sm font-semibold">
                    {o.courseTitle}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    <span className="text-primary">$</span> {o.orderNumber}
                    <span className="mx-1.5 text-primary/40">|</span>
                    {formatDateTime(o.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-primary">
                    {formatPrice(o.finalAmount, o.currency)}
                  </p>
                  {o.discount > 0 && (
                    <p className="font-mono text-xs text-primary">
                      <span className="text-muted-foreground">saved</span>{" "}
                      {formatPrice(o.discount, o.currency)}
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-widest",
                    ORDER_STATUS_STYLES[o.status]
                  )}
                >
                  {ORDER_STATUS_LABEL[o.status]}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

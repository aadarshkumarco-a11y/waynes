"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlignLeft,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Download,
  FileText,
  FileType,
  List,
  Lock,
  Menu,
  NotebookPen,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLms } from "@/lib/store";
import {
  courseBySlug,
  instructorMap,
} from "@/lib/data/catalog";
import { formatDuration, timeAgo } from "@/lib/format";
import { useCompletedLessons } from "@/hooks/use-completed-lessons";
import { VideoPlayer } from "@/components/lms/video-player";
import {
  CurriculumSidebar,
  CurriculumSidebarCollapsible,
} from "@/components/lms/curriculum-sidebar";
import { NotesPanel } from "@/components/lms/notes-panel";
import type {
  Bookmark,
  Course,
  Instructor,
  Lesson,
  LessonType,
  Section,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
interface FlatLesson {
  lesson: Lesson;
  section: Section;
  index: number; // global index across sections
}

function flatten(course: Course): FlatLesson[] {
  const out: FlatLesson[] = [];
  let idx = 0;
  for (const section of course.sections) {
    for (const lesson of section.lessons) {
      out.push({ lesson, section, index: idx });
      idx += 1;
    }
  }
  return out;
}

function lessonIcon(type: LessonType) {
  switch (type) {
    case "VIDEO":
      return PlayCircle;
    case "PDF":
      return FileText;
    case "DOWNLOAD":
      return Download;
    case "TEXT":
      return FileType;
    default:
      return FileText;
  }
}

function fmtTimecode(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function LearnView() {
  const courseSlug = useLms((s) => s.courseSlug);
  const lessonId = useLms((s) => s.lessonId);
  const user = useLms((s) => s.user);
  const openCourse = useLms((s) => s.openCourse);
  const openLesson = useLms((s) => s.openLesson);
  const setLastViewed = useLms((s) => s.setLastViewed);
  const markLessonComplete = useLms((s) => s.markLessonComplete);
  const toggleBookmark = useLms((s) => s.toggleBookmark);
  const bookmarks = useLms((s) => s.bookmarks);
  const setAuthOpen = useLms((s) => s.setAuthOpen);
  const openCheckout = useLms((s) => s.openCheckout);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [tab, setTab] = useState("overview");
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  // Track the lesson we've registered as "last viewed" so we only fire
  // setLastViewed once per lesson change (and avoid setState-in-effect).
  const [registeredLessonId, setRegisteredLessonId] = useState<string | null>(
    null
  );

  const course = courseSlug ? courseBySlug[courseSlug] : undefined;

  const flat = useMemo(() => (course ? flatten(course) : []), [course]);

  const currentEntry = useMemo(() => {
    if (!flat.length) return null;
    if (lessonId) {
      const found = flat.find((f) => f.lesson.id === lessonId);
      if (found) return found;
    }
    // Default: enrollment lastViewedLessonId or first lesson
    if (course && user) {
      const enr = useLms.getState().getEnrollment(course.id);
      if (enr?.lastViewedLessonId) {
        const last = flat.find((f) => f.lesson.id === enr.lastViewedLessonId);
        if (last) return last;
      }
    }
    return flat[0];
  }, [flat, lessonId, course, user]);

  // When the lesson changes, reset transient UI state and register last-viewed
  // via during-render adjustment (avoids setState-in-effect cascading renders).
  if (
    currentEntry &&
    registeredLessonId !== currentEntry.lesson.id
  ) {
    setRegisteredLessonId(currentEntry.lesson.id);
    setCurrentVideoTime(0);
    setTab("overview");
    if (course && user) {
      setLastViewed(course.id, currentEntry.lesson.id);
    }
  }

  // Scroll to top on lesson change.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentEntry?.lesson.id]);

  const { completed } = useCompletedLessons(
    user?.id,
    course?.id ?? ""
  );

  const totalLessons = flat.length;
  const progressPct = totalLessons
    ? Math.round((completed.length / totalLessons) * 100)
    : 0;

  // -------------------------------------------------------------------------
  // Guard: missing course
  // -------------------------------------------------------------------------
  if (!course || !currentEntry) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <FileText className="size-7" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Lesson not found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The lesson you’re looking for doesn’t exist or has been moved.
          </p>
        </div>
        <Button onClick={() => openCourse(courseSlug ?? "")} variant="outline">
          <ArrowLeft className="size-4" />
          Back to course
        </Button>
      </div>
    );
  }

  const { lesson, section } = currentEntry;
  const flatIndex = currentEntry.index;
  const prevEntry = flatIndex > 0 ? flat[flatIndex - 1] : null;
  const nextEntry = flatIndex < flat.length - 1 ? flat[flatIndex + 1] : null;

  const enrolled = user ? useLms.getState().isEnrolled(course.id) : false;
  const canAccess = enrolled || lesson.preview;
  const isDone = completed.includes(lesson.id);
  const isBookmarked = bookmarks.some((b) => b.lessonId === lesson.id);
  const instructor = instructorMap[course.instructorId];

  const courseBookmarks = bookmarks.filter((b) => b.courseId === course.id);
  const downloadableLessons = flat
    .map((f) => f.lesson)
    .filter((l) => l.type === "DOWNLOAD" || l.type === "PDF");

  const handleSelectLesson = (lid: string) => {
    openLesson(course.slug, lid);
    setMobileSidebarOpen(false);
  };

  const handleMarkComplete = () => {
    if (!user) {
      setAuthOpen(true, "login");
      return;
    }
    markLessonComplete(course.id, lesson.id);
  };

  const handleCompleteAndNext = () => {
    if (!user) {
      setAuthOpen(true, "login");
      return;
    }
    markLessonComplete(course.id, lesson.id);
    if (nextEntry) {
      openLesson(course.slug, nextEntry.lesson.id);
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-2 px-3 sm:h-16 sm:px-5">
          {/* Mobile: open curriculum */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open curriculum"
          >
            <Menu className="size-5" />
          </Button>

          <button
            type="button"
            onClick={() => openCourse(course.slug)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Course</span>
          </button>

          <div className="hidden min-w-0 items-center gap-2 text-sm sm:flex">
            <span className="truncate font-medium text-foreground">
              {course.title}
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-muted-foreground">{lesson.title}</span>
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {/* Bookmark */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    if (!user) {
                      setAuthOpen(true, "login");
                      return;
                    }
                    toggleBookmark(lesson.id, course.id, Math.floor(currentVideoTime));
                  }}
                >
                  {isBookmarked ? (
                    <>
                      <BookmarkCheck className="size-4 text-primary" />
                      <span className="hidden sm:inline">Bookmarked</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="size-4" />
                      <span className="hidden sm:inline">Bookmark</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isBookmarked ? "Remove bookmark" : "Bookmark this lesson"}
              </TooltipContent>
            </Tooltip>

            {/* Mark complete */}
            <Button
              size="sm"
              variant={isDone ? "secondary" : "default"}
              className="gap-1.5"
              onClick={handleMarkComplete}
            >
              {isDone ? (
                <>
                  <CheckCircle2 className="size-4 text-primary" />
                  <span className="hidden sm:inline">Completed</span>
                </>
              ) : (
                <>
                  <Circle className="size-4" />
                  <span className="hidden sm:inline">Mark complete</span>
                  <span className="sm:hidden">Complete</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile lesson title row */}
        <div className="flex items-center gap-2 px-3 pb-2 sm:hidden">
          <span className="truncate text-xs text-muted-foreground">
            {course.title}
          </span>
          <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
          <span className="truncate text-xs font-medium">{lesson.title}</span>
        </div>
      </header>

      {/* Main grid */}
      <div className="mx-auto max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* LEFT — player + tabs */}
          <main className="min-w-0">
            <LessonContent
              lesson={lesson}
              section={section}
              course={course}
              canAccess={canAccess}
              enrolled={enrolled}
              currentVideoTime={currentVideoTime}
              onProgress={(t) => {
                setCurrentVideoTime(t);
                if (user) setLastViewed(course.id, lesson.id);
              }}
              onComplete={handleCompleteAndNext}
              onPrev={
                prevEntry
                  ? () => openLesson(course.slug, prevEntry.lesson.id)
                  : undefined
              }
              onNext={
                nextEntry
                  ? () => openLesson(course.slug, nextEntry.lesson.id)
                  : undefined
              }
              hasPrev={Boolean(prevEntry)}
              hasNext={Boolean(nextEntry)}
              onEnroll={() =>
                user ? openCheckout(course.id) : setAuthOpen(true, "signup")
              }
              onAuth={() => setAuthOpen(true, "login")}
            />

            {/* Tabs below */}
            <Tabs
              value={tab}
              onValueChange={setTab}
              className="mt-5"
            >
              <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-card p-1 shadow-premium sm:w-auto">
                <TabsTrigger value="overview" className="gap-1.5">
                  <AlignLeft className="size-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="notes" className="gap-1.5">
                  <NotebookPen className="size-4" />
                  Notes
                </TabsTrigger>
                <TabsTrigger value="resources" className="gap-1.5">
                  <Download className="size-4" />
                  Resources
                  {downloadableLessons.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-4 px-1 text-[10px]"
                    >
                      {downloadableLessons.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="bookmarks" className="gap-1.5">
                  <Bookmark className="size-4" />
                  Bookmarks
                  {courseBookmarks.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-4 px-1 text-[10px]"
                    >
                      {courseBookmarks.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <OverviewTab
                  course={course}
                  lesson={lesson}
                  section={section}
                  instructor={instructor}
                />
              </TabsContent>

              <TabsContent value="notes" className="mt-4">
                {user ? (
                  <div className="h-[520px]">
                    <NotesPanel
                      courseId={course.id}
                      lessonId={lesson.id}
                      currentTimestamp={currentVideoTime}
                    />
                  </div>
                ) : (
                  <EmptyAuthCard
                    title="Sign in to take notes"
                    description="Capture timestamps, write insights, and revisit them anytime — synchronized with your lesson progress."
                    action="Sign in"
                    onAction={() => setAuthOpen(true, "login")}
                  />
                )}
              </TabsContent>

              <TabsContent value="resources" className="mt-4">
                <ResourcesTab
                  lessons={downloadableLessons}
                  canAccess={enrolled}
                  onSelect={(lid) => openLesson(course.slug, lid)}
                />
              </TabsContent>

              <TabsContent value="bookmarks" className="mt-4">
                <BookmarksTab
                  course={course}
                  bookmarks={courseBookmarks}
                  onSelect={handleSelectLesson}
                />
              </TabsContent>
            </Tabs>

            {/* Prev / Next nav */}
            <PrevNextNav
              prev={prevEntry}
              next={nextEntry}
              onPrev={
                prevEntry
                  ? () => openLesson(course.slug, prevEntry.lesson.id)
                  : undefined
              }
              onNext={
                nextEntry
                  ? () => openLesson(course.slug, nextEntry.lesson.id)
                  : undefined
              }
              onCompleteNext={
                nextEntry && !isDone ? handleCompleteAndNext : undefined
              }
            />
          </main>

          {/* RIGHT — curriculum sidebar (sticky on lg) */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)]">
              <CurriculumSidebar
                course={course}
                currentLessonId={lesson.id}
                completedIds={completed}
                onSelect={handleSelectLesson}
                progressPct={progressPct}
                className="max-h-[calc(100vh-6rem)]"
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile curriculum sheet */}
      <CurriculumSidebarCollapsible
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
        course={course}
        currentLessonId={lesson.id}
        completedIds={completed}
        onSelect={handleSelectLesson}
        progressPct={progressPct}
        compact
      />
    </div>
  );
}

// ===========================================================================
// Sub-components
// ===========================================================================

// -------------------------------------------------------------------------
// Lesson content (video / pdf / text / download / locked)
// -------------------------------------------------------------------------
function LessonContent({
  lesson,
  section,
  course,
  canAccess,
  enrolled,
  currentVideoTime: _currentVideoTime,
  onProgress,
  onComplete,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  onEnroll,
  onAuth,
}: {
  lesson: Lesson;
  section: Section;
  course: Course;
  canAccess: boolean;
  enrolled: boolean;
  currentVideoTime: number;
  onProgress: (t: number) => void;
  onComplete?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  onEnroll: () => void;
  onAuth: () => void;
}) {
  // Locked
  if (!canAccess) {
    return (
      <LockedVideo
        course={course}
        lesson={lesson}
        enrolled={enrolled}
        onEnroll={onEnroll}
        onAuth={onAuth}
      />
    );
  }

  if (lesson.type === "VIDEO") {
    return (
      <VideoPlayer
        src={lesson.videoUrl}
        poster={course.thumbnail}
        title={lesson.title}
        onProgress={onProgress}
        onComplete={onComplete}
        onPrev={onPrev}
        onNext={onNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />
    );
  }

  if (lesson.type === "PDF") {
    return (
      <PdfResourceCard
        lesson={lesson}
        section={section}
        course={course}
        onPrev={onPrev}
        onNext={onNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />
    );
  }

  if (lesson.type === "DOWNLOAD") {
    return (
      <DownloadResourceCard
        lesson={lesson}
        section={section}
        course={course}
        onPrev={onPrev}
        onNext={onNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />
    );
  }

  // TEXT
  return (
    <TextLessonCard
      lesson={lesson}
      section={section}
      course={course}
      onPrev={onPrev}
      onNext={onNext}
      hasPrev={hasPrev}
      hasNext={hasNext}
    />
  );
}

// -------------------------------------------------------------------------
// Locked state
// -------------------------------------------------------------------------
function LockedVideo({
  course,
  lesson,
  enrolled,
  onEnroll,
  onAuth,
}: {
  course: Course;
  lesson: Lesson;
  enrolled: boolean;
  onEnroll: () => void;
  onAuth: () => void;
}) {
  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-zinc-950 shadow-premium">
      <img
        src={course.thumbnail}
        alt=""
        className="absolute inset-0 size-full object-cover opacity-25 blur-md"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/60" />
      <div className="relative z-10 flex max-w-md flex-col items-center gap-3 px-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur">
          <Lock className="size-7" />
        </div>
        <h2 className="text-lg font-semibold text-white sm:text-xl">
          Enroll to access this lesson
        </h2>
        <p className="text-sm text-white/70">
          {lesson.title} is part of <strong>{course.title}</strong>. Enroll now
          to unlock every lesson, downloadable resources, notes & a verifiable
          certificate.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Button onClick={onEnroll} className="gap-1.5">
            {enrolled ? "Resume learning" : "Enroll now"}
          </Button>
          <Button
            variant="outline"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            onClick={onAuth}
          >
            Sign in
          </Button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// PDF resource
// -------------------------------------------------------------------------
function PdfResourceCard({
  lesson,
  section,
  course,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  lesson: Lesson;
  section: Section;
  course: Course;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}) {
  return (
    <Card className="overflow-hidden p-0 shadow-premium">
      <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-muted">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <FileText className="size-8" />
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            PDF Resource
          </Badge>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{lesson.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {section.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild className="gap-1.5">
            <a
              href={lesson.resourceUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText className="size-4" />
              View PDF
            </a>
          </Button>
          <Button asChild variant="outline" className="gap-1.5">
            <a
              href={lesson.resourceUrl || "#"}
              download
              aria-label="Download PDF"
            >
              <Download className="size-4" />
              Download
            </a>
          </Button>
        </div>
        <PrevNextInline
          onPrev={onPrev}
          onNext={onNext}
          hasPrev={hasPrev}
          hasNext={hasNext}
        />
      </div>
    </Card>
  );
}

// -------------------------------------------------------------------------
// Download resource
// -------------------------------------------------------------------------
function DownloadResourceCard({
  lesson,
  section,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  lesson: Lesson;
  section: Section;
  course: Course;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}) {
  return (
    <Card className="overflow-hidden p-0 shadow-premium">
      <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-amber-500/10 via-muted to-muted">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Download className="size-8" />
          </div>
          <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300">
            Downloadable Resource
          </Badge>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{lesson.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {section.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild className="gap-1.5">
            <a
              href={lesson.resourceUrl || "#"}
              download
              aria-label="Download resource"
            >
              <Download className="size-4" />
              Download file
            </a>
          </Button>
        </div>
        <PrevNextInline
          onPrev={onPrev}
          onNext={onNext}
          hasPrev={hasPrev}
          hasNext={hasNext}
        />
      </div>
    </Card>
  );
}

// -------------------------------------------------------------------------
// Text lesson
// -------------------------------------------------------------------------
function TextLessonCard({
  lesson,
  section,
  course,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  lesson: Lesson;
  section: Section;
  course: Course;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}) {
  const content = lesson.content ||
    section.description ||
    `In this lesson, you'll dive into ${lesson.title}. This is a text-based lesson from the ${course.title} course. Read at your own pace, take notes, and mark the lesson complete when you’re done.`;

  return (
    <Card className="overflow-hidden p-0 shadow-premium">
      <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-muted">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <AlignLeft className="size-8" />
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Reading lesson
          </Badge>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{lesson.title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {section.title} · {lesson.durationMins}m read
          </p>
        </div>
        <Separator />
        <article className="prose prose-sm max-w-none text-sm leading-relaxed text-foreground/90 dark:prose-invert">
          {content.split(/\n{2,}/).map((para, i) => (
            <p key={i} className="mb-3 whitespace-pre-wrap">
              {para}
            </p>
          ))}
        </article>
        <PrevNextInline
          onPrev={onPrev}
          onNext={onNext}
          hasPrev={hasPrev}
          hasNext={hasNext}
        />
      </div>
    </Card>
  );
}

// -------------------------------------------------------------------------
// Inline prev/next under non-video cards
// -------------------------------------------------------------------------
function PrevNextInline({
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}) {
  return (
    <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-4">
      <Button
        variant="ghost"
        size="sm"
        disabled={!hasPrev}
        onClick={onPrev}
        className="gap-1"
      >
        <ChevronLeft className="size-4" />
        Previous
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={!hasNext}
        onClick={onNext}
        className="gap-1"
      >
        Next
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

// -------------------------------------------------------------------------
// Overview tab
// -------------------------------------------------------------------------
function OverviewTab({
  course,
  lesson,
  section,
  instructor,
}: {
  course: Course;
  lesson: Lesson;
  section: Section;
  instructor?: Instructor;
}) {
  const Icon = lessonIcon(lesson.type);
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="p-5 shadow-premium sm:col-span-2">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              About this lesson
            </h3>
            <p className="text-xs text-muted-foreground">
              {section.title} · {lesson.durationMins}m
            </p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">
          {section.description ||
            `In “${lesson.title}” you'll learn practical skills and apply them to real scenarios. This lesson is part of the ${course.title} course.`}
        </p>

        <Separator className="my-4" />

        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Stat label="Type" value={lesson.type} />
          <Stat label="Duration" value={formatDuration(lesson.durationMins)} />
          <Stat label="Section" value={section.title} />
          <Stat
            label="Preview"
            value={lesson.preview ? "Yes" : "No"}
          />
        </div>
      </Card>

      {instructor && (
        <Card className="p-5 shadow-premium">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Instructor
          </p>
          <div className="flex items-center gap-3">
            <img
              src={instructor.avatar}
              alt={instructor.name}
              className="size-12 rounded-full object-cover ring-2 ring-primary/20"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{instructor.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {instructor.title}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-4">
            {instructor.bio}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {instructor.expertise.slice(0, 3).map((e) => (
              <Badge
                key={e}
                variant="secondary"
                className="bg-primary/5 text-primary"
              >
                {e}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

// -------------------------------------------------------------------------
// Resources tab
// -------------------------------------------------------------------------
function ResourcesTab({
  lessons,
  canAccess,
  onSelect,
}: {
  lessons: Lesson[];
  canAccess: boolean;
  onSelect: (lessonId: string) => void;
}) {
  if (lessons.length === 0) {
    return (
      <EmptyCard
        title="No downloadable resources"
        description="This course doesn't have any PDF or downloadable resources yet."
        icon={<Download className="size-6" />}
      />
    );
  }

  return (
    <Card className="p-2 shadow-premium">
      <ul className="divide-y divide-border">
        {lessons.map((l) => {
          const Icon = lessonIcon(l.type);
          return (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => onSelect(l.id)}
                className="group flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.type === "PDF" ? "PDF document" : "File"} ·{" "}
                    {l.durationMins}m
                  </p>
                </div>
                {canAccess ? (
                  <a
                    href={l.resourceUrl || "#"}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    aria-label="Download"
                  >
                    <Download className="size-4" />
                  </a>
                ) : (
                  <Lock className="size-4 text-muted-foreground" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

// -------------------------------------------------------------------------
// Bookmarks tab
// -------------------------------------------------------------------------
function BookmarksTab({
  course,
  bookmarks,
  onSelect,
}: {
  course: Course;
  bookmarks: Bookmark[];
  onSelect: (lessonId: string) => void;
}) {
  if (bookmarks.length === 0) {
    return (
      <EmptyCard
        title="No bookmarks yet"
        description="Bookmark lessons or moments to quickly revisit them later. Click the bookmark icon in the top bar while watching."
        icon={<Bookmark className="size-6" />}
      />
    );
  }

  // Look up lesson titles for each bookmark
  const lessonMap = new Map<string, { lesson: Lesson; section: Section }>();
  for (const sec of course.sections) {
    for (const l of sec.lessons) {
      lessonMap.set(l.id, { lesson: l, section: sec });
    }
  }

  return (
    <Card className="p-2 shadow-premium">
      <ul className="divide-y divide-border">
        {bookmarks.map((bm) => {
          const entry = lessonMap.get(bm.lessonId);
          return (
            <li key={bm.id}>
              <button
                type="button"
                onClick={() => onSelect(bm.lessonId)}
                className="group flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookmarkCheck className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {entry?.lesson.title ?? "Unknown lesson"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry?.section.title} · {timeAgo(bm.createdAt)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="font-mono text-[11px] tabular-nums text-primary"
                >
                  {fmtTimecode(bm.timestamp)}
                </Badge>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

// -------------------------------------------------------------------------
// Prev / Next nav (bottom of player)
// -------------------------------------------------------------------------
function PrevNextNav({
  prev,
  next,
  onPrev,
  onNext,
  onCompleteNext,
}: {
  prev: FlatLesson | null;
  next: FlatLesson | null;
  onPrev?: () => void;
  onNext?: () => void;
  onCompleteNext?: () => void;
}) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {prev ? (
        <button
          type="button"
          onClick={onPrev}
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left shadow-premium transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-glow"
        >
          <ChevronLeft className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Previous
            </p>
            <p className="truncate text-sm font-semibold">{prev.lesson.title}</p>
          </div>
        </button>
      ) : (
        <div className="hidden sm:block" />
      )}

      {next ? (
        <button
          type="button"
          onClick={onCompleteNext ?? onNext}
          className="group flex items-center justify-end gap-3 rounded-xl border border-border bg-card p-3 text-right shadow-premium transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-glow"
        >
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {onCompleteNext ? "Mark complete & next" : "Next"}
            </p>
            <p className="truncate text-sm font-semibold">{next.lesson.title}</p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
        </button>
      ) : (
        <div className="hidden sm:block" />
      )}
    </div>
  );
}

// -------------------------------------------------------------------------
// Empty / auth helper cards
// -------------------------------------------------------------------------
function EmptyCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 p-8 text-center shadow-premium">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          {description}
        </p>
      </div>
    </Card>
  );
}

function EmptyAuthCard({
  title,
  description,
  action,
  onAction,
}: {
  title: string;
  description: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 p-8 text-center shadow-premium">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <NotebookPen className="size-6" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          {description}
        </p>
      </div>
      <Button size="sm" onClick={onAction}>
        {action}
      </Button>
    </Card>
  );
}

export default LearnView;

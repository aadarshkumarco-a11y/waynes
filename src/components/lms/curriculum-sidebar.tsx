"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Download,
  FileText,
  FileType,
  PlayCircle,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/format";
import type { Course, Lesson, LessonType } from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function lessonIconFor(type: LessonType) {
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

function sectionDuration(lessons: Lesson[]): number {
  return lessons.reduce((n, l) => n + (l.durationMins || 0), 0);
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface CurriculumSidebarProps {
  course: Course;
  currentLessonId?: string | null;
  completedIds: string[];
  onSelect: (lessonId: string) => void;
  progressPct: number;
  /** Compact mode for mobile sheets (hides some chrome) */
  compact?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function CurriculumSidebar({
  course,
  currentLessonId,
  completedIds,
  onSelect,
  progressPct,
  compact,
  className,
}: CurriculumSidebarProps) {
  // Default-open every section so learners can scroll/browse freely.
  const defaultOpen = useMemo(
    () => course.sections.map((s) => s.id),
    [course.sections]
  );

  const totalLessons = useMemo(
    () => course.sections.reduce((n, s) => n + s.lessons.length, 0),
    [course.sections]
  );

  const completedCount = completedIds.length;

  // Auto-scroll current lesson into view on mount/change.
  const currentRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!currentLessonId) return;
    const t = setTimeout(() => {
      currentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 150);
    return () => clearTimeout(t);
  }, [currentLessonId]);

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-premium",
        className
      )}
    >
      {/* Header */}
      <div className="border-b border-border p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Course curriculum
        </p>
        <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug tracking-tight sm:text-lg">
          {course.title}
        </h3>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {completedCount} of {totalLessons} lessons completed
            </span>
            <span className="font-semibold tabular-nums text-primary">
              {Math.round(progressPct)}%
            </span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>
      </div>

      {/* Sections */}
      <Accordion
        type="multiple"
        defaultValue={defaultOpen}
        className="scrollbar-thin flex-1 overflow-y-auto"
      >
        {course.sections.map((section, idx) => {
          const secLessons = section.lessons;
          const secDur = sectionDuration(secLessons);
          const secCompleted = secLessons.filter((l) =>
            completedIds.includes(l.id)
          ).length;

          return (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="border-b border-border last:border-b-0"
            >
              <AccordionTrigger className="group/sec px-4 py-3.5 hover:no-underline sm:px-5">
                <div className="flex w-full flex-col gap-1 pr-2 text-left">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                      {idx + 1}
                    </span>
                    <span className="line-clamp-1 text-sm font-semibold tracking-tight">
                      {section.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pl-8 text-xs text-muted-foreground">
                    <span>
                      {secLessons.length} lesson{secLessons.length === 1 ? "" : "s"}
                    </span>
                    <span aria-hidden>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {formatDuration(secDur)}
                    </span>
                    {secCompleted === secLessons.length && secLessons.length > 0 && (
                      <>
                        <span aria-hidden>·</span>
                        <Badge
                          variant="secondary"
                          className="h-5 gap-1 bg-primary/10 px-1.5 text-[10px] font-semibold text-primary"
                        >
                          <CheckCircle2 className="size-3" />
                          Done
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <ul className="space-y-0.5 pl-1 pr-1 sm:pl-2">
                  {secLessons.map((lesson) => {
                    const Icon = lessonIconFor(lesson.type);
                    const isCurrent = lesson.id === currentLessonId;
                    const isDone = completedIds.includes(lesson.id);
                    return (
                      <li key={lesson.id}>
                        <button
                          ref={isCurrent ? currentRef : undefined}
                          type="button"
                          onClick={() => onSelect(lesson.id)}
                          aria-current={isCurrent ? "true" : undefined}
                          className={cn(
                            "group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors sm:px-3",
                            isCurrent
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-accent"
                          )}
                        >
                          {/* Status icon */}
                          <span
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center",
                              isDone
                                ? "text-primary"
                                : isCurrent
                                  ? "text-primary"
                                  : "text-muted-foreground"
                            )}
                          >
                            {isDone ? (
                              <CheckCircle2 className="size-5" />
                            ) : (
                              <Circle className="size-4 opacity-60" />
                            )}
                          </span>

                          {/* Type icon + title */}
                          <span className="flex min-w-0 flex-1 items-center gap-2">
                            <Icon
                              className={cn(
                                "size-4 shrink-0",
                                isCurrent
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              )}
                            />
                            <span
                              className={cn(
                                "line-clamp-2 text-sm leading-snug",
                                isCurrent ? "font-semibold" : "font-medium"
                              )}
                            >
                              {lesson.title}
                            </span>
                          </span>

                          {/* Duration + preview/lock badge */}
                          <span className="flex shrink-0 items-center gap-1.5">
                            {lesson.preview && !isDone && (
                              <Badge
                                variant="outline"
                                className="hidden h-5 border-primary/30 px-1.5 text-[10px] font-semibold text-primary sm:inline-flex"
                              >
                                Preview
                              </Badge>
                            )}
                            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                              {lesson.durationMins}m
                            </span>
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

      {!compact && (
        <div className="border-t border-border p-3 text-center text-[11px] text-muted-foreground">
          {course.sections.length} sections · {totalLessons} lessons
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile-friendly collapsible wrapper using a Sheet (triggered externally).
// Exported so the parent can render the sidebar in a sheet on small screens.
// ---------------------------------------------------------------------------
export function CurriculumSidebarCollapsible({
  open,
  onOpenChange,
  ...props
}: CurriculumSidebarProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex lg:hidden"
          onClick={onOpenChange}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative ml-auto flex h-full w-[88%] max-w-sm flex-col p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-sm font-semibold">Curriculum</span>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
                aria-label="Close curriculum"
              >
                <X className="size-4" />
              </button>
            </div>
            <CurriculumSidebar {...props} className="flex-1" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

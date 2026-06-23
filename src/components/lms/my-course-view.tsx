"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  PlayCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Award,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLms } from "@/lib/store";
import { courseMap } from "@/lib/data/catalog";
import { formatPrice, formatDate } from "@/lib/format";
import { toast } from "sonner";

export function MyCourseView() {
  const { myCourseId, user, openCourse, openLesson, navigate, enrollments, orders, certificates } = useLms();

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
        <AlertCircle className="mb-4 size-16 text-amber-500" />
        <h1 className="font-mono text-2xl font-bold">ACCESS DENIED</h1>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          $ authenticate to view your course
        </p>
        <Button className="mt-6" onClick={() => navigate("home")}>
          Back to Home
        </Button>
      </div>
    );
  }

  if (!myCourseId) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
        <AlertCircle className="mb-4 size-16 text-muted-foreground" />
        <h1 className="font-mono text-xl font-bold">NO COURSE SELECTED</h1>
        <Button className="mt-6" onClick={() => navigate("my-learning")}>
          View My Learning
        </Button>
      </div>
    );
  }

  // Find the course (catalog or custom)
  const course = courseMap[myCourseId] || useLms.getState().customCourses.find((c) => c.id === myCourseId);
  if (!course) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
        <AlertCircle className="mb-4 size-16 text-muted-foreground" />
        <h1 className="font-mono text-xl font-bold">COURSE NOT FOUND</h1>
        <Button className="mt-6" onClick={() => navigate("my-learning")}>
          View My Learning
        </Button>
      </div>
    );
  }

  // Find enrollment + order
  const enrollment = enrollments.find((e) => e.userId === user.id && e.courseId === myCourseId);
  const order = orders.find(
    (o) => o.userId === user.id && o.courseId === myCourseId && o.status === "APPROVED"
  );
  const cert = certificates.find((c) => c.userId === user.id && c.courseId === myCourseId);
  const downloadUrl = (course as any).downloadUrl;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      {/* Back */}
      <button
        onClick={() => navigate("my-learning")}
        className="mb-6 inline-flex items-center gap-1.5 font-mono text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" /> back_to_my_learning
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header card */}
        <Card className="terminal-window overflow-hidden p-0">
          <div className="relative border-b border-primary/20 bg-primary/5 px-6 py-8 sm:px-10">
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="relative flex flex-col gap-6 sm:flex-row">
              {/* Thumbnail */}
              <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg border border-primary/30 sm:w-64">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="absolute inset-0 size-full object-cover"
                />
              </div>
              {/* Info */}
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge className="gap-1 bg-emerald-500/15 text-emerald-400">
                    <CheckCircle2 className="size-3" /> APPROVED
                  </Badge>
                  {cert && (
                    <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-500">
                      <Award className="size-3" /> Certificate Earned
                    </Badge>
                  )}
                </div>
                <h1 className="font-mono text-xl font-bold tracking-tight text-glow-green sm:text-2xl">
                  {course.title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">{course.subtitle}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {order ? formatDate(order.createdAt) : "—"}
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="size-3" />
                    {order ? `Order ${order.orderNumber}` : "—"}
                  </span>
                  {order && (
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {formatPrice(order.finalAmount)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8">
            {/* Progress */}
            {enrollment && (
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between font-mono text-xs">
                  <span className="text-primary">$ progress</span>
                  <span className="font-semibold tabular-nums text-primary">
                    {enrollment.progress}%
                  </span>
                </div>
                <Progress
                  value={enrollment.progress}
                  className="h-2 [&>div]:bg-primary [&>div]:glow-green"
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Access Course */}
              <Button
                size="lg"
                onClick={() => openCourse(course.slug)}
                className="glow-green gap-2 font-mono uppercase tracking-widest"
              >
                <PlayCircle className="size-4" />
                Access Course
                <ExternalLink className="size-4" />
              </Button>

              {/* Download Resources */}
              {downloadUrl ? (
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full gap-2 border-primary/30 font-mono uppercase tracking-widest text-primary"
                  >
                    <Download className="size-4" />
                    Download Resources
                  </Button>
                </a>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  disabled
                  className="gap-2 border-border font-mono uppercase tracking-widest text-muted-foreground"
                >
                  <Download className="size-4" />
                  No Download Available
                </Button>
              )}
            </div>

            {/* Download link display */}
            {downloadUrl && (
              <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-3">
                <p className="font-mono text-[11px] uppercase tracking-widest text-primary/80">
                  {"// download_link"}
                </p>
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block break-all text-sm text-primary hover:underline"
                >
                  {downloadUrl}
                </a>
              </div>
            )}

            {/* Greeting message */}
            <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4">
              <p className="font-mono text-[11px] uppercase tracking-widest text-primary/80">
                {"// message_from_seller"}
              </p>
              <p className="mt-1.5 text-sm text-foreground">
                {useLms.getState().paymentSettings?.greetingMessage ||
                  "Thank you for enrolling! Your access is now active."}
              </p>
            </div>

            {/* Course details */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-border bg-card/50 p-4">
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Enrollment Status
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-emerald-500">
                  <CheckCircle2 className="size-4" /> Active
                </p>
              </div>
              <div className="rounded-md border border-border bg-card/50 p-4">
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Purchase Date
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {order ? formatDate(order.createdAt) : "—"}
                </p>
              </div>
            </div>

            {/* Certificate */}
            {cert && (
              <div className="mt-4 flex items-center justify-between rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-amber-500">
                    Certificate
                  </p>
                  <p className="mt-0.5 text-sm font-semibold">Verify ID: {cert.verifyId}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-500/40 text-amber-500"
                  onClick={() => useLms.getState().openCertificate(cert.verifyId)}
                >
                  <Award className="size-4" /> View
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default MyCourseView;

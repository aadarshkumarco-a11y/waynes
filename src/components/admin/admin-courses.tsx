"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Edit,
  Plus,
  Search,
  Star,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLms } from "@/lib/store";
import { courses, instructorMap, courseStats } from "@/lib/data/catalog";
import { formatPrice, formatNumber, formatDuration } from "@/lib/format";
import { toast } from "sonner";
import type { Course, CourseLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CourseFormState {
  title: string;
  subtitle: string;
  price: number;
  level: CourseLevel;
  description: string;
  featured: boolean;
}

const EMPTY_FORM: CourseFormState = {
  title: "",
  subtitle: "",
  price: 2999,
  level: "BEGINNER",
  description: "",
  featured: false,
};

const LEVEL_STYLES: Record<CourseLevel, string> = {
  BEGINNER: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  INTERMEDIATE: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  ADVANCED: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

function CourseDialog({
  open,
  onOpenChange,
  initial,
  mode,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Course | null;
  mode: "edit" | "create";
}) {
  // Form is initialized from `initial` at mount; parent remounts via `key` when target changes.
  const [form, setForm] = useState<CourseFormState>(
    initial
      ? {
          title: initial.title,
          subtitle: initial.subtitle,
          price: initial.price,
          level: initial.level,
          description: initial.description,
          featured: initial.featured,
        }
      : EMPTY_FORM
  );

  const save = () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    toast.success(mode === "edit" ? "Course updated (demo)" : "Course created (demo)");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Course" : "New Course"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update course details. Changes are demo-only and not persisted."
              : "Create a new course. This is a demo — no record is saved to the database."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="c-title">Title</Label>
            <Input
              id="c-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Full-Stack Mastery with Next.js 16"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="c-subtitle">Subtitle</Label>
            <Input
              id="c-subtitle"
              value={form.subtitle}
              onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              placeholder="A short, punchy tagline"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="c-price">Price (₹)</Label>
              <Input
                id="c-price"
                type="number"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Level</Label>
              <Select
                value={form.level}
                onValueChange={(v) => setForm((f) => ({ ...f, level: v as CourseLevel }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="c-desc">Description</Label>
            <Textarea
              id="c-desc"
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="What will students learn?"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
            <div>
              <Label htmlFor="c-featured" className="text-sm font-medium">
                Featured course
              </Label>
              <p className="text-xs text-muted-foreground">
                Featured courses appear on the homepage & landing highlights.
              </p>
            </div>
            <Switch
              id="c-featured"
              checked={form.featured}
              onCheckedChange={(v) => setForm((f) => ({ ...f, featured: v }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{mode === "edit" ? "Save Changes" : "Create Course"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdminCourses() {
  const orders = useLms((s) => s.orders);
  const [query, setQuery] = useState("");
  const [featuredOverrides, setFeaturedOverrides] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses
      .filter((c) => !q || c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q))
      .map((c) => {
        const instructor = instructorMap[c.instructorId];
        const stats = courseStats(c);
        const approvedOrders = orders.filter(
          (o) => o.courseId === c.id && o.status === "APPROVED"
        );
        const revenue = approvedOrders.reduce((s, o) => s + o.finalAmount, 0) || c.studentCount * c.price;
        const featured = featuredOverrides[c.id] ?? c.featured;
        return { course: c, instructor, stats, revenue, approvedCount: approvedOrders.length, featured };
      });
  }, [query, orders, featuredOverrides]);

  const toggleFeatured = (id: string, current: boolean) => {
    setFeaturedOverrides((p) => ({ ...p, [id]: !current }));
    toast.success(`Course ${!current ? "featured" : "unfeatured"} (demo)`);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="border-border/60">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses…"
              className="pl-9"
            />
          </div>
          <Button
            className="gap-1.5"
            onClick={() => {
              setEditing(null);
              setCreateOpen(true);
            }}
          >
            <Plus className="size-4" /> New Course
          </Button>
        </CardContent>
      </Card>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ course, instructor, stats, revenue, approvedCount, featured }, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.2) }}
          >
            <Card className="group overflow-hidden border-border/60 transition-all hover:shadow-premium">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Avatar className="size-full rounded-none">
                  <AvatarImage src={course.thumbnail} alt={course.title} />
                  <AvatarFallback>{course.title.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="absolute left-2 top-2 flex gap-1">
                  {featured && (
                    <Badge className="gap-1 bg-amber-500/90 text-white hover:bg-amber-500">
                      <Star className="size-3" /> Featured
                    </Badge>
                  )}
                  {course.published && (
                    <Badge variant="secondary" className="bg-emerald-500/90 text-white hover:bg-emerald-500">
                      Published
                    </Badge>
                  )}
                </div>
                <Badge className={cn("absolute right-2 top-2", LEVEL_STYLES[course.level])}>
                  {course.level}
                </Badge>
              </div>
              <CardContent className="p-4">
                <p className="line-clamp-1 text-sm font-semibold">{course.title}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{course.subtitle}</p>

                <div className="mt-3 flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarImage src={instructor?.avatar} alt={instructor?.name} />
                    <AvatarFallback>{instructor?.name?.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <p className="truncate text-xs text-muted-foreground">{instructor?.name}</p>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-muted/40 p-2">
                    <p className="text-[10px] text-muted-foreground">Students</p>
                    <p className="text-xs font-semibold">{formatNumber(course.studentCount)}</p>
                  </div>
                  <div className="rounded-md bg-muted/40 p-2">
                    <p className="text-[10px] text-muted-foreground">Lessons</p>
                    <p className="text-xs font-semibold">{stats.lessonCount}</p>
                  </div>
                  <div className="rounded-md bg-muted/40 p-2">
                    <p className="text-[10px] text-muted-foreground">Duration</p>
                    <p className="text-xs font-semibold">{formatDuration(stats.duration)}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-base font-bold">{formatPrice(course.price, course.currency)}</p>
                    {course.comparePrice && (
                      <p className="text-[10px] text-muted-foreground line-through">
                        {formatPrice(course.comparePrice, course.currency)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="flex items-center justify-end gap-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="size-3" />
                      {formatPrice(revenue, course.currency)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{approvedCount} orders</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Star className="size-3.5 fill-amber-500 text-amber-500" />
                    <span className="font-semibold">{course.rating}</span>
                    <span className="text-muted-foreground">({formatNumber(course.reviewCount)})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 px-2"
                      onClick={() => toggleFeatured(course.id, featured)}
                    >
                      <Star className={cn("size-3.5", featured && "fill-amber-500 text-amber-500")} />
                      {featured ? "Unfeature" : "Feature"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1.5 px-2"
                      onClick={() => {
                        setEditing(course);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="size-3.5" /> Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {rows.length === 0 && (
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <BookOpen className="size-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">No courses found.</p>
          </CardContent>
        </Card>
      )}

      <CourseDialog
        key={`edit-${editing?.id ?? "none"}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        mode="edit"
      />
      <CourseDialog
        key="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
      />
    </div>
  );
}

export default AdminCourses;

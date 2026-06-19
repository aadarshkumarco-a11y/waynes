"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Pin, Search, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { courseMap } from "@/lib/data/catalog";
import { featuredReviews as seedReviews } from "@/lib/data/catalog";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReviewRow {
  id: string;
  userName: string;
  userAvatar?: string;
  courseId: string;
  rating: number;
  comment: string;
  date: string;
  featured: boolean;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < rating ? "fill-amber-500 text-amber-500" : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
}

export function AdminReviews() {
  const [query, setQuery] = useState("");
  const [featuredOverrides, setFeaturedOverrides] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(8);

  // Synthesize a few extra reviews beyond the seed ones so the table feels alive
  const allReviews: ReviewRow[] = useMemo(() => {
    const extra: ReviewRow[] = [
      {
        id: "r4",
        userName: "Priya K.",
        userAvatar: "https://i.pravatar.cc/80?img=44",
        courseId: "course-3",
        rating: 4,
        comment: "Great design fundamentals. Would have loved more advanced prototyping sections.",
        date: "2025-01-25",
        featured: false,
      },
      {
        id: "r5",
        userName: "Arjun S.",
        userAvatar: "https://i.pravatar.cc/80?img=14",
        courseId: "course-4",
        rating: 5,
        comment: "The RAG module alone is worth 10x the price. Vikram is an exceptional teacher.",
        date: "2025-02-10",
        featured: false,
      },
      {
        id: "r6",
        userName: "Neha R.",
        userAvatar: "https://i.pravatar.cc/80?img=49",
        courseId: "course-1",
        rating: 5,
        comment: "I now ship Next.js apps with confidence. The Server Components chapter is a masterclass.",
        date: "2025-02-12",
        featured: false,
      },
      {
        id: "r7",
        userName: "Vivek T.",
        userAvatar: "https://i.pravatar.cc/80?img=22",
        courseId: "course-5",
        rating: 4,
        comment: "Solid SEO playbook. Some tactics are starting to feel dated but the framework is timeless.",
        date: "2025-01-18",
        featured: false,
      },
      {
        id: "r8",
        userName: "Sara M.",
        userAvatar: "https://i.pravatar.cc/80?img=32",
        courseId: "course-8",
        rating: 5,
        comment: "Best PM course in India, hands down. Got promoted to Senior PM within 6 months.",
        date: "2025-02-05",
        featured: false,
      },
      ...seedReviews.map((r) => ({ ...r })),
    ];
    return extra;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allReviews.filter((r) => {
      if (!q) return true;
      const course = courseMap[r.courseId];
      return (
        r.userName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        course?.title.toLowerCase().includes(q)
      );
    });
  }, [allReviews, query]);

  const visible = filtered.slice(0, visibleCount);

  const stats = useMemo(() => {
    const total = allReviews.length;
    const featured = allReviews.filter((r) => featuredOverrides[r.id] ?? r.featured).length;
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / total;
    return { total, featured, avg };
  }, [allReviews, featuredOverrides]);

  const toggleFeatured = (id: string, current: boolean) => {
    setFeaturedOverrides((p) => ({ ...p, [id]: !current }));
    toast.success(`Review ${!current ? "featured on homepage" : "unfeatured"}`);
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Reviews", value: stats.total, icon: Eye, color: "text-primary" },
          { label: "Featured", value: stats.featured, icon: Pin, color: "text-amber-500" },
          {
            label: "Avg. Rating",
            value: stats.avg.toFixed(2),
            icon: Star,
            color: "text-amber-500",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-border/60">
              <CardContent className="flex items-center gap-3 p-4">
                <s.icon className={cn("size-7", s.color)} />
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by student, course, or comment…"
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Reviews ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto scrollbar-thin">
            <Table>
              <TableHeader>
                <TableRow className="text-xs text-muted-foreground">
                  <TableHead className="px-4">Student</TableHead>
                  <TableHead className="px-4">Course</TableHead>
                  <TableHead className="px-4">Rating</TableHead>
                  <TableHead className="px-4">Comment</TableHead>
                  <TableHead className="px-4 hidden md:table-cell">Date</TableHead>
                  <TableHead className="px-4 text-right">Featured</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <Star className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No reviews match your search.</p>
                    </TableCell>
                  </TableRow>
                )}
                {visible.map((r) => {
                  const course = courseMap[r.courseId];
                  const featured = featuredOverrides[r.id] ?? r.featured;
                  return (
                    <TableRow key={r.id} className="text-sm">
                      <TableCell className="px-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-8">
                            <AvatarImage src={r.userAvatar} alt={r.userName} />
                            <AvatarFallback>{r.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">{r.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        {course && (
                          <div className="flex items-center gap-2">
                            <Avatar className="size-7 rounded-md">
                              <AvatarImage src={course.thumbnail} alt={course.title} />
                              <AvatarFallback>{course.title.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span className="max-w-[160px] truncate text-xs">{course.title}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center gap-1.5">
                          <Stars rating={r.rating} />
                          <span className="text-xs font-medium">{r.rating}.0</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        <p className="line-clamp-2 max-w-md text-xs text-muted-foreground">{r.comment}</p>
                      </TableCell>
                      <TableCell className="px-4 hidden md:table-cell text-xs text-muted-foreground">
                        {formatDate(r.date)}
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center justify-end gap-2">
                          {featured && (
                            <Badge className="gap-1 bg-amber-500/15 text-amber-600 text-[9px] dark:text-amber-400">
                              <Pin className="size-2.5" /> Featured
                            </Badge>
                          )}
                          <Switch
                            checked={featured}
                            onCheckedChange={() => toggleFeatured(r.id, featured)}
                            aria-label="Toggle featured"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {visibleCount < filtered.length && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setVisibleCount((c) => c + 8)}>
            Load more ({filtered.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}

export default AdminReviews;

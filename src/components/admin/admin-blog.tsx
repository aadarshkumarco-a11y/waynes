"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Edit, Eye, FileText, Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { blogPosts as seedPosts } from "@/lib/data/catalog";
import { formatDate, formatNumber } from "@/lib/format";
import { toast } from "sonner";
import type { BlogPost } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<BlogPost["status"], string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  SCHEDULED: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

interface FormState {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  coverImage: string;
  status: BlogPost["status"];
}

const EMPTY: FormState = {
  title: "",
  excerpt: "",
  content: "",
  category: "Web Development",
  tags: "",
  coverImage: "",
  status: "DRAFT",
};

const CATEGORIES = [
  "Web Development",
  "Data Science",
  "AI & Machine Learning",
  "Design",
  "Marketing",
  "Business",
];

function BlogDialog({
  open,
  onOpenChange,
  initial,
  mode,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: BlogPost | null;
  mode: "create" | "edit";
}) {
  // Form initialized from `initial` at mount; parent uses `key` to remount on target change.
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          title: initial.title,
          excerpt: initial.excerpt,
          content: initial.content,
          category: initial.category,
          tags: initial.tags.join(", "),
          coverImage: initial.coverImage ?? "",
          status: initial.status,
        }
      : EMPTY
  );

  const save = () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    toast.success(mode === "edit" ? "Post updated (demo)" : "Post created (demo)");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            {mode === "edit" ? "Edit Post" : "New Blog Post"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update post details."
              : "Compose a new post. Demo only — not persisted."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="bp-title">Title</Label>
            <Input
              id="bp-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Why React Server Components Change Everything"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bp-excerpt">Excerpt</Label>
            <Input
              id="bp-excerpt"
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              placeholder="A short summary shown in cards & search results"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bp-content">Content (Markdown)</Label>
            <Textarea
              id="bp-content"
              rows={8}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="## Heading&#10;&#10;Write your post in Markdown…"
              className="font-mono text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as BlogPost["status"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bp-tags">Tags (comma-separated)</Label>
            <Input
              id="bp-tags"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="React, Next.js, RSC"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bp-cover">Cover Image URL</Label>
            <Input
              id="bp-cover"
              value={form.coverImage}
              onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
              placeholder="https://picsum.photos/seed/blog/1200/600"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>
            {mode === "edit" ? "Save Changes" : "Publish Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdminBlog() {
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return seedPosts.filter(
      (p) => !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [query]);

  const stats = useMemo(() => {
    const total = seedPosts.length;
    const published = seedPosts.filter((p) => p.status === "PUBLISHED").length;
    const totalViews = seedPosts.reduce((s, p) => s + p.views, 0);
    return { total, published, totalViews };
  }, []);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Posts", value: stats.total, icon: FileText, color: "text-primary" },
          { label: "Published", value: stats.published, icon: Eye, color: "text-emerald-500" },
          { label: "Total Views", value: formatNumber(stats.totalViews), icon: Eye, color: "text-amber-500" },
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
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts…"
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
            <Plus className="size-4" /> New Post
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Blog Posts ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto scrollbar-thin">
            <Table>
              <TableHeader>
                <TableRow className="text-xs text-muted-foreground">
                  <TableHead className="px-4">Post</TableHead>
                  <TableHead className="px-4 hidden md:table-cell">Category</TableHead>
                  <TableHead className="px-4">Status</TableHead>
                  <TableHead className="px-4">Views</TableHead>
                  <TableHead className="px-4 hidden sm:table-cell">Published</TableHead>
                  <TableHead className="px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <FileText className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No posts found.</p>
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((p) => (
                  <TableRow key={p.id} className="text-sm">
                    <TableCell className="px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 rounded-md">
                          <AvatarImage src={p.coverImage} alt={p.title} />
                          <AvatarFallback>{p.title.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-xs font-semibold">{p.title}</p>
                          <p className="line-clamp-1 max-w-[280px] text-[10px] text-muted-foreground">
                            {p.excerpt}
                          </p>
                          <div className="mt-0.5 flex items-center gap-1">
                            {p.tags.slice(0, 2).map((t) => (
                              <Badge key={t} variant="secondary" className="text-[9px]">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 hidden md:table-cell text-xs">{p.category}</TableCell>
                    <TableCell className="px-4">
                      <Badge className={cn("text-[9px]", STATUS_STYLES[p.status])}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4">
                      <span className="flex items-center gap-1 text-xs">
                        <Eye className="size-3 text-muted-foreground" />
                        {formatNumber(p.views)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 hidden sm:table-cell text-xs text-muted-foreground">
                      {p.publishedAt ? formatDate(p.publishedAt) : "—"}
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 gap-1.5 px-2"
                        onClick={() => {
                          setEditing(p);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="size-3.5" /> Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <BlogDialog
        key={`edit-${editing?.id ?? "none"}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        mode="edit"
      />
      <BlogDialog key="create" open={createOpen} onOpenChange={setCreateOpen} mode="create" />
    </div>
  );
}

export default AdminBlog;

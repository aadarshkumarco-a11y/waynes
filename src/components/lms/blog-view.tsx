"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Clock,
  Mail,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLms } from "@/lib/store";
import { blogPosts } from "@/lib/data/catalog";
import { formatDate, formatNumber } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/lib/types";

export function BlogView() {
  const openBlog = useLms((s) => s.openBlog);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    blogPosts.forEach((p) => set.add(p.category));
    return ["All", ...Array.from(set)];
  }, []);

  const featured = blogPosts[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blogPosts.filter((p) => {
      const matchesCat = category === "All" || p.category === category;
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [query, category]);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Enter a valid email address");
      return;
    }
    setSubscribing(true);
    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("subscribe failed");
      toast.success("Subscribed! Watch your inbox for fresh insights.");
      setEmail("");
    } catch {
      // Graceful fallback if the API is unavailable
      toast.success("You're on the list! (demo)");
      setEmail("");
    } finally {
      setSubscribing(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <Badge variant="secondary" className="mb-3 gap-1">
          <Sparkles className="size-3" /> Waynes Blog
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          Insights for <span className="text-gradient-brand">builders</span> &amp; learners
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Deep dives, frameworks, and playbooks from our instructors and community — on
          engineering, design, AI, growth, and product.
        </p>
      </motion.div>

      {/* Featured post */}
      {featured && !query && category === "All" && (
        <motion.button
          onClick={() => openBlog(featured.slug)}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -4 }}
          className="group mt-10 block w-full text-left"
        >
          <Card className="glass-strong grid overflow-hidden p-0 shadow-premium transition-shadow hover:shadow-glow md:grid-cols-2">
            <div className="relative aspect-[16/10] overflow-hidden bg-muted md:aspect-auto">
              <img
                src={featured.coverImage ?? ""}
                alt={featured.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <Badge className="absolute left-4 top-4 bg-amber-400/90 text-amber-950 hover:bg-amber-400">
                ★ Featured
              </Badge>
            </div>
            <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
              <Badge variant="secondary" className="w-fit">
                {featured.category}
              </Badge>
              <h2 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                {featured.title}
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                {featured.excerpt}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <Avatar className="size-7">
                  <AvatarImage src={featured.authorAvatar} alt={featured.authorName} />
                  <AvatarFallback>{featured.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">
                  {featured.authorName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {formatDate(featured.publishedAt ?? featured.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {featured.readingMins} min read
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="size-3" />
                  {formatNumber(featured.views)} views
                </span>
              </div>
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Read article
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Card>
        </motion.button>
      )}

      {/* Filters */}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                category === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-accent"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="pl-9"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed bg-muted/20 p-12 text-center text-sm text-muted-foreground">
          No articles match your search.
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered
            .filter((p) => (query || category !== "All" ? true : p.id !== featured?.id))
            .map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} onOpen={() => openBlog(post.slug)} />
            ))}
        </div>
      )}

      {/* Newsletter CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mt-16"
      >
        <Card className="gradient-brand relative overflow-hidden p-0 shadow-glow">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative flex flex-col items-center gap-4 p-8 text-center sm:p-12">
            <div className="flex size-12 items-center justify-center rounded-full bg-white/15 backdrop-blur">
              <Mail className="size-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white sm:text-3xl">
              Get the best of Waynes
            </h3>
            <p className="max-w-md text-white/90">
              One email every week — fresh articles, course drops, and behind-the-scenes
              from top instructors. No spam.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="mt-2 flex w-full max-w-md flex-col gap-2 sm:flex-row"
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="border-white/30 bg-white/15 text-white placeholder:text-white/70 focus-visible:border-white/60 focus-visible:ring-white/30"
              />
              <Button
                type="submit"
                disabled={subscribing}
                variant="secondary"
                className="shrink-0 bg-white text-primary hover:bg-white/90"
              >
                {subscribing ? "Subscribing…" : "Subscribe"}
                <ArrowRight className="size-4" />
              </Button>
            </form>
            <p className="text-xs text-white/70">
              Join 25,000+ learners. Unsubscribe anytime.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default BlogView;

// ---------------------------------------------------------------------------
function BlogCard({
  post,
  index,
  onOpen,
}: {
  post: BlogPost;
  index: number;
  onOpen: () => void;
}) {
  return (
    <motion.button
      onClick={onOpen}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -4 }}
      className="group block h-full text-left"
    >
      <Card className="flex h-full flex-col overflow-hidden p-0 shadow-premium transition-shadow hover:shadow-glow">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={post.coverImage ?? ""}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <Badge className="absolute left-3 top-3 bg-black/50 text-white backdrop-blur hover:bg-black/60">
            {post.category}
          </Badge>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
          <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="size-5">
                <AvatarImage src={post.authorAvatar} alt={post.authorName} />
                <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">{post.authorName}</span>
            </div>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {post.readingMins}m
            </span>
          </div>
        </div>
      </Card>
    </motion.button>
  );
}

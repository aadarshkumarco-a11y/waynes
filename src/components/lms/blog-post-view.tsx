"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Eye,
  GraduationCap,
  Link2,
  Share2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useLms } from "@/lib/store";
import { blogBySlug, blogPosts } from "@/lib/data/catalog";
import { formatDate, formatNumber } from "@/lib/format";
import { toast } from "sonner";
import type { BlogPost } from "@/lib/types";

export function BlogPostView() {
  const blogSlug = useLms((s) => s.blogSlug);
  const openBlog = useLms((s) => s.openBlog);
  const navigate = useLms((s) => s.navigate);

  const post = blogSlug ? blogBySlug[blogSlug] : null;

  const related = useMemo<BlogPost[]>(() => {
    if (!post) return [];
    return blogPosts
      .filter((p) => p.slug !== post.slug && p.category === post.category)
      .slice(0, 3)
      .concat(blogPosts.filter((p) => p.slug !== post.slug && p.category !== post.category))
      .slice(0, 3);
  }, [post]);

  const nextPost = useMemo(() => {
    if (!post) return null;
    const idx = blogPosts.findIndex((p) => p.slug === post.slug);
    if (idx === -1) return null;
    return blogPosts[(idx + 1) % blogPosts.length];
  }, [post]);

  if (!post) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center"
      >
        <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-muted">
          <Sparkles className="size-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Article not found</h2>
        <p className="mt-2 text-muted-foreground">
          The article you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button className="mt-6" size="lg" onClick={() => navigate("blog")}>
          <ArrowLeft className="size-4" />
          Back to blog
        </Button>
      </motion.div>
    );
  }

  function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: post!.title, url }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => toast.success("Link copied to clipboard"));
    }
  }

  return (
    <article className="relative">
      {/* Hero */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 h-[420px] overflow-hidden">
          <img
            src={post.coverImage ?? ""}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>

        <div className="mx-auto max-w-3xl px-4 pb-10 pt-20 sm:pt-28">
          <motion.button
            onClick={() => navigate("blog")}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Back to blog
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="bg-amber-400/90 text-amber-950 hover:bg-amber-400">
              {post.category}
            </Badge>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/80 sm:text-lg">
              {post.excerpt}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Avatar className="size-9 ring-2 ring-white/30">
                  <AvatarImage src={post.authorAvatar} alt={post.authorName} />
                  <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-white">{post.authorName}</span>
              </div>
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                {formatDate(post.publishedAt ?? post.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {post.readingMins} min read
              </span>
              <span className="flex items-center gap-1">
                <Eye className="size-3.5" />
                {formatNumber(post.views)} views
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-16 lg:grid-cols-[1fr_320px]">
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="min-w-0"
        >
          <Card className="glass p-6 shadow-premium sm:p-10">
            <MarkdownContent content={post.content} />

            {/* Tags */}
            <div className="mt-8 flex flex-wrap gap-2 border-t pt-6">
              {post.tags.map((t) => (
                <Badge key={t} variant="secondary" className="font-medium">
                  #{t}
                </Badge>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="size-4" />
                Share article
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const url = typeof window !== "undefined" ? window.location.href : "";
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard
                      .writeText(url)
                      .then(() => toast.success("Link copied"));
                  }
                }}
              >
                <Link2 className="size-4" />
                Copy link
              </Button>
            </div>
          </Card>

          {/* Next article CTA */}
          {nextPost && (
            <motion.button
              onClick={() => openBlog(nextPost.slug)}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="group mt-6 block w-full text-left"
            >
              <Card className="flex items-center justify-between gap-4 overflow-hidden p-5 shadow-premium transition-shadow hover:shadow-glow">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Next article</p>
                  <p className="mt-1 line-clamp-1 font-semibold transition-colors group-hover:text-primary">
                    {nextPost.title}
                  </p>
                </div>
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  <img
                    src={nextPost.coverImage ?? ""}
                    alt={nextPost.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Card>
            </motion.button>
          )}

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <Card className="gradient-brand relative overflow-hidden p-0 shadow-glow">
              <div className="absolute inset-0 bg-grid opacity-20" />
              <div className="relative flex flex-col items-center gap-3 p-8 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                  <GraduationCap className="size-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Ready to learn?</h3>
                <p className="max-w-md text-white/90">
                  Turn insight into expertise. Explore world-class courses taught by
                  industry leaders.
                </p>
                <Button
                  size="lg"
                  variant="secondary"
                  className="mt-2 bg-white text-primary hover:bg-white/90"
                  onClick={() => navigate("catalog")}
                >
                  Browse courses
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Author card */}
          <Card className="glass p-5 shadow-premium">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Written by
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarImage src={post.authorAvatar} alt={post.authorName} />
                <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{post.authorName}</p>
                <p className="text-xs text-muted-foreground">Instructor at Learniverse</p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-lg font-bold tabular-nums">{post.readingMins}</p>
                <p className="text-xs text-muted-foreground">min read</p>
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums">{formatNumber(post.views)}</p>
                <p className="text-xs text-muted-foreground">views</p>
              </div>
            </div>
          </Card>

          {/* Related posts */}
          {related.length > 0 && (
            <Card className="glass p-5 shadow-premium">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Related articles
              </p>
              <div className="mt-3 space-y-3">
                {related.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => openBlog(r.slug)}
                    className="group flex w-full items-center gap-3 rounded-md p-1.5 text-left transition-colors hover:bg-accent/50"
                  >
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      <img
                        src={r.coverImage ?? ""}
                        alt={r.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-primary">
                        {r.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {r.readingMins} min read
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Share */}
          <Card className="glass p-5 shadow-premium">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Share
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="size-4" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = typeof window !== "undefined" ? window.location.href : "";
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard
                      .writeText(url)
                      .then(() => toast.success("Link copied"));
                  }
                }}
              >
                <Link2 className="size-4" />
                Copy link
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </article>
  );
}

export default BlogPostView;

// ---------------------------------------------------------------------------
// Markdown rendering with custom-styled elements (no @tailwindcss/typography)
// ---------------------------------------------------------------------------
function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="text-[15px] leading-relaxed text-foreground/90">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="mt-8 text-3xl font-bold tracking-tight first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-8 text-2xl font-bold tracking-tight first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 text-xl font-semibold tracking-tight">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="mt-5 text-lg font-semibold">{children}</h4>
          ),
          p: ({ children }) => (
            <p className="mt-4 leading-relaxed text-muted-foreground first:mt-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mt-4 list-disc space-y-1.5 pl-6 text-muted-foreground marker:text-primary">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mt-4 list-decimal space-y-1.5 pl-6 text-muted-foreground marker:text-primary marker:font-semibold">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="mt-6 border-l-4 border-primary bg-muted/40 py-3 pl-4 pr-3 italic text-foreground/90">
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-primary">
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mt-6 overflow-x-auto rounded-lg border bg-muted/60 p-4 font-mono text-sm scrollbar-thin">
              {children}
            </pre>
          ),
          hr: () => <Separator className="my-8" />,
          table: ({ children }) => (
            <div className="mt-6 overflow-x-auto scrollbar-thin">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border bg-muted/60 px-3 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-3 py-2 text-muted-foreground">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

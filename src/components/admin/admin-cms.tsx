"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Globe, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CmsPage {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  content: string;
  lastUpdated: string;
}

const INITIAL_PAGES: CmsPage[] = [
  {
    id: "home",
    label: "Homepage Hero",
    title: "Learn Skills That Pay Off",
    subtitle:
      "Premium digital courses taught by world-class instructors. Lifetime access, verifiable certificates.",
    content:
      "## Master the skills that define the next decade\n\nWaynes is where India's top engineers, designers, and product leaders teach what they know. Join 95,000+ learners building careers that matter.\n\n### Why Waynes?\n\n- World-class instructors\n- Project-based learning\n- Lifetime access\n- Verifiable certificates",
    lastUpdated: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "about",
    label: "About Us",
    title: "We're on a mission to democratize world-class education",
    subtitle: "Built by educators, engineers, and designers who believe learning should be transformative.",
    content:
      "## Our Story\n\nFounded in 2024, Waynes started with a simple question: *what if the best engineers, designers, and product leaders in India taught what they actually do at work?*\n\nToday, we serve 95,000+ learners across 42 countries.\n\n### Our Values\n\n- **Quality over quantity** — every course is hand-crafted\n- **Outcome-focused** — skills that lead to careers\n- **Lifelong access** — learn at your own pace, forever",
    lastUpdated: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "terms",
    label: "Terms of Service",
    title: "Terms of Service",
    subtitle: "Last updated: January 2025",
    content:
      "## 1. Acceptance of Terms\n\nBy accessing Waynes, you agree to be bound by these Terms.\n\n## 2. Use of Service\n\nYou may use Waynes for personal, non-commercial educational purposes.\n\n## 3. Intellectual Property\n\nAll course content is owned by Waynes and its instructors.\n\n## 4. Refunds\n\n7-day no-questions-asked refund window applies to all purchases.",
    lastUpdated: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: "privacy",
    label: "Privacy Policy",
    title: "Privacy Policy",
    subtitle: "How we collect, use, and protect your data.",
    content:
      "## Information We Collect\n\n- Account info (name, email)\n- Payment references (we never store full card details)\n- Learning progress\n\n## How We Use It\n\n- To provide and improve the service\n- To issue certificates\n- To send you product updates\n\n## Your Rights\n\nYou can request data export or deletion at any time.",
    lastUpdated: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: "contact",
    label: "Contact",
    title: "Get in Touch",
    subtitle: "We'd love to hear from you. Reach out for support, partnerships, or just to say hi.",
    content:
      "## Support\n\nEmail: support@waynes.io\nResponse time: within 24 hours\n\n## Partnerships\n\nFor instructor or enterprise partnerships: partners@waynes.io\n\n## Office\n\nWaynes HQ\nBengaluru, India 560001",
    lastUpdated: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
];

export function AdminCms() {
  const [pages, setPages] = useState<CmsPage[]>(INITIAL_PAGES);
  const [activeId, setActiveId] = useState<string>(INITIAL_PAGES[0].id);
  const [draft, setDraft] = useState<CmsPage>(INITIAL_PAGES[0]);

  const active = pages.find((p) => p.id === activeId) ?? pages[0];

  const selectPage = (id: string) => {
    const p = pages.find((x) => x.id === id);
    if (!p) return;
    setActiveId(id);
    setDraft(p);
  };

  const save = () => {
    if (!draft.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setPages((ps) =>
      ps.map((p) =>
        p.id === activeId
          ? { ...draft, lastUpdated: new Date().toISOString() }
          : p
      )
    );
    toast.success("CMS page updated (demo)");
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      {/* Page selector */}
      <div className="lg:col-span-1">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="size-4 text-primary" /> CMS Pages
            </CardTitle>
            <CardDescription className="text-xs">
              Edit static content shown on the site.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            <div className="flex flex-col gap-1">
              {pages.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectPage(p.id)}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    activeId === p.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Globe className="size-3.5" />
                    <span className="text-xs font-medium">{p.label}</span>
                  </span>
                  {activeId === p.id && (
                    <span className="size-1.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Editor */}
      <div className="lg:col-span-3">
        <motion.div
          key={activeId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base">{active.label}</CardTitle>
                <CardDescription className="text-xs">
                  Last updated {new Date(active.lastUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Live
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="cms-title" className="text-xs">Title</Label>
                <Input
                  id="cms-title"
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  placeholder="Page title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cms-subtitle" className="text-xs">Subtitle</Label>
                <Input
                  id="cms-subtitle"
                  value={draft.subtitle}
                  onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))}
                  placeholder="Supporting tagline"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cms-content" className="text-xs">
                  Content (Markdown supported)
                </Label>
                <Textarea
                  id="cms-content"
                  rows={12}
                  value={draft.content}
                  onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                  className="font-mono text-xs"
                  placeholder="## Heading…"
                />
                <p className="text-[10px] text-muted-foreground">
                  {draft.content.length} characters • {draft.content.split("\n").length} lines
                </p>
              </div>

              <Separator />

              {/* Preview */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Live Preview
                </p>
                <div className="rounded-xl border border-border/60 bg-gradient-to-br from-emerald-500/[0.03] to-transparent p-5">
                  <h3 className="text-lg font-bold tracking-tight">{draft.title || "Untitled"}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{draft.subtitle}</p>
                  <div className="mt-3 space-y-2 text-sm">
                    {draft.content.split("\n").slice(0, 6).map((line, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        {line.startsWith("## ") ? (
                          <span className="font-semibold text-foreground">{line.replace(/^##\s/, "")}</span>
                        ) : line.startsWith("### ") ? (
                          <span className="font-medium">{line.replace(/^###\s/, "")}</span>
                        ) : (
                          line
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDraft(active)}>
                  Reset
                </Button>
                <Button onClick={save} className="gap-1.5">
                  <Save className="size-4" /> Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default AdminCms;

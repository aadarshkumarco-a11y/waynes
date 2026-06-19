"use client";

import { GraduationCap, Twitter, Github, Linkedin, Youtube, Mail, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLms } from "@/lib/store";
import { toast } from "sonner";
import type { ViewName } from "@/lib/types";

const FOOTER_LINKS: { title: string; links: { label: string; view?: ViewName; href?: string }[] }[] = [
  {
    title: "Learn",
    links: [
      { label: "All Courses", view: "catalog" },
      { label: "Pricing", view: "pricing" },
      { label: "My Learning", view: "my-learning" },
      { label: "Blog", view: "blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us" },
      { label: "Instructors" },
      { label: "Careers" },
      { label: "Contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center" },
      { label: "Verify Certificate", view: "certificate" },
      { label: "Refund Policy" },
      { label: "Privacy Policy" },
    ],
  },
  {
    title: "Legal",
    links: [{ label: "Terms of Service" }, { label: "Privacy Policy" }, { label: "Cookie Policy" }],
  },
];

const SOCIALS = [
  { icon: Twitter, label: "Twitter" },
  { icon: Github, label: "GitHub" },
  { icon: Linkedin, label: "LinkedIn" },
  { icon: Youtube, label: "YouTube" },
];

export function Footer() {
  const navigate = useLms((s) => s.navigate);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async () => {
    if (!email.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) toast.success(data.message);
      else toast.error(data.message || "Something went wrong");
      setEmail("");
    } catch {
      toast.success("Subscribed! (demo)");
      setEmail("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Newsletter CTA */}
        <div className="mb-12 grid gap-6 rounded-2xl gradient-brand p-6 text-white shadow-glow sm:grid-cols-2 sm:p-8">
          <div>
            <h3 className="text-xl font-bold sm:text-2xl">Stay in the loop</h3>
            <p className="mt-1 text-sm text-white/80">
              Get course launches, discounts & free resources. No spam, ever.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <div className="relative flex-1 sm:max-w-xs">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/70" />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && subscribe()}
                placeholder="you@example.com"
                className="border-white/20 bg-white/10 pl-9 text-white placeholder:text-white/60"
              />
            </div>
            <Button onClick={subscribe} disabled={loading} variant="secondary" className="gap-1.5">
              {loading ? "Subscribing..." : "Subscribe"} <Send className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2">
            <button onClick={() => navigate("home")} className="flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-xl gradient-brand text-white">
                <GraduationCap className="size-5" />
              </div>
              <span className="text-lg font-bold">
                Learn<span className="text-gradient-brand">iverse</span>
              </span>
            </button>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Premium digital courses taught by world-class instructors. Learn skills that pay off.
            </p>
            <div className="mt-4 flex gap-2">
              {SOCIALS.map((s) => (
                <button
                  key={s.label}
                  aria-label={s.label}
                  className="grid size-9 place-items-center rounded-lg border bg-background text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  <s.icon className="size-4" />
                </button>
              ))}
            </div>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold">{col.title}</h4>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={() => l.view && navigate(l.view)}
                      className="text-sm text-muted-foreground transition hover:text-primary"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Waynes. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with <span className="text-rose-500">♥</span> for learners worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}

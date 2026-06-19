"use client";

import { useState } from "react";
import {
  Terminal,
  Twitter,
  Github,
  MessageCircle,
  Mail,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLms } from "@/lib/store";
import { toast } from "sonner";
import type { ViewName } from "@/lib/types";

const FOOTER_LINKS: {
  title: string;
  links: { label: string; view?: ViewName }[];
}[] = [
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
    links: [{ label: "About" }, { label: "Instructors" }, { label: "Careers" }, { label: "Contact" }],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center" },
      { label: "Verify Certificate", view: "certificate" },
      { label: "Refund Policy" },
      { label: "Privacy" },
    ],
  },
];

const SOCIALS = [
  { icon: Twitter, label: "Twitter" },
  { icon: Github, label: "GitHub" },
  { icon: MessageCircle, label: "Discord" },
];

export function Footer() {
  const navigate = useLms((s) => s.navigate);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async () => {
    if (!email.includes("@")) {
      toast.error("Invalid email format");
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
      else toast.error(data.message || "Transmission failed");
      setEmail("");
    } catch {
      toast.success("Subscribed! (demo)");
      setEmail("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="mt-auto border-t border-primary/30 bg-background">
      {/* Newsletter strip — "Join the underground" */}
      <div className="border-b border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-cyan-500/5">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md border border-primary/50 bg-primary/10 text-primary glow-green">
              <Terminal className="size-4" />
            </span>
            <div>
              <h3 className="font-mono text-base font-bold tracking-tight text-primary text-glow-green">
                Join the underground
              </h3>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {"> "}zero-day drops, lab releases, bounty tips. No spam.
              </p>
            </div>
          </div>
          <div className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && subscribe()}
                placeholder="anon@protonmail.com"
                className="rounded-none border-border/50 bg-background/60 pl-9 font-mono text-xs lowercase focus-visible:border-primary"
              />
            </div>
            <Button
              onClick={subscribe}
              disabled={loading}
              className="gap-1.5 rounded-none font-mono text-xs uppercase tracking-wider"
            >
              {loading ? "tx..." : "Subscribe"} <Send className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Links grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2">
            <button
              onClick={() => navigate("home")}
              className="flex items-center gap-2.5"
              aria-label="Waynes home"
            >
              <span className="grid size-9 place-items-center rounded-md border border-primary/50 bg-primary/10 font-mono text-sm font-bold text-primary">
                {">_"}
              </span>
              <span className="font-mono text-lg font-bold text-primary text-glow-green">
                waynes<span className="text-foreground">.io</span>
              </span>
            </button>
            <p className="mt-3 max-w-xs font-mono text-xs text-muted-foreground">
              Hack legally. Learn deeply. Earn massively.
            </p>
            <div className="mt-4 flex gap-2">
              {SOCIALS.map((s) => (
                <button
                  key={s.label}
                  aria-label={s.label}
                  className="grid size-9 place-items-center rounded-md border border-border/50 bg-card text-muted-foreground transition hover:border-primary/60 hover:text-primary hover:glow-green"
                >
                  <s.icon className="size-4" />
                </button>
              ))}
            </div>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-primary/80">
                {col.title}
              </h4>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={() => l.view && navigate(l.view)}
                      className="font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-primary/20 pt-5">
          <div className="flex items-center justify-center gap-2 font-mono text-[11px] text-muted-foreground/60">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30" />
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3 text-primary/70" />
              [ SECURE ]
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30" />
          </div>
          <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} waynes.io — access granted.
          </p>
        </div>
      </div>
    </footer>
  );
}

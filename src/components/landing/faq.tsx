"use client";

import { MessageCircleQuestion, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { AnimatedReveal } from "@/components/lms/animated-reveal";
import { siteFaqs } from "@/lib/data/catalog";
import { useLms } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function Faq() {
  const setAuthOpen = useLms((s) => s.setAuthOpen);

  return (
    <section className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* Left column — heading + CTA */}
          <AnimatedReveal className="lg:sticky lg:top-24 lg:self-start">
            <Badge
              variant="outline"
              className="mb-3 gap-1.5 rounded-full border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300"
            >
              <HelpCircle className="size-3.5" />
              FAQ
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Questions?
              <br />
              <span className="text-gradient-brand">We&apos;ve got answers</span>
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Everything you need to know about courses, payments, certificates and more.
              Can&apos;t find what you&apos;re looking for?
            </p>

            <div className="mt-6 flex items-center gap-3 rounded-2xl border bg-card/50 p-4 backdrop-blur">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
                <MessageCircleQuestion className="size-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Still have questions?</p>
                <p className="text-xs text-muted-foreground">
                  Sign up and reach out to our team.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAuthOpen(true, "signup")}
              >
                Contact
              </Button>
            </div>
          </AnimatedReveal>

          {/* Right column — accordion */}
          <AnimatedReveal delay={150}>
            <Accordion
              type="single"
              collapsible
              defaultValue="faq-0"
              className="w-full"
            >
              {siteFaqs.map((faq, i) => (
                <AccordionItem
                  key={faq.q}
                  value={`faq-${i}`}
                  className="rounded-xl border bg-card/40 px-4 transition-colors data-[state=open]:bg-card/70 [&:not(:last-child)]:mb-3"
                >
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AnimatedReveal>
        </div>
      </div>
    </section>
  );
}

"use client";

import { Hero } from "@/components/landing/hero";
import { Stats } from "@/components/landing/stats";
import { CourseShowcase } from "@/components/landing/course-showcase";
import { Features } from "@/components/landing/features";
import { Benefits } from "@/components/landing/benefits";
import { Testimonials } from "@/components/landing/testimonials";
import { Instructors } from "@/components/landing/instructors";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { CtaSection } from "@/components/landing/cta";
import { AnimatedReveal } from "@/components/lms/animated-reveal";

export function HomeView() {
  return (
    <div id="home" className="flex flex-col">
      <Hero />

      <AnimatedReveal>
        <Stats />
      </AnimatedReveal>

      <AnimatedReveal>
        <CourseShowcase />
      </AnimatedReveal>

      <AnimatedReveal>
        <Features />
      </AnimatedReveal>

      <AnimatedReveal>
        <Benefits />
      </AnimatedReveal>

      <AnimatedReveal>
        <Testimonials />
      </AnimatedReveal>

      <AnimatedReveal>
        <Instructors />
      </AnimatedReveal>

      <AnimatedReveal>
        <Pricing />
      </AnimatedReveal>

      <AnimatedReveal>
        <Faq />
      </AnimatedReveal>

      <AnimatedReveal>
        <CtaSection />
      </AnimatedReveal>
    </div>
  );
}

export default HomeView;

"use client";

import { useSyncExternalStore } from "react";
import { GraduationCap } from "lucide-react";
import { useLms } from "@/lib/store";
import { Navbar } from "@/components/lms/navbar";
import { Footer } from "@/components/lms/footer";
import { AuthModal } from "@/components/lms/auth-modal";
import { HomeView } from "@/components/landing/home-view";
import { CatalogView } from "@/components/lms/catalog-view";
import { CourseDetailView } from "@/components/lms/course-detail-view";
import { LearnView } from "@/components/lms/learn-view";
import { CheckoutView } from "@/components/lms/checkout-view";
import { MyLearningView } from "@/components/lms/my-learning-view";
import { BlogView } from "@/components/lms/blog-view";
import { BlogPostView } from "@/components/lms/blog-post-view";
import { CertificateView } from "@/components/lms/certificate-view";
import { PricingView } from "@/components/lms/pricing-view";
import { AdminView } from "@/components/admin/admin-view";

// Lint-safe "is this the client?" detection — no setState-in-effect.
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true, // client snapshot
    () => false // server snapshot
  );
}

function renderView(view: string) {
  switch (view) {
    case "home":
      return <HomeView />;
    case "catalog":
      return <CatalogView />;
    case "course":
      return <CourseDetailView />;
    case "learn":
      return <LearnView />;
    case "checkout":
      return <CheckoutView />;
    case "my-learning":
    case "dashboard":
      return <MyLearningView />;
    case "blog":
      return <BlogView />;
    case "blog-post":
      return <BlogPostView />;
    case "certificate":
      return <CertificateView />;
    case "pricing":
      return <PricingView />;
    case "admin":
      return <AdminView />;
    default:
      return <HomeView />;
  }
}

export default function Home() {
  const view = useLms((s) => s.view);
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="relative">
          <div className="grid size-14 place-items-center rounded-2xl gradient-brand text-white shadow-glow">
            <GraduationCap className="size-8" />
          </div>
          <div className="absolute inset-0 -z-10 animate-ping rounded-2xl bg-primary/30" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          Loading Waynes…
        </div>
      </div>
    );
  }

  const isAdmin = view === "admin";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AuthModal />
      {isAdmin ? (
        <AdminView />
      ) : (
        <>
          <Navbar />
          <main className="flex-1">{renderView(view)}</main>
          {view !== "learn" && <Footer />}
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Bell,
  BookOpen,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  Menu,
  Settings as SettingsIcon,
  Shield,
  ShoppingCart,
  Star,
  Ticket,
  Users,
  X,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLms } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { AdminTab } from "@/lib/types";
import { AdminOverview } from "./admin-overview";
import { AdminOrders } from "./admin-orders";
import { AdminCourses } from "./admin-courses";
import { AdminCoupons } from "./admin-coupons";
import { AdminStudents } from "./admin-students";
import { AdminActivity } from "./admin-activity";
import { AdminNotifications } from "./admin-notifications";
import { AdminAnnouncements } from "./admin-announcements";
import { AdminReviews } from "./admin-reviews";
import { AdminBlog } from "./admin-blog";
import { AdminCms } from "./admin-cms";
import { AdminSettings } from "./admin-settings";

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "Insights" | "Commerce" | "Content" | "Engagement" | "System";
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, group: "Insights" },
  { id: "orders", label: "Orders", icon: ShoppingCart, group: "Commerce" },
  { id: "courses", label: "Courses", icon: BookOpen, group: "Commerce" },
  { id: "coupons", label: "Coupons", icon: Ticket, group: "Commerce" },
  { id: "students", label: "Students", icon: Users, group: "Commerce" },
  { id: "reviews", label: "Reviews", icon: Star, group: "Content" },
  { id: "blog", label: "Blog", icon: FileText, group: "Content" },
  { id: "cms", label: "CMS Pages", icon: FileText, group: "Content" },
  { id: "notifications", label: "Notifications", icon: Bell, group: "Engagement" },
  { id: "announcements", label: "Announcements", icon: Megaphone, group: "Engagement" },
  { id: "activity", label: "Activity Log", icon: Activity, group: "System" },
  { id: "settings", label: "Settings", icon: SettingsIcon, group: "System" },
];

const NAV_GROUPS: NavItem["group"][] = [
  "Insights",
  "Commerce",
  "Content",
  "Engagement",
  "System",
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const adminTab = useLms((s) => s.adminTab);
  const setAdminTab = useLms((s) => s.setAdminTab);
  const orders = useLms((s) => s.orders);
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  return (
    <nav className="flex h-full flex-col gap-1 px-3 py-4" aria-label="Admin sidebar">
      {NAV_GROUPS.map((group) => {
        const items = NAV_ITEMS.filter((i) => i.group === group);
        if (!items.length) return null;
        return (
          <div key={group} className="mb-1">
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group}
            </p>
            <div className="flex flex-col gap-0.5">
              {items.map((item) => {
                const Icon = item.icon;
                const active = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setAdminTab(item.id);
                      onNavigate?.();
                    }}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      "hover:bg-accent hover:text-accent-foreground",
                      active && "bg-primary/10 text-primary"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="admin-nav-active"
                        className="absolute inset-y-1 left-0 w-1 rounded-r-full gradient-brand"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-colors",
                        active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.id === "orders" && pendingCount > 0 && (
                      <Badge className="h-5 gap-1 px-1.5 text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20">
                        {pendingCount}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function AccessDenied() {
  const enterAdminDemo = useLms((s) => s.enterAdminDemo);
  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden p-6">
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
      <div className="absolute -z-10 left-1/2 top-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/10 blur-[120px]" aria-hidden />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong relative w-full max-w-md rounded-2xl border border-border/60 p-8 text-center shadow-premium"
      >
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20">
          <Shield className="size-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Access Denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You need <span className="font-semibold text-foreground">Super Admin</span> privileges to
          view the Waynes admin dashboard. Switch to the demo admin account to explore the panel.
        </p>
        <Button onClick={enterAdminDemo} className="mt-6 w-full gap-2" size="lg">
          <Shield className="size-4" /> Switch to Admin (Demo)
        </Button>
      </motion.div>
    </div>
  );
}

export function AdminView() {
  const user = useLms((s) => s.user);
  const adminTab = useLms((s) => s.adminTab);
  const navigate = useLms((s) => s.navigate);
  const logout = useLms((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (user?.role !== "SUPER_ADMIN") return <AccessDenied />;

  const currentNav = NAV_ITEMS.find((i) => i.id === adminTab);

  const renderTab = () => {
    switch (adminTab) {
      case "overview":
        return <AdminOverview />;
      case "orders":
        return <AdminOrders />;
      case "courses":
        return <AdminCourses />;
      case "coupons":
        return <AdminCoupons />;
      case "students":
        return <AdminStudents />;
      case "reviews":
        return <AdminReviews />;
      case "blog":
        return <AdminBlog />;
      case "cms":
        return <AdminCms />;
      case "notifications":
        return <AdminNotifications />;
      case "announcements":
        return <AdminAnnouncements />;
      case "activity":
        return <AdminActivity />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background bg-grid">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-sidebar/50 backdrop-blur-xl lg:block">
        <div className="flex h-16 items-center gap-2 border-b border-border/60 px-5">
          <div className="grid size-9 place-items-center rounded-xl gradient-brand text-white shadow-glow">
            <GraduationCap className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight">
              Learn<span className="text-gradient-brand">iverse</span>
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Admin Console
            </p>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] scrollbar-thin">
          <SidebarContent />
        </ScrollArea>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <div className="flex h-16 items-center gap-2 border-b border-border/60 px-5">
            <div className="grid size-9 place-items-center rounded-xl gradient-brand text-white">
              <GraduationCap className="size-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold">
                Learn<span className="text-gradient-brand">iverse</span>
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Admin Console
              </p>
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-4rem)] scrollbar-thin">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 glass-strong border-b border-border/60">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            <div className="flex min-w-0 items-center gap-2">
              {currentNav && (
                <currentNav.icon className="size-5 text-primary" />
              )}
              <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
                {currentNav?.label ?? "Admin"}
              </h1>
              <Badge
                variant="secondary"
                className="hidden items-center gap-1 sm:inline-flex"
              >
                <Shield className="size-3" /> Super Admin
              </Badge>
            </div>

            <div className="ml-auto flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("home")}
                className="gap-1.5"
              >
                <ExternalLink className="size-4" />
                <span className="hidden sm:inline">View Site</span>
              </Button>
              <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-background/60 px-2.5 py-1.5 sm:flex">
                <Avatar className="size-7">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                  <p className="text-xs font-semibold">{user.name}</p>
                  <p className="max-w-[140px] truncate text-[10px] text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                aria-label="Sign out"
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Tab content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={adminTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile close button when sidebar sheet is open — handled by Sheet itself */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setMobileOpen(false)}
        className="sr-only"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export default AdminView;

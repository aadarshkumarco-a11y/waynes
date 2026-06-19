"use client";

import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Shield,
  ShoppingBag,
  Sparkles,
  User as UserIcon,
  Award,
  X,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/lms/notification-bell";
import { CartDrawer } from "@/components/lms/cart-drawer";
import { useLms } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ViewName } from "@/lib/types";

const NAV_LINKS: { label: string; view: ViewName }[] = [
  { label: "Home", view: "home" },
  { label: "Courses", view: "catalog" },
  { label: "Pricing", view: "pricing" },
  { label: "Blog", view: "blog" },
];

export function Navbar() {
  const { user, navigate, view, searchQuery, setSearchQuery, setAuthOpen, logout, setMobileMenuOpen, mobileMenuOpen } =
    useLms();
  const [searchOpen, setSearchOpen] = useState(false);

  const isAdmin = user?.role === "SUPER_ADMIN";

  const goSearch = () => {
    navigate("catalog");
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass-strong border-b border-border/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <button
            onClick={() => navigate("home")}
            className="flex shrink-0 items-center gap-2"
            aria-label="Waynes home"
          >
            <div className="grid size-9 place-items-center rounded-xl gradient-brand text-white shadow-glow">
              <GraduationCap className="size-5" />
            </div>
            <span className="hidden text-lg font-bold tracking-tight sm:block">
              Learn<span className="text-gradient-brand">iverse</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="ml-2 hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <button
                key={l.view}
                onClick={() => navigate(l.view)}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  view === l.view && "text-primary"
                )}
              >
                {l.label}
                {view === l.view && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-primary"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Search (desktop) */}
          <div className="ml-auto hidden flex-1 justify-end lg:flex">
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && goSearch()}
                onFocus={() => navigate("catalog")}
                placeholder="Search courses..."
                className="h-9 rounded-full bg-background/60 pl-9 pr-4"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1 lg:ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full lg:hidden"
              onClick={() => setSearchOpen((s) => !s)}
              aria-label="Search"
            >
              <Search className="size-[18px]" />
            </Button>
            <ThemeToggle />
            <CartDrawer>
              <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Cart">
                <ShoppingBag className="size-[18px]" />
                <CartBadge />
              </Button>
            </CartDrawer>
            <NotificationBell />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-1 rounded-full ring-offset-background transition hover:ring-2 hover:ring-primary/40">
                    <Avatar className="size-9 border-2 border-background">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="font-semibold">{user.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                    {isAdmin && (
                      <Badge className="mt-1 w-fit gap-1" variant="secondary">
                        <Shield className="size-3" /> Super Admin
                      </Badge>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("my-learning")}>
                    <BookOpen className="size-4" /> My Learning
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("dashboard")}>
                    <LayoutDashboard className="size-4" /> Dashboard
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => window.open("/admin.html", "_blank")}>
                      <Shield className="size-4" /> Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate("certificate")}>
                    <Award className="size-4" /> Certificates
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="size-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                className="ml-1 gap-1.5 rounded-full"
                onClick={() => setAuthOpen(true, "login")}
              >
                <Sparkles className="size-4" /> Sign in
              </Button>
            )}

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full md:hidden" aria-label="Menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="grid size-8 place-items-center rounded-lg gradient-brand text-white">
                      <GraduationCap className="size-4" />
                    </div>
                    Waynes
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex flex-col gap-1">
                  {NAV_LINKS.map((l) => (
                    <button
                      key={l.view}
                      onClick={() => navigate(l.view)}
                      className={cn(
                        "rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-accent",
                        view === l.view && "bg-accent text-primary"
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
                {searchOpen && (
                  <div className="mt-4">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && goSearch()}
                        placeholder="Search courses..."
                        className="pl-9"
                      />
                    </div>
                  </div>
                )}
                {!user && (
                  <div className="mt-6 flex flex-col gap-2">
                    <Button onClick={() => setAuthOpen(true, "login")} className="w-full">
                      Sign in
                    </Button>
                    <Button variant="outline" onClick={() => setAuthOpen(true, "signup")} className="w-full">
                      Create account
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile search bar (toggleable) */}
        {searchOpen && (
          <div className="border-t px-4 py-2 lg:hidden">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && goSearch()}
                placeholder="Search courses..."
                className="pl-9"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function CartBadge() {
  const count = useLms((s) => s.items.length);
  if (!count) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 grid size-4.5 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
      {count}
    </span>
  );
}

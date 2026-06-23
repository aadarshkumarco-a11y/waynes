"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Terminal,
  Search as SearchIcon,
  ShoppingBag,
  Bell,
  Menu,
  BookOpen,
  LayoutDashboard,
  Award,
  LogOut,
  LogIn,
  Shield,
  ChevronRight,
  Package,
} from "lucide-react";
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
  const {
    user,
    navigate,
    view,
    searchQuery,
    setSearchQuery,
    setAuthOpen,
    logout,
    setMobileMenuOpen,
    mobileMenuOpen,
  } = useLms();
  const [searchOpen, setSearchOpen] = useState(false);

  const isAdmin = user?.role === "SUPER_ADMIN";

  const goSearch = () => {
    navigate("catalog");
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main bar */}
      <div className="glass-strong border-b border-primary/30">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* Logo — terminal badge */}
          <button
            onClick={() => navigate("home")}
            className="flex shrink-0 items-center gap-2.5"
            aria-label="Waynes home"
          >
            <span className="grid size-9 place-items-center rounded-md border border-primary/50 bg-primary/10 font-mono text-sm font-bold text-primary glow-green">
              {">_"}
            </span>
            <span className="hidden font-mono text-lg font-bold tracking-tight text-primary text-glow-green sm:block">
              waynes<span className="text-foreground">.io</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav
            className="ml-2 hidden items-center gap-0.5 md:flex"
            aria-label="Primary"
          >
            {NAV_LINKS.map((l) => (
              <button
                key={l.view}
                onClick={() => navigate(l.view)}
                className={cn(
                  "relative rounded px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors hover:text-primary",
                  view === l.view ? "text-primary" : "text-muted-foreground"
                )}
              >
                {l.label}
                {view === l.view && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-x-2 -bottom-0.5 h-px bg-primary glow-green"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Search (desktop) */}
          <div className="ml-auto hidden max-w-xs flex-1 justify-end lg:flex">
            <div className="group relative w-full">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && goSearch()}
                onFocus={() => navigate("catalog")}
                placeholder="grep courses..."
                className="h-9 rounded-none border-border/50 bg-background/60 pl-9 pr-3 font-mono text-xs lowercase focus-visible:border-primary"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-0.5 lg:ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-md lg:hidden"
              onClick={() => setSearchOpen((s) => !s)}
              aria-label="Search"
            >
              <SearchIcon className="size-[18px]" />
            </Button>
            <ThemeToggle />
            <CartDrawer>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-md"
                aria-label="Cart"
              >
                <ShoppingBag className="size-[18px]" />
                <CartBadge />
              </Button>
            </CartDrawer>
            <NotificationBell />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="ml-1 rounded-md ring-offset-background transition hover:ring-1 hover:ring-primary/60"
                    aria-label="Account menu"
                  >
                    <Avatar className="size-9 border border-primary/40">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 font-mono text-xs text-primary">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="font-mono text-sm font-semibold text-primary">
                      {user.name}
                    </span>
                    <span className="font-mono text-xs font-normal text-muted-foreground">
                      {user.email}
                    </span>
                    {isAdmin && (
                      <Badge
                        className="mt-1 w-fit gap-1 border-primary/40 bg-primary/10 text-primary"
                        variant="outline"
                      >
                        <Shield className="size-3" /> root
                      </Badge>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("my-learning")}>
                    <BookOpen className="size-4" /> My Learning
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("my-orders")}>
                    <Package className="size-4" /> My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("dashboard")}>
                    <LayoutDashboard className="size-4" /> Dashboard
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem
                      onClick={() => window.open("/admin.html", "_blank")}
                    >
                      <Shield className="size-4" /> Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate("certificate")}>
                    <Award className="size-4" /> Certificates
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="size-4" /> sign_out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="ml-1 gap-1.5 rounded-md border-primary/50 font-mono text-xs uppercase tracking-wider text-primary hover:bg-primary/10 hover:text-primary"
                onClick={() => setAuthOpen(true, "login")}
              >
                <Terminal className="size-3.5" /> Sign in
              </Button>
            )}

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-md md:hidden"
                  aria-label="Menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-80 border-primary/30 bg-background p-0"
              >
                <SheetHeader className="border-b border-primary/20 px-5 py-4">
                  <SheetTitle className="flex items-center gap-2 font-mono">
                    <span className="grid size-8 place-items-center rounded-md border border-primary/50 bg-primary/10 text-primary">
                      {">_"}
                    </span>
                    <span className="text-primary text-glow-green">waynes</span>
                    <span className="text-muted-foreground">.io</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-0.5 px-3 py-4">
                  {NAV_LINKS.map((l) => (
                    <button
                      key={l.view}
                      onClick={() => navigate(l.view)}
                      className={cn(
                        "flex items-center justify-between rounded px-3 py-2.5 text-left font-mono text-sm uppercase tracking-wider transition-colors hover:bg-primary/5 hover:text-primary",
                        view === l.view
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      <span>~/{l.label.toLowerCase()}</span>
                      <ChevronRight className="size-4 opacity-50" />
                    </button>
                  ))}
                </div>
                {searchOpen && (
                  <div className="px-3 pb-2">
                    <div className="relative">
                      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && goSearch()}
                        placeholder="grep courses..."
                        className="rounded-none border-border/50 pl-9 font-mono text-xs lowercase"
                      />
                    </div>
                  </div>
                )}
                {!user && (
                  <div className="mt-auto flex flex-col gap-2 border-t border-primary/20 px-5 py-4">
                    <Button
                      onClick={() => setAuthOpen(true, "login")}
                      className="w-full gap-1.5 rounded-md font-mono text-xs uppercase tracking-wider"
                    >
                      <Terminal className="size-3.5" /> Access Terminal
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setAuthOpen(true, "signup")}
                      className="w-full gap-1.5 rounded-md border-primary/40 font-mono text-xs uppercase tracking-wider text-primary hover:bg-primary/10 hover:text-primary"
                    >
                      Create Access
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile search bar (toggleable) */}
        {searchOpen && (
          <div className="border-t border-primary/20 px-4 py-2 lg:hidden">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && goSearch()}
                placeholder="grep courses..."
                className="rounded-none border-border/50 pl-9 font-mono text-xs lowercase"
              />
            </div>
          </div>
        )}
      </div>

      {/* Terminal status strip */}
      <div className="border-b border-primary/20 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-1 font-mono text-[11px] text-muted-foreground sm:px-6 lg:px-8">
          <span className="size-1.5 animate-pulse rounded-full bg-primary glow-green" />
          <span className="text-primary/80">root@waynes</span>
          <span className="text-muted-foreground/60">:</span>
          <span className="text-cyan-400/80">~</span>
          <span className="text-muted-foreground/60">#</span>
          <span className="hidden sm:inline">system online</span>
          <span className="cursor-blink text-primary" />
          <span className="ml-auto hidden items-center gap-1.5 sm:flex">
            <Bell className="size-3" />
            <span>uptime 99.9%</span>
          </span>
        </div>
      </div>
    </header>
  );
}

function CartBadge() {
  const count = useLms((s) => s.items.length);
  if (!count) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 grid size-4 min-w-4 place-items-center rounded-full bg-primary px-1 font-mono text-[10px] font-bold text-primary-foreground glow-green">
      {count}
    </span>
  );
}

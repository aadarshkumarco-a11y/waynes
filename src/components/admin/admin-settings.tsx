"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CreditCard,
  Globe,
  Moon,
  Palette,
  Save,
  Server,
  Settings as SettingsIcon,
  Shield,
  Store,
  UserCog,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

interface Settings {
  siteName: string;
  tagline: string;
  supportEmail: string;
  currency: string;
  defaultTheme: "light" | "dark" | "system";
  maintenanceMode: boolean;
  signupEnabled: boolean;
  emailVerificationRequired: boolean;
  maxCoursesPerStudent: number;
}

const INITIAL: Settings = {
  siteName: "Waynes",
  tagline: "Learn Skills That Pay Off",
  supportEmail: "support@waynes.io",
  currency: "INR",
  defaultTheme: "dark",
  maintenanceMode: false,
  signupEnabled: true,
  emailVerificationRequired: false,
  maxCoursesPerStudent: 20,
};

function SettingRow({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function AdminSettings() {
  const [s, setS] = useState<Settings>(INITIAL);

  const save = () => {
    toast.success("Platform settings saved (demo)");
  };

  const reset = () => {
    setS(INITIAL);
    toast.info("Settings reset to defaults");
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Sidebar: sections */}
      <div className="lg:col-span-1 space-y-3">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl gradient-brand text-white shadow-glow">
                <SettingsIcon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-bold">Platform Settings</p>
                <p className="text-xs text-muted-foreground">Manage global configuration</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {[
              { label: "API", status: "Operational", color: "bg-emerald-500" },
              { label: "Database", status: "Operational", color: "bg-emerald-500" },
              { label: "Payments", status: "Operational", color: "bg-emerald-500" },
              { label: "CDN", status: "Operational", color: "bg-emerald-500" },
            ].map((x) => (
              <div key={x.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className={cn("size-1.5 rounded-full", x.color)} />
                  {x.label}
                </span>
                <span className="text-muted-foreground">{x.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-gradient-to-br from-amber-500/[0.05] to-transparent">
          <CardContent className="p-4">
            <p className="text-xs font-semibold">⚠️ Demo Mode</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              All settings changes are stored in memory only and reset on page refresh. No real
              backend updates occur.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main form */}
      <div className="lg:col-span-2 space-y-4">
        {/* General */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Store className="size-4 text-primary" /> General
              </CardTitle>
              <CardDescription className="text-xs">
                Basic site identity and contact info.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 divide-y divide-border/40">
              <div className="grid gap-2 py-3">
                <Label htmlFor="s-name" className="text-xs">Site Name</Label>
                <Input
                  id="s-name"
                  value={s.siteName}
                  onChange={(e) => setS((p) => ({ ...p, siteName: e.target.value }))}
                />
              </div>
              <div className="grid gap-2 py-3">
                <Label htmlFor="s-tag" className="text-xs">Tagline</Label>
                <Input
                  id="s-tag"
                  value={s.tagline}
                  onChange={(e) => setS((p) => ({ ...p, tagline: e.target.value }))}
                />
              </div>
              <div className="grid gap-2 py-3">
                <Label htmlFor="s-email" className="text-xs">Support Email</Label>
                <Input
                  id="s-email"
                  type="email"
                  value={s.supportEmail}
                  onChange={(e) => setS((p) => ({ ...p, supportEmail: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Localization & theme */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Globe className="size-4 text-primary" /> Localization & Theme
              </CardTitle>
              <CardDescription className="text-xs">
                Currency and default appearance for new visitors.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border/40">
              <div className="grid gap-2 py-3">
                <Label className="text-xs">Currency</Label>
                <Select
                  value={s.currency}
                  onValueChange={(v) => setS((p) => ({ ...p, currency: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">₹ INR — Indian Rupee</SelectItem>
                    <SelectItem value="USD">$ USD — US Dollar</SelectItem>
                    <SelectItem value="EUR">€ EUR — Euro</SelectItem>
                    <SelectItem value="GBP">£ GBP — British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 py-3">
                <Label className="text-xs">Default Theme</Label>
                <Select
                  value={s.defaultTheme}
                  onValueChange={(v) => setS((p) => ({ ...p, defaultTheme: v as Settings["defaultTheme"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <span className="flex items-center gap-2">
                        <Palette className="size-3.5" /> Light
                      </span>
                    </SelectItem>
                    <SelectItem value="dark">
                      <span className="flex items-center gap-2">
                        <Moon className="size-3.5" /> Dark
                      </span>
                    </SelectItem>
                    <SelectItem value="system">
                      <span className="flex items-center gap-2">
                        <SettingsIcon className="size-3.5" /> System
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Access & security */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Shield className="size-4 text-primary" /> Access & Security
              </CardTitle>
              <CardDescription className="text-xs">
                Control who can sign up and how access is verified.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border/40">
              <SettingRow
                icon={UserCog}
                title="Enable Signups"
                description="Allow new users to create accounts."
              >
                <Switch
                  checked={s.signupEnabled}
                  onCheckedChange={(v) => setS((p) => ({ ...p, signupEnabled: v }))}
                />
              </SettingRow>
              <SettingRow
                icon={Bell}
                title="Require Email Verification"
                description="Force users to verify their email before first login."
              >
                <Switch
                  checked={s.emailVerificationRequired}
                  onCheckedChange={(v) => setS((p) => ({ ...p, emailVerificationRequired: v }))}
                />
              </SettingRow>
              <SettingRow
                icon={CreditCard}
                title="Max Courses Per Student"
                description="Limit on simultaneous active enrollments."
              >
                <Input
                  type="number"
                  value={s.maxCoursesPerStudent}
                  onChange={(e) => setS((p) => ({ ...p, maxCoursesPerStudent: Number(e.target.value) }))}
                  className="w-24 text-center"
                />
              </SettingRow>
            </CardContent>
          </Card>
        </motion.div>

        {/* Maintenance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className={cn(
            "border-border/60",
            s.maintenanceMode && "border-amber-500/40 bg-amber-500/[0.04]"
          )}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Server className="size-4 text-primary" /> Maintenance
              </CardTitle>
              <CardDescription className="text-xs">
                Take the platform offline temporarily for updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border/40">
              <SettingRow
                icon={Server}
                title="Maintenance Mode"
                description="Show a maintenance banner to non-admin users."
              >
                <div className="flex items-center gap-2">
                  {s.maintenanceMode && (
                    <Badge className="bg-amber-500/15 text-amber-600 text-[10px] dark:text-amber-400">
                      Active
                    </Badge>
                  )}
                  <Switch
                    checked={s.maintenanceMode}
                    onCheckedChange={(v) => setS((p) => ({ ...p, maintenanceMode: v }))}
                  />
                </div>
              </SettingRow>
            </CardContent>
          </Card>
        </motion.div>

        <Separator />

        {/* Footer actions */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Changes apply immediately (demo only).
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={reset}>
              Reset
            </Button>
            <Button onClick={save} className="gap-1.5">
              <Save className="size-4" /> Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;

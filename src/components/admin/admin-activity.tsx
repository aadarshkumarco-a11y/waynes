"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity as ActivityIcon,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Filter,
  LogIn,
  LogOut,
  RotateCcw,
  Shield,
  Sparkles,
  Ticket,
  UserPlus,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLms } from "@/lib/store";
import { formatDateTime, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ActionMeta {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

const ACTION_META: Record<string, ActionMeta> = {
  ORDER_CREATED: { label: "Order Created", icon: CreditCard, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  ORDER_APPROVED: { label: "Order Approved", icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  ORDER_REJECTED: { label: "Order Rejected", icon: XCircle, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
  ORDER_REFUNDED: { label: "Order Refunded", icon: RotateCcw, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10" },
  COUPON_CREATED: { label: "Coupon Created", icon: Ticket, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-500/10" },
  LESSON_COMPLETED: { label: "Lesson Completed", icon: FileText, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  LOGIN: { label: "Login", icon: LogIn, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-500/10" },
  LOGOUT: { label: "Logout", icon: LogOut, color: "text-muted-foreground", bg: "bg-muted" },
  SIGNUP: { label: "Signup", icon: UserPlus, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  CERTIFICATE_ISSUED: { label: "Certificate Issued", icon: Shield, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10" },
};

const FALLBACK: ActionMeta = {
  label: "Activity",
  icon: Sparkles,
  color: "text-primary",
  bg: "bg-primary/10",
};

function metaFor(action: string): ActionMeta {
  return ACTION_META[action] ?? FALLBACK;
}

export function AdminActivity() {
  const activities = useLms((s) => s.activities);
  const [filter, setFilter] = useState<string>("ALL");

  const actionTypes = useMemo(() => {
    const set = new Set(activities.map((a) => a.action));
    return ["ALL", ...Array.from(set)];
  }, [activities]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return activities;
    return activities.filter((a) => a.action === filter);
  }, [activities, filter]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = activities.filter(
      (a) => new Date(a.createdAt).getTime() >= today.getTime()
    ).length;
    return {
      total: activities.length,
      today: todayCount,
      approvals: activities.filter((a) => a.action === "ORDER_APPROVED").length,
      rejections: activities.filter((a) => a.action === "ORDER_REJECTED").length,
    };
  }, [activities]);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total Events", value: stats.total, icon: ActivityIcon, color: "text-primary" },
          { label: "Today", value: stats.today, icon: Clock, color: "text-amber-500" },
          { label: "Approvals", value: stats.approvals, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Rejections", value: stats.rejections, icon: XCircle, color: "text-rose-500" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-border/60">
              <CardContent className="flex items-center gap-3 p-4">
                <s.icon className={cn("size-7", s.color)} />
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="size-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Filter by action:</span>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-8 w-[200px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {actionTypes.map((a) => (
              <SelectItem key={a} value={a} className="text-xs">
                {a === "ALL" ? "All Activities" : metaFor(a).label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="ml-auto text-[10px]">
          {filtered.length} events
        </Badge>
      </div>

      {/* Timeline */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Activity Feed</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <ScrollArea className="max-h-[600px] scrollbar-thin pr-3">
            <ol className="relative space-y-1 border-l border-border pl-6">
              {filtered.length === 0 && (
                <li className="py-12 text-center text-sm text-muted-foreground">
                  No activity matches the filter.
                </li>
              )}
              {filtered.map((a, i) => {
                const meta = metaFor(a.action);
                const Icon = meta.icon;
                return (
                  <motion.li
                    key={a.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.15) }}
                    className="relative py-2.5"
                  >
                    <span
                      className={cn(
                        "absolute -left-[31px] top-3 grid size-6 place-items-center rounded-full ring-4 ring-background",
                        meta.bg
                      )}
                    >
                      <Icon className={cn("size-3", meta.color)} />
                    </span>
                    <div className="flex flex-col gap-1 rounded-lg border border-border/60 bg-card/40 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-5">
                            <AvatarFallback className="text-[9px]">
                              {(a.userName ?? "U").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-xs font-medium">{a.userName ?? "System"}</p>
                          <Badge
                            variant="secondary"
                            className={cn("text-[9px]", meta.bg, meta.color)}
                          >
                            {meta.label}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{a.detail}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-[10px] text-muted-foreground">
                        {a.ip && (
                          <span className="hidden items-center gap-1 font-mono sm:flex">
                            <span className="size-1 rounded-full bg-muted-foreground/40" />
                            {a.ip}
                          </span>
                        )}
                        <span title={formatDateTime(a.createdAt)}>{timeAgo(a.createdAt)}</span>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminActivity;

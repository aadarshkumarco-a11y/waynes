"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  Info,
  Link2,
  Megaphone,
  Send,
  ShieldAlert,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import type { NotificationType } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_META: Record<NotificationType, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  INFO: { label: "Info", color: "text-teal-600 dark:text-teal-400 bg-teal-500/10", icon: Info },
  SUCCESS: { label: "Success", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10", icon: Check },
  WARNING: { label: "Warning", color: "text-amber-600 dark:text-amber-400 bg-amber-500/10", icon: ShieldAlert },
  ANNOUNCEMENT: { label: "Announcement", color: "text-violet-600 dark:text-violet-400 bg-violet-500/10", icon: Megaphone },
  ORDER: { label: "Order", color: "text-rose-600 dark:text-rose-400 bg-rose-500/10", icon: ShoppingBag },
};

export function AdminNotifications() {
  const notifications = useLms((s) => s.notifications);
  const broadcastNotification = useLms((s) => s.broadcastNotification);

  const [type, setType] = useState<NotificationType>("INFO");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");

  const stats = useMemo(() => {
    const total = notifications.length;
    const read = notifications.filter((n) => n.read).length;
    const unread = total - read;
    return { total, read, unread };
  }, [notifications]);

  const send = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required");
      return;
    }
    broadcastNotification({
      type,
      title: title.trim(),
      body: body.trim(),
      link: link.trim() || undefined,
    });
    toast.success("Notification broadcast to all users");
    setTitle("");
    setBody("");
    setLink("");
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      {/* Broadcast form */}
      <div className="lg:col-span-2">
        <Card className="sticky top-20 border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Send className="size-4 text-primary" /> Broadcast Notification
            </CardTitle>
            <CardDescription className="text-xs">
              Send a notification to all platform users.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="n-type" className="text-xs">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as NotificationType)}>
                <SelectTrigger id="n-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TYPE_META) as NotificationType[]).map((t) => {
                    const M = TYPE_META[t];
                    const Icon = M.icon;
                    return (
                      <SelectItem key={t} value={t}>
                        <span className="flex items-center gap-2">
                          <Icon className={cn("size-3.5", M.color.split(" ")[0])} />
                          {M.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="n-title" className="text-xs">Title</Label>
              <Input
                id="n-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="New course launched!"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="n-body" className="text-xs">Body</Label>
              <Textarea
                id="n-body"
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message here…"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="n-link" className="text-xs">
                Link (optional) — course ID or path
              </Label>
              <Input
                id="n-link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="course-4 or /blog"
              />
            </div>
            <Button onClick={send} className="w-full gap-1.5">
              <Send className="size-4" /> Broadcast Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sent list */}
      <div className="lg:col-span-3 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Sent", value: stats.total, icon: Bell, color: "text-primary" },
            { label: "Read", value: stats.read, icon: CheckCheck, color: "text-emerald-500" },
            { label: "Unread", value: stats.unread, icon: TrendingUp, color: "text-amber-500" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-border/60">
                <CardContent className="flex items-center gap-2 p-3">
                  <s.icon className={cn("size-5", s.color)} />
                  <div>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    <p className="text-sm font-bold">{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Sent Notifications</CardTitle>
            <CardDescription className="text-xs">Latest broadcasts & order alerts</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <ScrollArea className="max-h-[600px] scrollbar-thin">
              <div className="space-y-2">
                {notifications.length === 0 && (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    No notifications yet.
                  </p>
                )}
                {notifications.map((n) => {
                  const meta = TYPE_META[n.type];
                  const Icon = meta.icon;
                  const readRate = stats.total
                    ? Math.round((stats.read / stats.total) * 100)
                    : 0;
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-border/60 bg-card/40 p-3 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("grid size-8 shrink-0 place-items-center rounded-lg", meta.color)}>
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold">{n.title}</p>
                            <Badge variant="secondary" className="shrink-0 text-[9px]">
                              {meta.label}
                            </Badge>
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              {n.link && (
                                <span className="flex items-center gap-0.5">
                                  <Link2 className="size-3" />
                                  <span className="font-mono">{n.link}</span>
                                </span>
                              )}
                            </span>
                            <span title={formatDateTime(n.createdAt)}>{timeAgo(n.createdAt)}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-emerald-500"
                                style={{ width: `${readRate}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {n.read ? "Read" : "Unread"} • {readRate}% overall
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminNotifications;

"use client";

import { Bell, Check, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLms } from "@/lib/store";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/lib/types";

const TYPE_STYLES: Record<NotificationType, string> = {
  INFO: "bg-sky-500/10 text-sky-500",
  SUCCESS: "bg-emerald-500/10 text-emerald-500",
  WARNING: "bg-amber-500/10 text-amber-500",
  ANNOUNCEMENT: "bg-violet-500/10 text-violet-500",
  ORDER: "bg-rose-500/10 text-rose-500",
};

const TYPE_DOT: Record<NotificationType, string> = {
  INFO: "bg-sky-500",
  SUCCESS: "bg-emerald-500",
  WARNING: "bg-amber-500",
  ANNOUNCEMENT: "bg-violet-500",
  ORDER: "bg-rose-500",
};

export function NotificationBell() {
  const { notifications, markNotificationRead, markAllNotificationsRead, openCourse, openCertificate } =
    useLms();
  const unread = notifications.filter((n) => !n.read).length;
  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Notifications">
          <Bell className="size-[18px]" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Notifications</span>
            {unread > 0 && (
              <span className="rounded-full bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-500">
                {unread} new
              </span>
            )}
          </div>
          {unread > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="flex items-center gap-1 text-xs text-muted-foreground transition hover:text-primary"
            >
              <CheckCheck className="size-3.5" /> Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="h-80">
          <div className="flex flex-col">
            {sorted.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                <Bell className="mx-auto mb-2 size-8 opacity-40" />
                No notifications yet
              </div>
            )}
            {sorted.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  markNotificationRead(n.id);
                  if (n.link?.startsWith("LMS-")) openCertificate(n.link);
                  else if (n.link) openCourse(n.link);
                }}
                className={cn(
                  "flex gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-accent/60",
                  !n.read && "bg-primary/5"
                )}
              >
                <span
                  className={cn(
                    "mt-1.5 size-2 shrink-0 rounded-full",
                    n.read ? "bg-transparent" : TYPE_DOT[n.type]
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                        TYPE_STYLES[n.type]
                      )}
                    >
                      {n.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium leading-snug">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

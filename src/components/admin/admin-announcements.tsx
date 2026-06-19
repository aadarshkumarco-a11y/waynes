"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Megaphone,
  Pin,
  PinOff,
  Send,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { cn } from "@/lib/utils";

export function AdminAnnouncements() {
  const announcements = useLms((s) => s.announcements);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"ALL" | "STUDENTS">("ALL");
  const [pinned, setPinned] = useState(true);

  // Local overrides for pin/active toggles (since store has no actions for these)
  const [pinOverrides, setPinOverrides] = useState<Record<string, boolean>>({});
  const [activeOverrides, setActiveOverrides] = useState<Record<string, boolean>>({});

  const publish = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required");
      return;
    }
    useLms.setState((s) => ({
      announcements: [
        {
          id: `an-${Date.now()}`,
          title: title.trim(),
          body: body.trim(),
          audience,
          pinned,
          active: true,
          createdAt: new Date().toISOString(),
        },
        ...s.announcements,
      ],
    }));
    toast.success("Announcement published");
    setTitle("");
    setBody("");
    setPinned(true);
  };

  const togglePin = (id: string, current: boolean) => {
    setPinOverrides((p) => ({ ...p, [id]: !current }));
    toast.success(`Announcement ${!current ? "pinned" : "unpinned"}`);
  };

  const toggleActive = (id: string, current: boolean) => {
    setActiveOverrides((p) => ({ ...p, [id]: !current }));
    toast.success(`Announcement ${!current ? "activated" : "hidden"}`);
  };

  const sorted = [...announcements].sort((a, b) => {
    const aPinned = pinOverrides[a.id] ?? a.pinned;
    const bPinned = pinOverrides[b.id] ?? b.pinned;
    if (aPinned !== bPinned) return aPinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      {/* Create form */}
      <div className="lg:col-span-2">
        <Card className="sticky top-20 border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Megaphone className="size-4 text-primary" /> New Announcement
            </CardTitle>
            <CardDescription className="text-xs">
              Broadcast to all users or enrolled students.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="an-title" className="text-xs">Title</Label>
              <Input
                id="an-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Holiday sale — 50% off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="an-body" className="text-xs">Body</Label>
              <Textarea
                id="an-body"
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Use code WELCOME50 at checkout. Valid until Dec 31."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label className="text-xs">Audience</Label>
                <Select
                  value={audience}
                  onValueChange={(v) => setAudience(v as "ALL" | "STUDENTS")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Everyone</SelectItem>
                    <SelectItem value="STUDENTS">Enrolled students</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end justify-between rounded-lg border border-border/60 p-3">
                <div>
                  <Label htmlFor="an-pin" className="text-xs font-medium">Pin to top</Label>
                  <p className="text-[10px] text-muted-foreground">Featured position</p>
                </div>
                <Switch
                  id="an-pin"
                  checked={pinned}
                  onCheckedChange={setPinned}
                />
              </div>
            </div>
            <Button onClick={publish} className="w-full gap-1.5">
              <Send className="size-4" /> Publish
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <div className="lg:col-span-3 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total", value: announcements.length, icon: Megaphone, color: "text-primary" },
            { label: "Pinned", value: announcements.filter((a) => pinOverrides[a.id] ?? a.pinned).length, icon: Pin, color: "text-amber-500" },
            { label: "Active", value: announcements.filter((a) => activeOverrides[a.id] ?? a.active).length, icon: Eye, color: "text-emerald-500" },
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
            <CardTitle className="text-sm">Published Announcements</CardTitle>
            <CardDescription className="text-xs">Most recent first • pinned at top</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <ScrollArea className="max-h-[600px] scrollbar-thin">
              <div className="space-y-2">
                {sorted.length === 0 && (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    No announcements yet.
                  </p>
                )}
                {sorted.map((a) => {
                  const isPinned = pinOverrides[a.id] ?? a.pinned;
                  const isActive = activeOverrides[a.id] ?? a.active;
                  return (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "rounded-lg border p-3 transition-colors",
                        isPinned
                          ? "border-amber-500/40 bg-amber-500/[0.04]"
                          : "border-border/60 bg-card/40"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isPinned && (
                            <Badge className="gap-1 bg-amber-500/15 text-amber-600 text-[9px] dark:text-amber-400">
                              <Pin className="size-2.5" /> Pinned
                            </Badge>
                          )}
                          <Badge variant="secondary" className="gap-1 text-[9px]">
                            <Users className="size-2.5" />
                            {a.audience === "ALL" ? "Everyone" : "Students"}
                          </Badge>
                          {!isActive && (
                            <Badge className="bg-muted text-muted-foreground text-[9px]">
                              <EyeOff className="size-2.5" /> Hidden
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground" title={formatDateTime(a.createdAt)}>
                          {timeAgo(a.createdAt)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold">{a.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.body}</p>
                      <div className="mt-3 flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 px-2 text-xs"
                          onClick={() => togglePin(a.id, isPinned)}
                        >
                          {isPinned ? <PinOff className="size-3" /> : <Pin className="size-3" />}
                          {isPinned ? "Unpin" : "Pin"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 gap-1 px-2 text-xs"
                          onClick={() => toggleActive(a.id, isActive)}
                        >
                          {isActive ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                          {isActive ? "Hide" : "Show"}
                        </Button>
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

export default AdminAnnouncements;

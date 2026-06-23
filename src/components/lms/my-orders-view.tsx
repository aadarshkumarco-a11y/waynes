"use client";

import { motion } from "framer-motion";
import {
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  ArrowRight,
  Download,
  PlayCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLms } from "@/lib/store";
import { courseMap } from "@/lib/data/catalog";
import { formatPrice, formatDate } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; icon: typeof Clock; className: string; badge: string }
> = {
  PENDING: {
    label: "Waiting for Admin Approval",
    icon: Clock,
    className: "text-amber-500",
    badge: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    className: "text-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    className: "text-rose-500",
    badge: "bg-rose-500/15 text-rose-500 border-rose-500/30",
  },
  REFUNDED: {
    label: "Refunded",
    icon: RotateCcw,
    className: "text-violet-400",
    badge: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  },
};

export function MyOrdersView() {
  const { user, orders, navigate, openMyCourse } = useLms();

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
        <Package className="mb-4 size-16 text-muted-foreground" />
        <h1 className="font-mono text-xl font-bold">ACCESS DENIED</h1>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          $ authenticate to view your orders
        </p>
        <Button className="mt-6" onClick={() => navigate("home")}>
          Back to Home
        </Button>
      </div>
    );
  }

  // Filter orders for this user
  const userOrders = orders
    .filter((o) => o.userId === user.id || o.userEmail === user.email)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const approved = userOrders.filter((o) => o.status === "APPROVED");
  const pending = userOrders.filter((o) => o.status === "PENDING");
  const rejected = userOrders.filter((o) => o.status === "REJECTED");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="font-mono text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="text-primary text-glow-green">&gt;</span>{" "}
          <span className="text-gradient-brand">MY_ORDERS</span>
        </h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          <span className="text-primary">$</span> {userOrders.length} total orders ·{" "}
          {approved.length} approved · {pending.length} pending
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: userOrders.length, icon: Package, color: "text-primary" },
          { label: "Approved", value: approved.length, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Pending", value: pending.length, icon: Clock, color: "text-amber-500" },
          { label: "Rejected", value: rejected.length, icon: XCircle, color: "text-rose-500" },
        ].map((stat) => (
          <Card key={stat.label} className="terminal-window p-4">
            <stat.icon className={`size-5 ${stat.color}`} />
            <p className="mt-2 font-mono text-2xl font-bold tabular-nums">{stat.value}</p>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </p>
          </Card>
        ))}
      </div>

      {userOrders.length === 0 ? (
        <Card className="terminal-window p-12 text-center">
          <Package className="mx-auto mb-4 size-16 text-muted-foreground" />
          <p className="font-mono text-sm text-muted-foreground">
            $ no_orders_found — browse the catalog to get started
          </p>
          <Button className="mt-6" onClick={() => navigate("catalog")}>
            Browse Courses
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {userOrders.map((order, i) => {
            const config = STATUS_CONFIG[order.status];
            const StatusIcon = config.icon;
            const course = courseMap[order.courseId] ||
              useLms.getState().customCourses.find((c) => c.id === order.courseId);
            const downloadUrl = course?.downloadUrl;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="terminal-window overflow-hidden p-0">
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md border border-border">
                      <img
                        src={order.courseThumbnail}
                        alt={order.courseTitle}
                        className="absolute inset-0 size-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{order.courseTitle}</p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {order.orderNumber} · {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <Badge className={`shrink-0 gap-1 border ${config.badge}`}>
                          <StatusIcon className="size-3" />
                          {order.status}
                        </Badge>
                      </div>
                      <p className="mt-1 font-mono text-sm">
                        <span className="text-muted-foreground">Amount:</span>{" "}
                        <span className="font-semibold">{formatPrice(order.finalAmount)}</span>
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {order.status === "APPROVED" && (
                          <>
                            <span className={`font-mono text-xs ${config.className}`}>
                              {config.label}
                            </span>
                            <Button
                              size="sm"
                              className="ml-auto gap-1.5"
                              onClick={() => openMyCourse(order.courseId)}
                            >
                              <PlayCircle className="size-3.5" /> Access Course
                              <ArrowRight className="size-3" />
                            </Button>
                            {downloadUrl && (
                              <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="outline" className="gap-1.5">
                                  <Download className="size-3.5" /> Download
                                </Button>
                              </a>
                            )}
                          </>
                        )}
                        {order.status === "PENDING" && (
                          <span className={`flex items-center gap-1 font-mono text-xs ${config.className}`}>
                            <Clock className="size-3" /> {config.label}
                          </span>
                        )}
                        {order.status === "REJECTED" && (
                          <span className={`flex items-center gap-1 font-mono text-xs ${config.className}`}>
                            <XCircle className="size-3" /> {config.label}
                          </span>
                        )}
                        {order.status === "REFUNDED" && (
                          <span className={`flex items-center gap-1 font-mono text-xs ${config.className}`}>
                            <RotateCcw className="size-3" /> {config.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyOrdersView;

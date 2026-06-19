"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Filter,
  RotateCcw,
  Search,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useLms } from "@/lib/store";
import { formatPrice, formatDateTime, timeAgo } from "@/lib/format";
import { toast } from "sonner";
import type { Order, OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUSES: (OrderStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "REFUNDED",
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-500/20",
  APPROVED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
  REJECTED: "bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-rose-500/20",
  REFUNDED: "bg-violet-500/15 text-violet-600 dark:text-violet-400 ring-violet-500/20",
};

const TIMELINE_DOT: Record<OrderStatus, string> = {
  PENDING: "bg-amber-500",
  APPROVED: "bg-emerald-500",
  REJECTED: "bg-rose-500",
  REFUNDED: "bg-violet-500",
};

function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
        STATUS_STYLES[status]
      )}
    >
      {status}
    </span>
  );
}

function exportCsv(rows: Order[]) {
  const headers = [
    "Order Number",
    "Student Name",
    "Email",
    "Course",
    "Amount",
    "Discount",
    "Final Amount",
    "Coupon",
    "Payment Ref",
    "Status",
    "Created At",
  ];
  const escape = (v: string | number | undefined) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [
    headers.map(escape).join(","),
    ...rows.map((o) =>
      [
        o.orderNumber,
        o.userName,
        o.userEmail,
        o.courseTitle,
        o.amount,
        o.discount,
        o.finalAmount,
        o.couponCode ?? "",
        o.paymentRef ?? "",
        o.status,
        o.createdAt,
      ]
        .map(escape)
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `waynes-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function OrderDetailSheet({
  order,
  open,
  onOpenChange,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const approveOrder = useLms((s) => s.approveOrder);
  const rejectOrder = useLms((s) => s.rejectOrder);
  const refundOrder = useLms((s) => s.refundOrder);
  const addOrderNote = useLms((s) => s.addOrderNote);
  const [note, setNote] = useState("");

  if (!order) return null;

  const submitNote = () => {
    if (!note.trim()) return;
    addOrderNote(order.id, note.trim());
    setNote("");
    toast.success("Note added");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border/60 bg-gradient-to-br from-emerald-500/[0.06] to-transparent p-5">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base">Order Details</SheetTitle>
            <StatusPill status={order.status} />
          </div>
          <SheetDescription className="font-mono text-xs">
            {order.orderNumber}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-7rem)] scrollbar-thin">
          <div className="space-y-5 p-5">
            {/* Course + student */}
            <div className="flex gap-3 rounded-xl border border-border/60 bg-card/50 p-3">
              <Avatar className="size-14 rounded-lg">
                <AvatarImage src={order.courseThumbnail} alt={order.courseTitle} />
                <AvatarFallback>{order.courseTitle.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{order.courseTitle}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{order.userName}</p>
                <p className="text-xs text-muted-foreground">{order.userEmail}</p>
              </div>
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">List Price</p>
                <p className="font-semibold">{formatPrice(order.amount, order.currency)}</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Discount</p>
                <p className="font-semibold text-rose-600 dark:text-rose-400">
                  − {formatPrice(order.discount, order.currency)}
                </p>
              </div>
              <div className="col-span-2 rounded-lg bg-emerald-500/10 p-3">
                <p className="text-xs text-emerald-700 dark:text-emerald-300">Final Amount</p>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                  {formatPrice(order.finalAmount, order.currency)}
                </p>
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">Coupon</p>
                <p className="font-medium">{order.couponCode || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Payment Method</p>
                <p className="font-medium">{order.paymentMethod || "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Payment Reference</p>
                <p className="font-mono text-[11px] font-medium">{order.paymentRef || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">{formatDateTime(order.createdAt)}</p>
              </div>
              {order.approvedAt && (
                <div>
                  <p className="text-muted-foreground">Approved</p>
                  <p className="font-medium">{formatDateTime(order.approvedAt)}</p>
                </div>
              )}
              {order.rejectedAt && (
                <div>
                  <p className="text-muted-foreground">Rejected</p>
                  <p className="font-medium">{formatDateTime(order.rejectedAt)}</p>
                </div>
              )}
              {order.refundedAt && (
                <div>
                  <p className="text-muted-foreground">Refunded</p>
                  <p className="font-medium">{formatDateTime(order.refundedAt)}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Timeline
              </h4>
              <ol className="relative space-y-4 border-l border-border pl-5">
                {order.timeline.map((t) => (
                  <li key={t.id} className="relative">
                    <span
                      className={cn(
                        "absolute -left-[26px] top-0.5 size-3 rounded-full ring-4 ring-background",
                        TIMELINE_DOT[t.status as OrderStatus]
                      )}
                    />
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(t.at)}</p>
                  </li>
                ))}
              </ol>
            </div>

            <Separator />

            {/* Notes */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Internal Notes ({order.notes.length})
              </h4>
              <div className="space-y-2">
                {order.notes.length === 0 && (
                  <p className="text-xs text-muted-foreground">No notes yet.</p>
                )}
                {order.notes.map((n) => (
                  <div key={n.id} className="rounded-lg border border-border/60 bg-muted/30 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold">{n.author}</p>
                      <p className="text-[10px] text-muted-foreground">{timeAgo(n.at)}</p>
                    </div>
                    <p className="mt-1 text-xs">{n.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add an internal note…"
                  onKeyDown={(e) => e.key === "Enter" && submitNote()}
                  className="h-9 text-sm"
                />
                <Button size="sm" onClick={submitNote} className="shrink-0">
                  Add
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              {order.status === "PENDING" && (
                <>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      approveOrder(order.id);
                      toast.success("Order approved");
                      onOpenChange(false);
                    }}
                  >
                    <CheckCircle2 className="size-4" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-rose-500/40 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                    onClick={() => {
                      rejectOrder(order.id);
                      toast.success("Order rejected");
                      onOpenChange(false);
                    }}
                  >
                    <XCircle className="size-4" /> Reject
                  </Button>
                </>
              )}
              {order.status === "APPROVED" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 border-violet-500/40 text-violet-600 hover:bg-violet-500/10 dark:text-violet-400"
                  onClick={() => {
                    refundOrder(order.id);
                    toast.success("Order refunded");
                    onOpenChange(false);
                  }}
                >
                  <RotateCcw className="size-4" /> Issue Refund
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export function AdminOrders() {
  const orders = useLms((s) => s.orders);
  const approveOrder = useLms((s) => s.approveOrder);
  const rejectOrder = useLms((s) => s.rejectOrder);
  const refundOrder = useLms((s) => s.refundOrder);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "ALL" && o.status !== status) return false;
      if (!q) return true;
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.userName.toLowerCase().includes(q) ||
        o.courseTitle.toLowerCase().includes(q) ||
        o.userEmail.toLowerCase().includes(q)
      );
    });
  }, [orders, query, status]);

  const counts = useMemo(
    () => ({
      ALL: orders.length,
      PENDING: orders.filter((o) => o.status === "PENDING").length,
      APPROVED: orders.filter((o) => o.status === "APPROVED").length,
      REJECTED: orders.filter((o) => o.status === "REJECTED").length,
      REFUNDED: orders.filter((o) => o.status === "REFUNDED").length,
    }),
    [orders]
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="border-border/60">
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by order #, student, course…"
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="size-3.5" /> Filter:
            </div>
            <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus | "ALL")}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "ALL" ? "All Statuses" : `${s.charAt(0)}${s.slice(1).toLowerCase()}`}
                    <span className="ml-auto text-xs text-muted-foreground">({counts[s]})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                exportCsv(filtered);
                toast.success(`Exported ${filtered.length} orders to CSV`);
              }}
            >
              <Download className="size-4" /> Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status quick filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              status === s
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground hover:bg-accent"
            )}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            <span className="ml-1.5 opacity-60">{counts[s]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm">Orders ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-y border-border/60 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Order</th>
                  <th className="px-4 py-2.5 font-medium">Student</th>
                  <th className="px-4 py-2.5 font-medium">Course</th>
                  <th className="px-4 py-2.5 font-medium">Amount</th>
                  <th className="px-4 py-2.5 font-medium">Coupon</th>
                  <th className="px-4 py-2.5 font-medium">Pay Ref</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <ShoppingCart className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No orders match your filters.</p>
                    </td>
                  </tr>
                )}
                {filtered.map((o) => (
                  <motion.tr
                    key={o.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="cursor-pointer border-b border-border/40 transition-colors last:border-0 hover:bg-muted/40"
                    onClick={() => setSelected(o)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-semibold">{o.orderNumber}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium">{o.userName}</p>
                      <p className="max-w-[180px] truncate text-xs text-muted-foreground">
                        {o.userEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8 rounded-md">
                          <AvatarImage src={o.courseThumbnail} alt={o.courseTitle} />
                          <AvatarFallback>{o.courseTitle.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <p className="max-w-[160px] truncate text-xs font-medium">{o.courseTitle}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{formatPrice(o.finalAmount, o.currency)}</p>
                      {o.discount > 0 && (
                        <p className="text-[10px] text-muted-foreground line-through">
                          {formatPrice(o.amount, o.currency)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {o.couponCode ? (
                        <Badge variant="secondary" className="text-[10px]">
                          {o.couponCode}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {o.paymentRef ? o.paymentRef.slice(0, 10) + "…" : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={o.status} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs">{timeAgo(o.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {o.status === "PENDING" && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                              onClick={() => {
                                approveOrder(o.id);
                                toast.success("Order approved");
                              }}
                              aria-label="Approve"
                            >
                              <CheckCircle2 className="size-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                              onClick={() => {
                                rejectOrder(o.id);
                                toast.success("Order rejected");
                              }}
                              aria-label="Reject"
                            >
                              <XCircle className="size-4" />
                            </Button>
                          </>
                        )}
                        {o.status === "APPROVED" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 text-violet-600 hover:bg-violet-500/10 dark:text-violet-400"
                            onClick={() => {
                              refundOrder(o.id);
                              toast.success("Order refunded");
                            }}
                            aria-label="Refund"
                          >
                            <RotateCcw className="size-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          onClick={() => setSelected(o)}
                          aria-label="View details"
                        >
                          <Eye className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <OrderDetailSheet
        order={selected}
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
      />

      {/* Hint */}
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="size-3" /> Click any row to view full order details, timeline, and notes.
      </p>
    </div>
  );
}

export default AdminOrders;

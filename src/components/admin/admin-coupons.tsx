"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Percent,
  Plus,
  Tag,
  Ticket,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLms } from "@/lib/store";
import { courses, courseMap } from "@/lib/data/catalog";
import { formatPrice, formatDate } from "@/lib/format";
import { toast } from "sonner";
import type { CouponType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CouponForm {
  code: string;
  type: CouponType;
  value: number;
  courseId: string; // "global" or course id
  minAmount: number;
  usageLimit: number;
  perUserLimit: number;
  expiresAt: string;
}

const EMPTY_FORM: CouponForm = {
  code: "",
  type: "PERCENT",
  value: 20,
  courseId: "global",
  minAmount: 0,
  usageLimit: 100,
  perUserLimit: 1,
  expiresAt: "",
};

function CreateCouponDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const addCoupon = useLms((s) => s.addCoupon);
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM);
  const sampleAmount = 4999;

  const discount =
    form.type === "PERCENT"
      ? Math.round((sampleAmount * form.value) / 100)
      : Math.min(form.value, sampleAmount);
  const final = sampleAmount - discount;

  const submit = () => {
    if (!form.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }
    addCoupon({
      code: form.code.toUpperCase().trim(),
      type: form.type,
      value: form.value,
      courseId: form.courseId === "global" ? undefined : form.courseId,
      startsAt: new Date().toISOString(),
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      usageLimit: form.usageLimit || undefined,
      perUserLimit: form.perUserLimit,
      minAmount: form.minAmount,
      active: true,
    });
    toast.success(`Coupon ${form.code.toUpperCase()} created`);
    setForm(EMPTY_FORM);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="size-5 text-primary" /> Create Coupon
          </DialogTitle>
          <DialogDescription>
            Configure discount, scope and validity. Live preview shows the discount for a sample
            ₹{sampleAmount.toLocaleString("en-IN")} order.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="cp-code">Coupon Code</Label>
            <Input
              id="cp-code"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="WELCOME50"
              className="font-mono uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v as CouponType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENT">
                    <span className="flex items-center gap-2">
                      <Percent className="size-3.5" /> Percentage
                    </span>
                  </SelectItem>
                  <SelectItem value="FIXED">
                    <span className="flex items-center gap-2">
                      <Tag className="size-3.5" /> Fixed amount
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cp-value">
                Value {form.type === "PERCENT" ? "(%)" : "(₹)"}
              </Label>
              <Input
                id="cp-value"
                type="number"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Scope</Label>
            <Select
              value={form.courseId}
              onValueChange={(v) => setForm((f) => ({ ...f, courseId: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">🌐 Global — All courses</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cp-min">Min. Order Amount (₹)</Label>
              <Input
                id="cp-min"
                type="number"
                value={form.minAmount}
                onChange={(e) => setForm((f) => ({ ...f, minAmount: Number(e.target.value) }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cp-limit">Total Usage Limit</Label>
              <Input
                id="cp-limit"
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm((f) => ({ ...f, usageLimit: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cp-per">Per-User Limit</Label>
              <Input
                id="cp-per"
                type="number"
                value={form.perUserLimit}
                onChange={(e) => setForm((f) => ({ ...f, perUserLimit: Number(e.target.value) }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cp-exp">Expires At</Label>
              <Input
                id="cp-exp"
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              />
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Live Preview</span>
              <span>Sample order: ₹{sampleAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Discount</p>
                <p className="text-base font-bold text-rose-600 dark:text-rose-400">
                  − {formatPrice(discount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Customer Pays</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {formatPrice(final)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} className="gap-1.5">
            <Plus className="size-4" /> Create Coupon
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdminCoupons() {
  const couponList = useLms((s) => s.couponList);
  const toggleCouponActive = useLms((s) => s.toggleCouponActive);
  const deleteCoupon = useLms((s) => s.deleteCoupon);
  const [createOpen, setCreateOpen] = useState(false);

  const stats = useMemo(() => {
    const active = couponList.filter((c) => c.active).length;
    const totalUsed = couponList.reduce((s, c) => s + c.usedCount, 0);
    const totalRedeemed = couponList.reduce(
      (s, c) =>
        s + (c.type === "PERCENT" ? 0 : c.usedCount * c.value),
      0
    );
    return { active, totalUsed, totalRedeemed, total: couponList.length };
  }, [couponList]);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total Coupons", value: stats.total, icon: Ticket, color: "text-primary" },
          { label: "Active", value: stats.active, icon: TrendingUp, color: "text-emerald-500" },
          { label: "Total Redemptions", value: stats.totalUsed, icon: Tag, color: "text-amber-500" },
          {
            label: "Fixed-Discount Given",
            value: formatPrice(stats.totalRedeemed),
            icon: Percent,
            color: "text-violet-500",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-border/60">
              <CardContent className="flex items-center gap-3 p-4">
                <s.icon className={cn("size-8", s.color)} />
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">
          All Coupons ({couponList.length})
        </h2>
        <Button className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" /> Create Coupon
        </Button>
      </div>

      {/* Table */}
      <Card className="border-border/60">
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto scrollbar-thin">
            <Table>
              <TableHeader>
                <TableRow className="text-xs text-muted-foreground">
                  <TableHead className="px-4">Code</TableHead>
                  <TableHead className="px-4">Discount</TableHead>
                  <TableHead className="px-4">Scope</TableHead>
                  <TableHead className="px-4">Usage</TableHead>
                  <TableHead className="px-4">Validity</TableHead>
                  <TableHead className="px-4">Active</TableHead>
                  <TableHead className="px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {couponList.map((c) => {
                  const usagePct = c.usageLimit ? (c.usedCount / c.usageLimit) * 100 : 0;
                  const expired = c.expiresAt ? new Date(c.expiresAt).getTime() < Date.now() : false;
                  const course = c.courseId ? courseMap[c.courseId] : null;
                  return (
                    <TableRow key={c.id} className="text-sm">
                      <TableCell className="px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "grid size-8 place-items-center rounded-lg",
                              c.type === "PERCENT"
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                : "bg-violet-500/15 text-violet-600 dark:text-violet-400"
                            )}
                          >
                            {c.type === "PERCENT" ? (
                              <Percent className="size-4" />
                            ) : (
                              <Tag className="size-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-mono text-xs font-bold">{c.code}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {c.type === "PERCENT" ? "Percentage" : "Fixed"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        <p className="font-semibold">
                          {c.type === "PERCENT" ? `${c.value}%` : formatPrice(c.value)}
                        </p>
                        {c.minAmount > 0 && (
                          <p className="text-[10px] text-muted-foreground">
                            min {formatPrice(c.minAmount)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="px-4">
                        {course ? (
                          <span className="max-w-[160px] truncate text-xs">{course.title}</span>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            Global
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="w-32">
                          <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                            <span>{c.usedCount} used</span>
                            <span>/ {c.usageLimit ?? "∞"}</span>
                          </div>
                          <Progress value={usagePct} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="size-3" />
                          <span>{formatDate(c.startsAt)}</span>
                          {c.expiresAt && (
                            <>
                              <span>→</span>
                              <span className={cn(expired && "text-rose-500")}>
                                {formatDate(c.expiresAt)}
                              </span>
                            </>
                          )}
                        </div>
                        {expired && (
                          <Badge className="mt-0.5 bg-rose-500/15 text-rose-600 text-[10px] dark:text-rose-400">
                            Expired
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-4">
                        <Switch
                          checked={c.active}
                          onCheckedChange={() => {
                            toggleCouponActive(c.id);
                            toast.success(`Coupon ${c.code} ${c.active ? "disabled" : "enabled"}`);
                          }}
                          aria-label={`Toggle ${c.code}`}
                        />
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                          onClick={() => {
                            deleteCoupon(c.id);
                            toast.success(`Coupon ${c.code} deleted`);
                          }}
                          aria-label="Delete"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CreateCouponDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

export default AdminCoupons;

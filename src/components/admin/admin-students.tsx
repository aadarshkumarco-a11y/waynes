"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Eye,
  Mail,
  Search,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLms } from "@/lib/store";
import { courseMap } from "@/lib/data/catalog";
import { formatPrice, formatDate, timeAgo, formatNumber } from "@/lib/format";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StudentRow {
  email: string;
  name: string;
  avatar: string;
  orderCount: number;
  spent: number;
  lastOrderAt: string;
  status: "active" | "churned";
}

type SortKey = "name" | "spent" | "orderCount" | "lastOrderAt";

function hashEmail(email: string): number {
  let h = 0;
  for (let i = 0; i < email.length; i++) {
    h = (h << 5) - h + email.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function StudentDetailDialog({
  student,
  orders,
  open,
  onOpenChange,
}: {
  student: StudentRow | null;
  orders: Order[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const enrollments = useLms((s) => s.enrollments);
  if (!student) return null;

  const studentOrders = orders.filter((o) => o.userEmail === student.email);
  // Derive userIds by email match in orders (they all share userEmail)
  const userIds = new Set(studentOrders.map((o) => o.userId));
  const studentEnrollments = enrollments.filter((e) => userIds.has(e.userId));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={student.avatar} alt={student.name} />
              <AvatarFallback>{student.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base">{student.name}</p>
              <DialogDescription className="text-xs">{student.email}</DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 py-2">
          <div className="rounded-lg bg-muted/40 p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Orders</p>
            <p className="text-lg font-bold">{student.orderCount}</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Total Spent</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatPrice(student.spent)}
            </p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Enrollments</p>
            <p className="text-lg font-bold">{studentEnrollments.length}</p>
          </div>
        </div>

        <ScrollArea className="max-h-[50vh] scrollbar-thin pr-3">
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Order History
              </h4>
              <div className="space-y-2">
                {studentOrders.length === 0 && (
                  <p className="text-xs text-muted-foreground">No orders yet.</p>
                )}
                {studentOrders.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center gap-3 rounded-lg border border-border/60 p-2"
                  >
                    <Avatar className="size-8 rounded-md">
                      <AvatarImage src={o.courseThumbnail} alt={o.courseTitle} />
                      <AvatarFallback>{o.courseTitle.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{o.courseTitle}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{o.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold">{formatPrice(o.finalAmount)}</p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[9px]",
                          o.status === "APPROVED" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                          o.status === "PENDING" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                          o.status === "REJECTED" && "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                          o.status === "REFUNDED" && "bg-violet-500/15 text-violet-600 dark:text-violet-400"
                        )}
                      >
                        {o.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Enrolled Courses
              </h4>
              <div className="space-y-2">
                {studentEnrollments.length === 0 && (
                  <p className="text-xs text-muted-foreground">No enrollments.</p>
                )}
                {studentEnrollments.map((e) => {
                  const c = courseMap[e.courseId];
                  if (!c) return null;
                  return (
                    <div
                      key={e.id}
                      className="flex items-center gap-3 rounded-lg border border-border/60 p-2"
                    >
                      <Avatar className="size-8 rounded-md">
                        <AvatarImage src={c.thumbnail} alt={c.title} />
                        <AvatarFallback>{c.title.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{c.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Enrolled {formatDate(e.enrolledAt)}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[9px]",
                          e.completed
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {e.completed ? "Completed" : `${e.progress}%`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function AdminStudents() {
  const orders = useLms((s) => s.orders);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("spent");
  const [asc, setAsc] = useState(false);
  const [selected, setSelected] = useState<StudentRow | null>(null);

  const students = useMemo(() => {
    const map = new Map<string, StudentRow>();
    orders.forEach((o) => {
      const cur =
        map.get(o.userEmail) ?? {
          email: o.userEmail,
          name: o.userName,
          avatar: `https://i.pravatar.cc/120?u=${hashEmail(o.userEmail)}`,
          orderCount: 0,
          spent: 0,
          lastOrderAt: o.createdAt,
          status: "active" as const,
        };
      cur.orderCount += 1;
      if (o.status === "APPROVED") cur.spent += o.finalAmount;
      if (new Date(o.createdAt).getTime() > new Date(cur.lastOrderAt).getTime()) {
        cur.lastOrderAt = o.createdAt;
      }
      map.set(o.userEmail, cur);
    });
    const arr = Array.from(map.values());
    const q = query.trim().toLowerCase();
    const filtered = q
      ? arr.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
      : arr;
    filtered.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "spent") cmp = a.spent - b.spent;
      else if (sortBy === "orderCount") cmp = a.orderCount - b.orderCount;
      else if (sortBy === "lastOrderAt")
        cmp = new Date(a.lastOrderAt).getTime() - new Date(b.lastOrderAt).getTime();
      return asc ? cmp : -cmp;
    });
    return filtered;
  }, [orders, query, sortBy, asc]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setAsc((a) => !a);
    else {
      setSortBy(key);
      setAsc(false);
    }
  };

  const totalRevenue = students.reduce((s, x) => s + x.spent, 0);
  const avgSpend = students.length ? totalRevenue / students.length : 0;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total Students", value: formatNumber(students.length), icon: Users },
          { label: "Active", value: formatNumber(students.filter((s) => s.status === "active").length), icon: Users },
          { label: "Lifetime Revenue", value: formatPrice(totalRevenue), icon: Users },
          { label: "Avg. Spend", value: formatPrice(avgSpend), icon: Users },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-border/60">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-base font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by student name or email…"
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Students ({students.length})</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto scrollbar-thin">
            <Table>
              <TableHeader>
                <TableRow className="text-xs text-muted-foreground">
                  <TableHead className="px-4">
                    <button
                      onClick={() => toggleSort("name")}
                      className="flex items-center gap-1 font-medium hover:text-foreground"
                    >
                      Student
                      {sortBy === "name" &&
                        (asc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </button>
                  </TableHead>
                  <TableHead className="px-4 hidden md:table-cell">Email</TableHead>
                  <TableHead className="px-4">
                    <button
                      onClick={() => toggleSort("orderCount")}
                      className="flex items-center gap-1 font-medium hover:text-foreground"
                    >
                      Orders
                      {sortBy === "orderCount" &&
                        (asc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </button>
                  </TableHead>
                  <TableHead className="px-4">
                    <button
                      onClick={() => toggleSort("spent")}
                      className="flex items-center gap-1 font-medium hover:text-foreground"
                    >
                      Spent
                      {sortBy === "spent" &&
                        (asc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </button>
                  </TableHead>
                  <TableHead className="px-4 hidden sm:table-cell">
                    <button
                      onClick={() => toggleSort("lastOrderAt")}
                      className="flex items-center gap-1 font-medium hover:text-foreground"
                    >
                      Last Order
                      {sortBy === "lastOrderAt" &&
                        (asc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </button>
                  </TableHead>
                  <TableHead className="px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <Users className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No students found.</p>
                    </TableCell>
                  </TableRow>
                )}
                {students.map((s) => (
                  <TableRow key={s.email} className="text-sm">
                    <TableCell className="px-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8">
                          <AvatarImage src={s.avatar} alt={s.name} />
                          <AvatarFallback>{s.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-medium">{s.name}</p>
                          <p className="text-[10px] text-muted-foreground md:hidden">{s.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 hidden md:table-cell">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="size-3" /> {s.email}
                      </span>
                    </TableCell>
                    <TableCell className="px-4">
                      <Badge variant="secondary">{s.orderCount}</Badge>
                    </TableCell>
                    <TableCell className="px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(s.spent)}
                    </TableCell>
                    <TableCell className="px-4 hidden sm:table-cell text-xs text-muted-foreground">
                      {timeAgo(s.lastOrderAt)}
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        onClick={() => setSelected(s)}
                        aria-label="View details"
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <StudentDetailDialog
        student={selected}
        orders={orders}
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
      />

      {students.length === 0 && (
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <BookOpen className="size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No students match your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AdminStudents;

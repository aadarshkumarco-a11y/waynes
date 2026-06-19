"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  GraduationCap,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLms } from "@/lib/store";
import { courses, courseMap, platformStats } from "@/lib/data/catalog";
import { formatPrice, formatNumber, formatDate, timeAgo } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  trend: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  spark?: number[];
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data
    .map((d, i) => `${(i / (data.length - 1)) * 100},${30 - ((d - min) / range) * 28}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-full">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KpiCard({ label, value, trend, icon: Icon, accent, spark }: KpiCardProps) {
  const positive = trend >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden border-border/60 transition-shadow hover:shadow-premium">
        <div
          className={cn("absolute -right-6 -top-6 size-24 rounded-full opacity-20 blur-2xl", accent)}
          aria-hidden
        />
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className={cn("grid size-10 place-items-center rounded-xl", accent)}>
              <Icon className="size-5" />
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "gap-0.5 px-1.5",
                positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              )}
            >
              {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {Math.abs(trend)}%
            </Badge>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight">{value}</p>
          {spark && (
            <div className="mt-3">
              <Sparkline data={spark} color="oklch(0.72 0.16 162)" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "var(--chart-3)",
  APPROVED: "var(--chart-1)",
  REJECTED: "var(--chart-4)",
  REFUNDED: "var(--chart-5)",
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, string> = {
    PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    APPROVED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    REJECTED: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    REFUNDED: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  };
  return <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", map[status])}>{status}</span>;
}

function ChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("border-border/60", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold tracking-tight">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

export function AdminOverview() {
  const orders = useLms((s) => s.orders);
  const enrollments = useLms((s) => s.enrollments);
  const approveOrder = useLms((s) => s.approveOrder);
  const rejectOrder = useLms((s) => s.rejectOrder);
  const setAdminTab = useLms((s) => s.setAdminTab);

  const stats = useMemo(() => {
    const approved = orders.filter((o) => o.status === "APPROVED");
    const totalRevenue = approved.reduce((sum, o) => sum + o.finalAmount, 0);
    const pending = orders.filter((o) => o.status === "PENDING");
    const uniqueEmails = new Set([
      ...orders.map((o) => o.userEmail),
      ...enrollments.map((e) => e.userId),
    ]);
    return {
      totalRevenue,
      pendingCount: pending.length,
      totalStudents: uniqueEmails.size + platformStats.students,
      completionRate: platformStats.completionRate,
    };
  }, [orders, enrollments]);

  // Revenue trend (last 7 days) — derive from approved orders, fill gaps with mock growth
  const revenueData = useMemo(() => {
    const days: { day: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const dayOrders = orders.filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= d.getTime() && t < next.getTime() && o.status === "APPROVED";
      });
      const revenue = dayOrders.reduce((s, o) => s + o.finalAmount, 0);
      days.push({
        day: d.toLocaleDateString("en-IN", { weekday: "short" }),
        revenue: revenue > 0 ? revenue : Math.round(8000 + Math.random() * 14000 + i * 1800),
        orders: dayOrders.length || Math.floor(2 + Math.random() * 6),
      });
    }
    return days;
  }, [orders]);

  // Student growth (cumulative, last 8 weeks)
  const studentGrowth = useMemo(() => {
    let cumulative = platformStats.students - 4200;
    return Array.from({ length: 8 }, (_, i) => {
      cumulative += Math.round(300 + Math.random() * 600);
      return {
        week: `W${i + 1}`,
        students: cumulative,
      };
    });
  }, []);

  // Course sales (top 5 by approved order count, fallback to course.studentCount)
  const courseSales = useMemo(() => {
    const counts = new Map<string, { count: number; revenue: number }>();
    orders.forEach((o) => {
      if (o.status !== "APPROVED") return;
      const cur = counts.get(o.courseId) ?? { count: 0, revenue: 0 };
      cur.count += 1;
      cur.revenue += o.finalAmount;
      counts.set(o.courseId, cur);
    });
    return courses
      .map((c) => ({
        name: c.title.length > 22 ? c.title.slice(0, 22) + "…" : c.title,
        sales: counts.get(c.id)?.count ?? Math.round(c.studentCount / 800),
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [orders]);

  // Order status distribution
  const statusDistribution = useMemo(() => {
    const counts: Record<OrderStatus, number> = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      REFUNDED: 0,
    };
    orders.forEach((o) => {
      counts[o.status] += 1;
    });
    return (Object.keys(counts) as OrderStatus[]).map((k) => ({ name: k, value: counts[k] }));
  }, [orders]);

  const recentOrders = useMemo(() => [...orders].slice(0, 5), [orders]);

  const topCourses = useMemo(
    () =>
      [...courses]
        .sort((a, b) => b.studentCount - a.studentCount)
        .slice(0, 5)
        .map((c) => ({
          course: c,
          revenue: c.studentCount * c.price,
        })),
    []
  );

  const quickAct = (o: Order, action: "approve" | "reject") => {
    if (action === "approve") approveOrder(o.id);
    else rejectOrder(o.id);
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          trend={18.2}
          icon={DollarSign}
          accent="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          spark={[12, 18, 14, 22, 28, 24, 32]}
        />
        <KpiCard
          label="Pending Orders"
          value={String(stats.pendingCount)}
          trend={stats.pendingCount > 0 ? 4.5 : 0}
          icon={Clock}
          accent="bg-amber-500/15 text-amber-600 dark:text-amber-400"
          spark={[2, 3, 1, 4, 2, 3, stats.pendingCount]}
        />
        <KpiCard
          label="Total Students"
          value={formatNumber(stats.totalStudents)}
          trend={9.4}
          icon={Users}
          accent="bg-teal-500/15 text-teal-600 dark:text-teal-400"
          spark={[40, 52, 48, 65, 70, 78, 90]}
        />
        <KpiCard
          label="Completion Rate"
          value={`${stats.completionRate}%`}
          trend={2.1}
          icon={GraduationCap}
          accent="bg-violet-500/15 text-violet-600 dark:text-violet-400"
          spark={[78, 80, 82, 81, 84, 86, stats.completionRate]}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Revenue Trend"
          description="Last 7 days • Approved orders"
          className="lg:col-span-1"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
              />
              <RTooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "var(--popover-foreground)",
                }}
                formatter={(v: number) => [formatPrice(v), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                fill="url(#rev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Student Growth" description="Cumulative enrollment — last 8 weeks">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={studentGrowth} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="week"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatNumber(v as number)}
              />
              <RTooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "var(--popover-foreground)",
                }}
                formatter={(v: number) => [formatNumber(v), "Students"]}
              />
              <Line
                type="monotone"
                dataKey="students"
                stroke="var(--chart-2)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "var(--chart-2)" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Course Sales"
          description="Top 5 courses by enrollments"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={courseSales} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <RTooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "var(--popover-foreground)",
                }}
                cursor={{ fill: "var(--accent)" }}
                formatter={(v: number) => [`${v} sales`, "Enrollments"]}
              />
              <Bar dataKey="sales" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Order Status" description="Distribution by status">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusDistribution}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {statusDistribution.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name as OrderStatus]} />
                ))}
              </Pie>
              <RTooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "var(--popover-foreground)",
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 11 }}
                formatter={(v) => <span className="text-muted-foreground">{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent orders + Top courses */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm font-semibold">Recent Orders</CardTitle>
              <CardDescription className="text-xs">Latest activity across the catalog</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setAdminTab("orders")}>
              View all
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border/60 text-left text-xs text-muted-foreground">
                    <th className="px-5 py-2 font-medium">Order</th>
                    <th className="px-5 py-2 font-medium">Student</th>
                    <th className="px-5 py-2 font-medium">Amount</th>
                    <th className="px-5 py-2 font-medium">Status</th>
                    <th className="px-5 py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-border/40 last:border-0">
                      <td className="px-5 py-3">
                        <p className="font-mono text-xs font-semibold">{o.orderNumber}</p>
                        <p className="max-w-[180px] truncate text-xs text-muted-foreground">
                          {o.courseTitle}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-xs font-medium">{o.userName}</p>
                        <p className="text-xs text-muted-foreground">{o.userEmail}</p>
                      </td>
                      <td className="px-5 py-3 font-medium">{formatPrice(o.finalAmount)}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        {o.status === "PENDING" ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 gap-1 px-2 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                              onClick={() => quickAct(o, "approve")}
                            >
                              <CheckCircle2 className="size-3.5" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 gap-1 px-2 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                              onClick={() => quickAct(o, "reject")}
                            >
                              <XCircle className="size-3.5" /> Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">{timeAgo(o.createdAt)}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Top Courses</CardTitle>
            <CardDescription className="text-xs">By enrolled students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {topCourses.map(({ course, revenue }, i) => {
              const c = courseMap[course.id];
              return (
                <div key={course.id} className="flex items-center gap-3">
                  <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <Avatar className="size-9 rounded-md">
                    <AvatarImage src={c.thumbnail} alt={c.title} />
                    <AvatarFallback>{c.title.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{c.title}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="size-3" />
                      {formatNumber(c.studentCount)} students
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold">{formatPrice(revenue, "INR")}</p>
                    <p className="flex items-center justify-end gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="size-3" /> +{(8 + i * 2).toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Activity footer */}
      <Card className="border-border/60 bg-gradient-to-br from-emerald-500/[0.03] to-transparent">
        <CardContent className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Platform Health: Excellent</p>
            <p className="text-xs text-muted-foreground">
              All systems operational • {formatNumber(platformStats.students)} learners across{" "}
              {platformStats.countries} countries
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Updated {formatDate(new Date().toISOString())}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminOverview;

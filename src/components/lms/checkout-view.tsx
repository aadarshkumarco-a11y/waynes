"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Lock,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLms } from "@/lib/store";
import { courseMap, instructorMap } from "@/lib/data/catalog";
import { formatPrice, formatDateTime, formatDuration } from "@/lib/format";
import type { Course, Order } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const UPI_ID = "learniverse@upi";

const PAYMENT_METHODS = [
  {
    id: "UPI",
    label: "UPI",
    description: "GPay, PhonePe, Paytm, BHIM",
    icon: "📱",
  },
  {
    id: "BANK",
    label: "Bank Transfer",
    description: "IMPS / NEFT / RTGS",
    icon: "🏦",
  },
  {
    id: "CARD",
    label: "Credit / Debit Card",
    description: "Visa, Mastercard, RuPay",
    icon: "💳",
  },
] as const;

const TRUST_BADGES = [
  { label: "Lifetime access", icon: BadgeCheck },
  { label: "Verifiable certificate", icon: Award },
  { label: "7-day money-back", icon: ShieldCheck },
] as const;

export function CheckoutView() {
  const checkoutCourseId = useLms((s) => s.checkoutCourseId);
  const course = useMemo(
    () => (checkoutCourseId ? courseMap[checkoutCourseId] : null),
    [checkoutCourseId]
  );

  if (!course) return <EmptyCheckoutState />;

  // Keyed inner form so local state (txn ref, coupon input, etc.) resets
  // automatically when the course being checked out changes.
  return <CheckoutForm key={course.id} course={course} />;
}

export default CheckoutView;

function CheckoutForm({ course }: { course: Course }) {
  const user = useLms((s) => s.user);
  const setAuthOpen = useLms((s) => s.setAuthOpen);
  const navigate = useLms((s) => s.navigate);
  const openCourse = useLms((s) => s.openCourse);
  const openLesson = useLms((s) => s.openLesson);
  const appliedCouponCode = useLms((s) => s.appliedCouponCode);
  const applyCoupon = useLms((s) => s.applyCoupon);
  const removeCoupon = useLms((s) => s.removeCoupon);
  const validateCoupon = useLms((s) => s.validateCoupon);
  const checkout = useLms((s) => s.checkout);
  const isEnrolled = useLms((s) => s.isEnrolled);
  const getEnrollment = useLms((s) => s.getEnrollment);

  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState<{
    ok: boolean;
    text: string;
    discount?: number;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI");
  const [txnRef, setTxnRef] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  const instructor = instructorMap[course.instructorId];
  const enrolled = isEnrolled(course.id);

  // ---- Coupon ----
  const couponResult = appliedCouponCode
    ? validateCoupon(appliedCouponCode, course.price, course.id)
    : null;
  const discount = couponResult?.ok ? couponResult.discount : 0;
  const finalAmount = Math.max(course.price - discount, 0);

  function handleApplyCoupon(code?: string) {
    const raw = (code ?? couponInput).trim();
    if (!raw) {
      setCouponMsg({ ok: false, text: "Enter a coupon code." });
      return;
    }
    const res = applyCoupon(raw, course!.price, course!.id);
    setCouponMsg({
      ok: res.ok,
      text: res.message,
      discount: res.ok ? res.discount : undefined,
    });
    if (res.ok) toast.success(`Coupon applied — saved ${formatPrice(res.discount)}`);
  }

  function handleRemoveCoupon() {
    removeCoupon();
    setCouponInput("");
    setCouponMsg(null);
  }

  function handleCopyUpi() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(UPI_ID).then(() => {
        setCopied(true);
        toast.success("UPI ID copied");
        setTimeout(() => setCopied(false), 1800);
      });
    }
  }

  function handlePlaceOrder() {
    setTouched(true);
    if (!txnRef.trim()) {
      toast.error("Please enter your transaction reference (UTR ID).");
      return;
    }
    setSubmitting(true);
    // Simulate a tiny delay for UX.
    setTimeout(() => {
      const order = checkout(course!.id, txnRef.trim(), paymentMethod);
      setPlacedOrder(order);
      setSubmitting(false);
      toast.success("Order submitted for verification");
    }, 600);
  }

  // ---------------- ALREADY ENROLLED ----------------
  if (enrolled) {
    const enr = getEnrollment(course.id);
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-3xl px-4 py-12 sm:py-16"
      >
        <Card className="glass-strong overflow-hidden p-0 shadow-premium">
          <div className="gradient-brand relative px-6 py-10 text-center sm:px-12">
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="relative">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                <CheckCircle2 className="size-9 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                You&apos;re already enrolled!
              </h2>
              <p className="mt-2 text-white/90">{course.title}</p>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-center text-muted-foreground">
              {enr?.completed
                ? "You've completed this course. Continue reviewing or grab your certificate."
                : `Pick up where you left off — ${enr?.progress ?? 0}% complete.`}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={() => openLesson(course.slug, enr?.lastViewedLessonId ?? "")}
              >
                <PlayCircle className="size-4" />
                {enr?.completed ? "Review course" : "Continue learning"}
              </Button>
              <Button size="lg" variant="outline" onClick={() => openCourse(course.slug)}>
                View course details
              </Button>
            </div>
            <button
              onClick={() => navigate("catalog")}
              className="mt-6 block w-full text-center text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Browse other courses →
            </button>
          </div>
        </Card>
      </motion.div>
    );
  }

  // ---------------- SUCCESS STATE ----------------
  if (placedOrder) {
    return (
      <SuccessScreen
        order={placedOrder}
        onContinue={() => navigate("my-learning")}
        onBack={() => openCourse(course.slug)}
      />
    );
  }

  // ---------------- MAIN CHECKOUT ----------------
  const txnError = touched && !txnRef.trim();

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => openCourse(course.slug)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          Back to course
        </button>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Checkout</h1>
        <p className="mt-1 text-muted-foreground">
          Complete your enrollment in{" "}
          <span className="font-medium text-foreground">{course.title}</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
        {/* LEFT — Payment + coupon */}
        <div className="space-y-6">
          {/* Sign-in prompt */}
          {!user && (
            <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100">
              <RefreshCw className="size-4" />
              <AlertTitle>Sign in to save your progress</AlertTitle>
              <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  You can place an order as a guest, but signing in lets us track your
                  enrollment &amp; issue certificates.
                </span>
                <Button size="sm" onClick={() => setAuthOpen(true, "login")}>
                  Sign in
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Coupon */}
          <Card className="glass p-5 shadow-premium sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Tag className="size-5 text-primary" />
              <h2 className="text-lg font-semibold">Have a coupon?</h2>
            </div>

            {appliedCouponCode ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="size-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">{appliedCouponCode}</p>
                    <p className="text-xs text-muted-foreground">
                      You saved {formatPrice(discount)}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={handleRemoveCoupon}>
                  <X className="size-4" />
                  Remove
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    className="font-mono tracking-wider uppercase"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleApplyCoupon();
                    }}
                  />
                  <Button onClick={handleApplyCoupon} className="sm:w-32">
                    Apply
                  </Button>
                </div>
                {couponMsg && (
                  <p
                    className={cn(
                      "mt-2 text-sm",
                      couponMsg.ok ? "text-primary" : "text-destructive"
                    )}
                  >
                    {couponMsg.text}
                  </p>
                )}
                <button
                  onClick={() => {
                    setCouponInput("WELCOME50");
                    handleApplyCoupon("WELCOME50");
                  }}
                  className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
                >
                  <Sparkles className="size-3" />
                  Try <span className="font-mono font-semibold">WELCOME50</span> for 50%
                  off
                </button>
              </>
            )}
          </Card>

          {/* Payment */}
          <Card className="glass p-5 shadow-premium sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="size-5 text-primary" />
              <h2 className="text-lg font-semibold">Payment</h2>
            </div>

            {/* UPI box */}
            <div className="mb-5 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm text-muted-foreground">
                Make payment to the UPI ID below, then enter your transaction reference.
              </p>
              <div className="mt-3 flex items-center justify-between gap-3 rounded-md bg-background/80 px-3 py-2.5 backdrop-blur">
                <div>
                  <p className="text-xs text-muted-foreground">Pay to UPI ID</p>
                  <p className="font-mono text-base font-semibold tracking-wide">
                    {UPI_ID}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={handleCopyUpi}>
                  {copied ? (
                    <>
                      <Check className="size-4" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" /> Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                <Clock className="mt-0.5 size-3.5 shrink-0" />
                Our team verifies your transaction and grants access — usually within a
                few minutes during business hours.
              </p>
            </div>

            {/* Payment method */}
            <Label className="mb-2 block text-sm font-medium">Payment method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="grid gap-2 sm:grid-cols-3"
            >
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.id}
                  htmlFor={`pm-${m.id}`}
                  className={cn(
                    "flex cursor-pointer items-start gap-2 rounded-lg border p-3 transition-colors hover:bg-accent/40",
                    paymentMethod === m.id && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value={m.id} id={`pm-${m.id}`} className="mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      <span className="mr-1">{m.icon}</span>
                      {m.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.description}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>

            {/* Transaction reference */}
            <div className="mt-5">
              <Label htmlFor="txn" className="mb-1.5 block text-sm font-medium">
                Transaction Reference / UTR ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="txn"
                value={txnRef}
                onChange={(e) => setTxnRef(e.target.value)}
                placeholder="e.g. 452103689712"
                className={cn(txnError && "border-destructive focus-visible:ring-destructive/30")}
                aria-invalid={txnError}
              />
              {txnError && (
                <p className="mt-1.5 text-xs text-destructive">
                  Transaction reference is required to verify your payment.
                </p>
              )}
              <p className="mt-1.5 text-xs text-muted-foreground">
                Found in your UPI app&apos;s payment receipt, or your bank statement.
              </p>
            </div>

            <Button
              size="lg"
              className="mt-6 w-full"
              onClick={handlePlaceOrder}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  Place Order · {formatPrice(finalAmount, course.currency)}
                </>
              )}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" />
              Secured by external payment verification · No card details stored
            </p>
          </Card>
        </div>

        {/* RIGHT — Order summary (sticky) */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="glass-strong overflow-hidden p-0 shadow-premium">
            <div className="border-b p-4">
              <h2 className="text-base font-semibold">Order summary</h2>
            </div>
            <div className="flex gap-3 p-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold leading-snug">
                  {course.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  by {instructor?.name}
                </p>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="font-medium">
                    {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDuration(course.durationMins)}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 p-4 text-sm">
              <Row label="Original price">
                {course.comparePrice ? (
                  <span className="text-muted-foreground line-through">
                    {formatPrice(course.comparePrice, course.currency)}
                  </span>
                ) : (
                  formatPrice(course.price, course.currency)
                )}
              </Row>
              {course.comparePrice ? (
                <Row label="Course discount">
                  <span className="text-primary">
                    −
                    {formatPrice(
                      course.comparePrice - course.price,
                      course.currency
                    )}
                  </span>
                </Row>
              ) : null}
              {discount > 0 && (
                <Row label={`Coupon (${appliedCouponCode})`}>
                  <span className="text-primary">−{formatPrice(discount, course.currency)}</span>
                </Row>
              )}
            </div>

            <Separator />

            <div className="p-4">
              <Row label="Total" bold>
                <span className="text-xl font-bold tracking-tight">
                  {formatPrice(finalAmount, course.currency)}
                </span>
              </Row>
              {course.comparePrice && (
                <p className="mt-1 text-xs text-muted-foreground">
                  You save{" "}
                  <span className="font-semibold text-primary">
                    {formatPrice(
                      (course.comparePrice || 0) - finalAmount,
                      course.currency
                    )}
                  </span>{" "}
                  ({Math.round(
                    (((course.comparePrice || 0) - finalAmount) /
                      (course.comparePrice || 1)) *
                      100
                  )}
                  % off)
                </p>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-3">
              {TRUST_BADGES.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.label}
                    className="flex flex-col items-center gap-1 rounded-md bg-muted/40 p-2 text-center"
                  >
                    <Icon className="size-4 text-primary" />
                    <span className="text-[11px] font-medium leading-tight text-muted-foreground">
                      {b.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function Row({
  label,
  children,
  bold,
}: {
  label: string;
  children: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={cn(bold ? "font-semibold" : "text-muted-foreground")}>
        {label}
      </span>
      <span>{children}</span>
    </div>
  );
}

function EmptyCheckoutState() {
  const navigate = useLms((s) => s.navigate);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center"
    >
      <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-muted">
        <CreditCard className="size-10 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">No course selected</h2>
      <p className="mt-2 text-muted-foreground">
        Browse our catalog and pick a course to start the checkout process.
      </p>
      <Button className="mt-6" size="lg" onClick={() => navigate("catalog")}>
        Browse courses
        <ArrowRight className="size-4" />
      </Button>
    </motion.div>
  );
}

function SuccessScreen({
  order,
  onContinue,
  onBack,
}: {
  order: Order;
  onContinue: () => void;
  onBack: () => void;
}) {
  const steps = [
    {
      title: "We verify your payment",
      body: "Our team cross-checks your UTR with the payment we received.",
    },
    {
      title: "Access is granted",
      body: "Once approved, you'll be enrolled instantly and notified.",
    },
    {
      title: "Start learning",
      body: "Dive into lessons, track progress, and earn your certificate.",
    },
  ];

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-grid opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <AnimatePresence mode="wait">
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
        >
          <Card className="glass-strong overflow-hidden p-0 shadow-glow">
            <div className="gradient-brand relative px-6 py-10 text-center sm:px-12">
              <div className="absolute inset-0 bg-grid opacity-20" />
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.2 }}
                className="relative mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-white/15 backdrop-blur"
              >
                <CheckCircle2 className="size-12 text-white" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="relative text-2xl font-bold text-white sm:text-3xl"
              >
                Order submitted for verification
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="relative mt-2 text-white/90"
              >
                Order <span className="font-mono">{order.orderNumber}</span>
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-semibold text-amber-950"
              >
                <Clock className="size-3" />
                Status: Pending verification
              </motion.div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Amount paid</span>
                  <span className="font-semibold">
                    {formatPrice(order.finalAmount, order.currency)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Payment method</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Transaction ref</span>
                  <span className="truncate font-mono text-xs">
                    {order.paymentRef}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Submitted at</span>
                  <span className="font-medium">{formatDateTime(order.createdAt)}</span>
                </div>
              </div>

              <h3 className="mt-6 text-sm font-semibold">What happens next?</h3>
              <ol className="mt-3 space-y-3">
                {steps.map((s, i) => (
                  <li key={s.title} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="flex-1" onClick={onContinue}>
                  View My Learning
                  <ArrowRight className="size-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={onBack}>
                  Back to Course
                </Button>
              </div>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                We&apos;ve added this order to your dashboard. You&apos;ll get a
                notification once it&apos;s approved.
              </p>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

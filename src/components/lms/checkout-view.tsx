"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Infinity as InfinityIcon,
  KeyRound,
  Lock,
  PlayCircle,
  ShieldCheck,
  Skull,
  Sparkles,
  Tag,
  Terminal,
  X,
  Zap,
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
import { formatPrice } from "@/lib/format";
import type { Course, Order, PaymentSettings } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TRUST_BADGES = [
  { label: "Lifetime access", icon: InfinityIcon },
  { label: "Verifiable certificate", icon: Award },
  { label: "30-day refund", icon: ShieldCheck },
] as const;

const ALL_METHODS = [
  { id: "UPI", label: "UPI", description: "GPay, PhonePe, Paytm, BHIM", icon: "📱" },
  { id: "BANK", label: "Bank Transfer", description: "IMPS / NEFT / RTGS", icon: "🏦" },
  { id: "CARD", label: "Credit / Debit Card", description: "Visa, Mastercard, RuPay", icon: "💳" },
] as const;

// ---------------------------------------------------------------------------
// Empty state — no target selected
// ---------------------------------------------------------------------------
function EmptyCheckoutState() {
  const navigate = useLms((s) => s.navigate);
  return (
    <div className="relative mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="terminal-window px-8 py-12"
      >
        <div className="mb-4 flex size-16 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/5 text-amber-500">
          <Skull className="size-9" />
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-amber-500">
          error: null_target
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-glow-green sm:text-3xl">
          NO TARGET SELECTED
        </h1>
        <p className="mt-3 max-w-md font-mono text-sm text-muted-foreground">
          <span className="text-amber-500">$</span> no course loaded into the
          checkout buffer. select a target from the catalog to begin the payment
          sequence.
        </p>
        <Button
          className="mt-6 gap-2 font-mono uppercase tracking-widest glow-green"
          onClick={() => navigate("catalog")}
        >
          <Terminal className="size-4" />
          &gt; browse_catalog
        </Button>
      </motion.div>
    </div>
  );
}

export function CheckoutView() {
  const checkoutCourseId = useLms((s) => s.checkoutCourseId);
  const course = useMemo(
    () => (checkoutCourseId ? courseMap[checkoutCourseId] : null),
    [checkoutCourseId]
  );

  if (!course) return <EmptyCheckoutState />;

  // Keyed inner form so local state resets when course changes.
  return <CheckoutForm key={course.id} course={course} />;
}

export default CheckoutView;

// ---------------------------------------------------------------------------
// Inner form — owns all checkout state
// ---------------------------------------------------------------------------
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
  const paymentSettings = useLms((s) => s.paymentSettings);

  // Derive available payment methods from admin settings
  const paymentMethods = ALL_METHODS.filter((m) => paymentSettings.methods[m.id.toLowerCase() as "upi" | "bank" | "card"]);

  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState<{
    ok: boolean;
    text: string;
    discount?: number;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>(paymentMethods[0]?.id ?? "UPI");
  const [txnRef, setTxnRef] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  const instructor = instructorMap[course.instructorId];
  const enrolled = isEnrolled(course.id);

  // ---- Coupon math ----
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
    const res = applyCoupon(raw, course.price, course.id);
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
      navigator.clipboard.writeText(paymentSettings.upiId).then(() => {
        setCopied(true);
        toast.success("UPI ID copied to clipboard");
        setTimeout(() => setCopied(false), 1800);
      });
    }
  }

  function handlePlaceOrder() {
    setTouched(true);
    if (!txnRef.trim()) {
      toast.error("Enter your transaction reference (UTR ID).");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const order = checkout(course.id, txnRef.trim(), paymentMethod);
      setPlacedOrder(order);
      setSubmitting(false);
      toast.success("Payment submitted for verification");
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
        <Card className="terminal-window overflow-hidden p-0">
          <div className="relative border-b border-primary/20 bg-primary/10 px-6 py-10 text-center sm:px-12">
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="relative">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary glow-green">
                <CheckCircle2 className="size-9" />
              </div>
              <p className="font-mono text-xs uppercase tracking-widest text-primary">
                $ access_granted
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-glow-green sm:text-3xl">
                ACCESS ALREADY GRANTED
              </h2>
              <p className="mt-2 font-mono text-sm text-muted-foreground">
                {course.title}
              </p>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-center font-mono text-sm text-muted-foreground">
              {enr?.completed
                ? "> course completed — review or claim certificate"
                : `> resume session — ${enr?.progress ?? 0}% complete`}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={() => openLesson(course.slug, enr?.lastViewedLessonId ?? "")}
                className="glow-green gap-2 font-mono uppercase tracking-widest"
              >
                <PlayCircle className="size-4" />
                Continue Learning
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => openCourse(course.slug)}
                className="border-primary/30 font-mono uppercase tracking-widest text-primary"
              >
                View Course
              </Button>
            </div>
            <button
              onClick={() => navigate("catalog")}
              className="mt-6 block w-full text-center font-mono text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              &gt; browse other targets
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
        greetingMessage={paymentSettings.greetingMessage}
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
          className="mb-4 inline-flex items-center gap-1.5 font-mono text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          &lt; back_to_target
        </button>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="border-primary/40 bg-primary/5 font-mono text-xs uppercase tracking-widest text-primary"
          >
            <Terminal className="size-3" />
            payment_terminal
          </Badge>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="text-primary text-glow-green">&gt;</span>{" "}
          <span className="text-gradient-brand">SECURE_CHECKOUT</span>
          <span className="cursor-blink" />
        </h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          <span className="text-primary">$</span> initiating payment sequence
          for{" "}
          <span className="font-semibold text-foreground">{course.title}</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
        {/* LEFT — Payment + coupon */}
        <div className="space-y-6">
          {/* Sign-in prompt */}
          {!user && (
            <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100">
              <KeyRound className="size-4" />
              <AlertTitle className="font-mono uppercase tracking-widest">
                &gt; auth_required
              </AlertTitle>
              <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-mono text-sm">
                  Sign in to save your progress &amp; receive certificates. Guest
                  orders are accepted but not recommended.
                </span>
                <Button
                  size="sm"
                  onClick={() => setAuthOpen(true, "login")}
                  className="font-mono uppercase tracking-widest"
                >
                  Authenticate
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Coupon */}
          <Card className="terminal-window p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-primary/15 pb-3">
              <Tag className="size-4 text-primary" />
              <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-primary">
                {"// coupon_module"}
              </h2>
            </div>

            {appliedCouponCode ? (
              <div className="flex items-center justify-between gap-3 rounded-md border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-primary" />
                  <div>
                    <p className="font-mono text-sm font-semibold text-primary">
                      {appliedCouponCode}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      <span className="text-primary">SAVED</span>{" "}
                      {formatPrice(discount)}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRemoveCoupon}
                  className="font-mono text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="size-4" />
                  REMOVE
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-primary">
                      &gt;
                    </span>
                    <Input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="ENTER_CODE"
                      aria-label="Coupon code"
                      className="border-primary/30 bg-background/50 pl-7 font-mono tracking-wider uppercase placeholder:text-muted-foreground/60"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleApplyCoupon();
                      }}
                    />
                  </div>
                  <Button
                    onClick={() => handleApplyCoupon()}
                    className="glow-green gap-2 font-mono uppercase tracking-widest sm:w-32"
                  >
                    <Zap className="size-4" />
                    APPLY
                  </Button>
                </div>
                {couponMsg && (
                  <p
                    className={cn(
                      "mt-2 font-mono text-sm",
                      couponMsg.ok ? "text-primary" : "text-destructive"
                    )}
                  >
                    <span className={couponMsg.ok ? "text-primary" : "text-destructive"}>
                      {couponMsg.ok ? "$" : "!"}
                    </span>{" "}
                    {couponMsg.ok && couponMsg.discount
                      ? `SAVED ${formatPrice(couponMsg.discount)} — ${couponMsg.text}`
                      : couponMsg.text}
                  </p>
                )}
                <button
                  onClick={() => handleApplyCoupon("HACK50")}
                  className="mt-3 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
                >
                  <Sparkles className="size-3 text-primary" />
                  <span className="text-muted-foreground">try</span>{" "}
                  <span className="font-semibold text-primary">HACK50</span>{" "}
                  <span className="text-muted-foreground">for 50% off</span>
                </button>
              </>
            )}
          </Card>

          {/* Payment */}
          <Card className="terminal-window p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-primary/15 pb-3">
              <CreditCard className="size-4 text-primary" />
              <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-primary">
                {"// payment_gateway"}
              </h2>
            </div>

            {/* Payment instructions from admin */}
            <div className="mb-5 rounded-md border border-primary/30 bg-primary/5 p-4">
              <p className="font-mono text-sm text-muted-foreground">
                <span className="text-primary">$</span> {paymentSettings.instructions}
              </p>
            </div>

            {/* UPI / Payment details — shows QR + UPI ID for UPI, bank details for BANK */}
            {paymentMethod === "UPI" && (
              <div className="mb-5 rounded-md border border-primary/30 bg-primary/5 p-4">
                {paymentSettings.qrImage ? (
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    <div className="size-40 shrink-0 overflow-hidden rounded-lg border border-primary/30 bg-white p-2">
                      <img
                        src={paymentSettings.qrImage}
                        alt="Payment QR Code"
                        className="size-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                        scan_qr_or_pay_to_upi
                      </p>
                      <p className="mt-1 font-mono text-lg font-semibold tracking-wide text-primary text-glow-green">
                        {paymentSettings.upiId}
                      </p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        Payee: {paymentSettings.payeeName}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyUpi}
                        className="mt-3 border-primary/30 font-mono text-xs uppercase tracking-widest text-primary"
                      >
                        {copied ? (
                          <><Check className="size-4" /> COPIED</>
                        ) : (
                          <><Copy className="size-4" /> COPY UPI ID</>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 rounded-md border border-primary/20 bg-background/80 px-3 py-2.5 backdrop-blur">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        pay_to_upi
                      </p>
                      <p className="font-mono text-base font-semibold tracking-wide text-primary text-glow-green">
                        {paymentSettings.upiId}
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        Payee: {paymentSettings.payeeName}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyUpi}
                      className="border-primary/30 font-mono text-xs uppercase tracking-widest text-primary"
                    >
                      {copied ? (
                        <><Check className="size-4" /> COPIED</>
                      ) : (
                        <><Copy className="size-4" /> COPY</>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === "BANK" && (
              <div className="mb-5 rounded-md border border-primary/30 bg-primary/5 p-4">
                <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  bank_transfer_details
                </p>
                <div className="space-y-1.5 font-mono text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Account Name</span><span className="font-semibold">{paymentSettings.bankDetails.accountName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Account No.</span><span className="font-semibold">{paymentSettings.bankDetails.accountNumber}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">IFSC</span><span className="font-semibold">{paymentSettings.bankDetails.ifsc}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Bank</span><span className="font-semibold">{paymentSettings.bankDetails.bankName}</span></div>
                </div>
              </div>
            )}

            {/* Payment methods */}
            <div className="mb-5">
              <Label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {"// payment_method"}
              </Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className={cn("grid gap-2", paymentMethods.length === 1 ? "grid-cols-1" : paymentMethods.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3")}
              >
                {paymentMethods.map((m) => (
                  <Label
                    key={m.id}
                    htmlFor={`pm-${m.id}`}
                    className={cn(
                      "flex cursor-pointer flex-col gap-1 rounded-md border p-3 transition-colors",
                      paymentMethod === m.id
                        ? "border-primary bg-primary/10 glow-green"
                        : "border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        id={`pm-${m.id}`}
                        value={m.id}
                        className="border-primary/40 text-primary"
                      />
                      <span className="text-lg">{m.icon}</span>
                      <span className="font-mono text-sm font-semibold">
                        {m.label}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {m.description}
                    </span>
                  </Label>
                ))}
              </RadioGroup>
              <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                <Lock className="mr-1 inline size-3 text-primary" />
                info only — no card details stored. verification is manual.
              </p>
            </div>

            {/* UTR / Transaction Reference */}
            <div>
              <Label
                htmlFor="txn-ref"
                className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground"
              >
                {"// transaction_reference (UTR)"}
                <span className="ml-1 text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-primary">
                  &gt;
                </span>
                <Input
                  id="txn-ref"
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  placeholder="e.g. 4528193765432"
                  aria-invalid={txnError}
                  aria-describedby={txnError ? "txn-error" : undefined}
                  className={cn(
                    "border-primary/30 bg-background/50 pl-7 font-mono tracking-wide placeholder:text-muted-foreground/60",
                    txnError && "border-destructive glow-red"
                  )}
                />
              </div>
              {txnError && (
                <p
                  id="txn-error"
                  className="mt-1.5 font-mono text-xs text-destructive"
                >
                  <span>!</span> transaction reference is required to execute
                  payment
                </p>
              )}
            </div>

            {/* Execute button */}
            <Button
              size="lg"
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="glow-green mt-5 w-full gap-2 font-mono uppercase tracking-widest"
            >
              {submitting ? (
                <>
                  <Terminal className="size-4 animate-pulse" />
                  EXECUTING…
                </>
              ) : (
                <>
                  <Zap className="size-4" />
                  EXECUTE PAYMENT
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* RIGHT — Order summary (sticky) */}
        <div className="lg:block">
          <div className="lg:sticky lg:top-24">
            <Card className="terminal-window overflow-hidden">
              {/* Window header */}
              <div className="flex items-center gap-2 border-b border-primary/15 bg-primary/5 px-4 py-2">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-destructive/70" />
                  <span className="size-2.5 rounded-full bg-amber-500/70" />
                  <span className="size-2.5 rounded-full bg-primary/70" />
                </div>
                <span className="ml-2 font-mono text-[11px] uppercase tracking-widest text-primary/80">
                  order_summary.txt
                </span>
              </div>

              {/* Course thumbnail + title */}
              <div className="flex gap-3 border-b border-primary/15 p-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="scanlines pointer-events-none absolute inset-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-mono text-sm font-semibold text-foreground">
                    {course.title}
                  </p>
                  {instructor && (
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      <span className="text-primary">@</span> {instructor.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="flex flex-col gap-2 p-4 font-mono text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">original_price</span>
                  <span className="text-foreground">
                    {formatPrice(course.price, course.currency)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-primary">discount</span>
                    <span className="text-primary">
                      -{formatPrice(discount, course.currency)}
                    </span>
                  </div>
                )}
                {appliedCouponCode && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">coupon</span>
                    <span className="text-primary">{appliedCouponCode}</span>
                  </div>
                )}
                <Separator className="my-1 bg-primary/15" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold uppercase tracking-widest">
                    total
                  </span>
                  <span className="text-xl font-bold text-primary text-glow-green">
                    {formatPrice(finalAmount, course.currency)}
                  </span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="border-t border-primary/15 p-4">
                <div className="grid grid-cols-1 gap-2">
                  {TRUST_BADGES.map((b) => {
                    const Icon = b.icon;
                    return (
                      <div
                        key={b.label}
                        className="flex items-center gap-2 font-mono text-xs text-muted-foreground"
                      >
                        <Icon className="size-3.5 text-primary" />
                        <span className="uppercase tracking-widest">{b.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer note */}
              <div className="border-t border-primary/15 bg-primary/5 px-4 py-3">
                <p className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                  <ShieldCheck className="size-3.5 text-primary" />
                  <span>
                    <span className="text-primary">$</span> payment verified
                    manually within minutes
                  </span>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Success screen — terminal output style
// ---------------------------------------------------------------------------
function SuccessScreen({
  order,
  greetingMessage,
  onContinue,
  onBack,
}: {
  order: Order;
  greetingMessage: string;
  onContinue: () => void;
  onBack: () => void;
}) {
  const steps = [
    { n: "01", label: "We verify your payment", icon: ShieldCheck },
    { n: "02", label: "Access granted within minutes", icon: KeyRound },
    { n: "03", label: "Start hacking", icon: Terminal },
  ];

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30" />
      <AnimatePresence mode="wait">
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="terminal-window overflow-hidden">
            {/* Window header */}
            <div className="flex items-center gap-2 border-b border-primary/15 bg-primary/5 px-4 py-2">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-destructive/70" />
                <span className="size-2.5 rounded-full bg-amber-500/70" />
                <span className="size-2.5 rounded-full bg-primary/70" />
              </div>
              <span className="ml-2 font-mono text-[11px] uppercase tracking-widest text-primary/80">
                payment_terminal — output
              </span>
            </div>

            {/* Terminal output */}
            <div className="p-6 sm:p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-4 font-mono text-sm"
              >
                <p className="text-primary">
                  <span className="text-muted-foreground">$</span> payment_submitted
                </p>
                <p className="mt-1 text-amber-500">
                  <span className="text-muted-foreground">&gt;</span> status:{" "}
                  <span className="font-semibold">PENDING_VERIFICATION</span>
                </p>
                <p className="mt-1 text-muted-foreground">
                  <span className="text-primary">&gt;</span> order_id:{" "}
                  <span className="font-semibold text-foreground">
                    {order.orderNumber}
                  </span>
                </p>
              </motion.div>

              {/* Greeting message from admin payment settings */}
              {greetingMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="my-4 rounded-md border border-primary/30 bg-primary/5 p-4"
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-primary/80">
                    {"// message_from_seller"}
                  </p>
                  <p className="mt-1.5 text-sm text-foreground">
                    {greetingMessage}
                  </p>
                </motion.div>
              )}

              <div className="my-6 flex justify-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex size-20 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary glow-green"
                >
                  <CheckCircle2 className="size-10" />
                </motion.div>
              </div>

              <h2 className="text-center text-2xl font-bold tracking-tight text-glow-green">
                PAYMENT SUBMITTED
              </h2>
              <p className="mt-2 text-center font-mono text-sm text-muted-foreground">
                <span className="text-primary">$</span> your order is queued for
                verification. we&apos;ll notify you once access is granted.
              </p>

              <Separator className="my-6 bg-primary/15" />

              {/* What happens next */}
              <div>
                <p className="mb-4 font-mono text-xs uppercase tracking-widest text-primary">
                  {"// what_happens_next"}
                </p>
                <div className="flex flex-col gap-3">
                  {steps.map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={step.n}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex items-center gap-3 rounded-md border border-primary/15 bg-card/40 p-3"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-md border border-primary/30 bg-primary/5 font-mono text-xs text-primary">
                          {step.n}
                        </span>
                        <Icon className="size-4 text-primary" />
                        <span className="font-mono text-sm text-foreground/90">
                          {step.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={onContinue}
                  className="glow-green flex-1 gap-2 font-mono uppercase tracking-widest"
                >
                  <Terminal className="size-4" />
                  VIEW MY LEARNING
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onBack}
                  className="border-primary/30 font-mono uppercase tracking-widest text-primary"
                >
                  <ArrowLeft className="size-4" />
                  BACK TO COURSE
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

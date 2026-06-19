import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/coupons/apply
// Body: { code: string, amount: number, courseId?: string }
// Server-side validation engine — mirrors the client validation.
export async function POST(req: NextRequest) {
  try {
    const { code, amount, courseId } = (await req.json()) as {
      code: string;
      amount: number;
      courseId?: string;
    };

    if (!code || typeof amount !== "number") {
      return NextResponse.json(
        { ok: false, message: "Invalid request.", discount: 0 },
        { status: 400 }
      );
    }

    const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon)
      return NextResponse.json({ ok: false, message: "Invalid coupon code.", discount: 0 });

    if (!coupon.active)
      return NextResponse.json({
        ok: false,
        message: "This coupon is no longer active.",
        discount: 0,
      });

    const now = Date.now();
    if (new Date(coupon.startsAt).getTime() > now)
      return NextResponse.json({ ok: false, message: "This coupon is not yet active.", discount: 0 });

    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < now)
      return NextResponse.json({ ok: false, message: "This coupon has expired.", discount: 0 });

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      return NextResponse.json({
        ok: false,
        message: "This coupon has reached its usage limit.",
        discount: 0,
      });

    if (amount < coupon.minAmount)
      return NextResponse.json({
        ok: false,
        message: `Minimum order amount of ₹${coupon.minAmount.toLocaleString("en-IN")} required.`,
        discount: 0,
      });

    if (coupon.courseId && courseId && coupon.courseId !== courseId)
      return NextResponse.json({
        ok: false,
        message: "This coupon is not valid for this course.",
        discount: 0,
      });

    const discount =
      coupon.type === "PERCENT"
        ? Math.round((amount * coupon.value) / 100)
        : Math.min(coupon.value, amount);

    if (discount <= 0)
      return NextResponse.json({ ok: false, message: "Coupon discount is zero.", discount: 0 });

    return NextResponse.json({
      ok: true,
      message: `Coupon applied! You saved ₹${discount.toLocaleString("en-IN")}.`,
      discount,
      couponCode: coupon.code,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: (e as Error).message, discount: 0 },
      { status: 500 }
    );
  }
}

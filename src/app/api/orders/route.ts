import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/orders?status=PENDING  — list orders (admin)
export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status");
    const orders = await db.order.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// POST /api/orders — create a pending order (webhook-ready endpoint)
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      userId: string;
      courseId: string;
      amount: number;
      discount?: number;
      finalAmount: number;
      couponCode?: string;
      paymentRef: string;
      paymentMethod?: string;
    };

    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        userId: body.userId,
        courseId: body.courseId,
        amount: body.amount,
        discount: body.discount ?? 0,
        finalAmount: body.finalAmount,
        couponCode: body.couponCode,
        paymentRef: body.paymentRef,
        paymentMethod: body.paymentMethod,
        status: "PENDING",
        notes: "[]",
      },
    });

    await db.activityLog.create({
      data: {
        userId: body.userId,
        orderId: order.id,
        action: "ORDER_CREATED",
        detail: `Order ${orderNumber} created`,
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

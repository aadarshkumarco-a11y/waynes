import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/orders/[id]/approve — admin approves a pending order.
// Demonstrates the modular approval workflow + audit logging.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const at = new Date();
    const order = await db.order.update({
      where: { id },
      data: { status: "APPROVED", approvedAt: at },
    });

    // grant enrollment
    const existing = await db.enrollment.findFirst({
      where: { userId: order.userId, courseId: order.courseId },
    });
    if (!existing) {
      await db.enrollment.create({
        data: { userId: order.userId, courseId: order.courseId, progress: 0 },
      });
    }

    await db.activityLog.create({
      data: {
        userId: order.userId,
        orderId: order.id,
        action: "ORDER_APPROVED",
        detail: `Order ${order.orderNumber} approved — access granted`,
      },
    });

    return NextResponse.json({ ok: true, order });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

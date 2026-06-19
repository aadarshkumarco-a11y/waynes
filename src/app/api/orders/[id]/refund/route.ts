import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/orders/[id]/refund
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const at = new Date();
    const order = await db.order.update({
      where: { id },
      data: { status: "REFUNDED", refundedAt: at },
    });
    await db.activityLog.create({
      data: { orderId: order.id, action: "ORDER_REFUNDED", detail: `Order ${order.orderNumber} refunded` },
    });
    return NextResponse.json({ ok: true, order });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

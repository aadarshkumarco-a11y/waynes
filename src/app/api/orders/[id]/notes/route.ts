import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/orders/[id]/notes — append an admin note to an order (audit trail)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { author, text } = (await req.json()) as { author: string; text: string };
    const order = await db.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const notes = JSON.parse(order.notes || "[]") as Array<{
      id: string;
      author: string;
      text: string;
      at: string;
    }>;
    notes.push({
      id: `note-${Date.now()}`,
      author,
      text,
      at: new Date().toISOString(),
    });
    const updated = await db.order.update({
      where: { id },
      data: { notes: JSON.stringify(notes) },
    });
    return NextResponse.json({ ok: true, notes: JSON.parse(updated.notes || "[]") });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

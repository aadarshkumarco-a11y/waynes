import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/subscribers — newsletter signup
export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email: string };
    if (!email || !email.includes("@"))
      return NextResponse.json({ ok: false, message: "Enter a valid email." }, { status: 400 });

    const existing = await db.subscriber.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ ok: true, message: "You're already subscribed!" });

    await db.subscriber.create({ data: { email } });
    return NextResponse.json({ ok: true, message: "Subscribed! Check your inbox." });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

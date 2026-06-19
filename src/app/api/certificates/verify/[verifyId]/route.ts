import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/certificates/verify/[verifyId] — public certificate verification
export async function GET(_req: NextRequest, { params }: { params: Promise<{ verifyId: string }> }) {
  try {
    const { verifyId } = await params;
    const cert = await db.certificate.findUnique({ where: { verifyId } });
    if (!cert)
      return NextResponse.json({ ok: false, message: "Certificate not found." }, { status: 404 });
    return NextResponse.json({ ok: true, certificate: cert });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

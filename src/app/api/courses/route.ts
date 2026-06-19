import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { seedDatabase } from "@/lib/data/seed-db";

// GET /api/courses — list published courses (auto-seeds DB if empty)
export async function GET() {
  try {
    let count = await db.course.count();
    if (count === 0) {
      await seedDatabase();
      count = await db.course.count();
    }
    const list = await db.course.findMany({
      where: { published: true },
      include: {
        instructor: true,
        category: true,
        sections: { include: { lessons: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ courses: list });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// POST /api/courses — re-seed the database from catalog
export async function POST() {
  try {
    const res = await seedDatabase();
    return NextResponse.json(res);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

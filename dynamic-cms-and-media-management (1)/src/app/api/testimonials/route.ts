import { NextResponse } from "next/server";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// GET – public (featured first) or all (admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    if (all) {
      const admin = await requireAdmin();
      if (!admin) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
      }
    }

    const results = await db
      .select()
      .from(testimonials)
      .orderBy(desc(testimonials.featured), desc(testimonials.createdAt));

    return NextResponse.json({ testimonials: results });
  } catch (error) {
    console.error("Testimonials list error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { clientName, clientRole, company, content, rating, avatar, featured } = body;

    if (!clientName || !content) {
      return NextResponse.json(
        { message: "Client name and content are required" },
        { status: 400 }
      );
    }

    const [testimonial] = await db
      .insert(testimonials)
      .values({
        clientName,
        clientRole: clientRole || null,
        company: company || null,
        content,
        rating: rating ?? 5,
        avatar: avatar || null,
        featured: featured ?? false,
      })
      .returning();

    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (error) {
    console.error("Testimonial create error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

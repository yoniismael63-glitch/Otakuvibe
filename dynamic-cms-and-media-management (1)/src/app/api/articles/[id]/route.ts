import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// GET a single article by ID (admin only – public uses slug page)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }
    const { id } = await params;
    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, parseInt(id)))
      .limit(1);

    if (!article) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ article });
  } catch (error) {
    console.error("Article fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT – update
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }
    const { id } = await params;
    const body = await request.json();

    const [updated] = await db
      .update(articles)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ article: updated });
  } catch (error) {
    console.error("Article update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }
    const { id } = await params;
    await db.delete(articles).where(eq(articles.id, parseInt(id)));
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Article delete error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

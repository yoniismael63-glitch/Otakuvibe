import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// GET /api/articles – list (published for public, all for admin)
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

    const results = all
      ? await db.select().from(articles).orderBy(desc(articles.createdAt))
      : await db
          .select()
          .from(articles)
          .where(eq(articles.published, true))
          .orderBy(desc(articles.createdAt));

    return NextResponse.json({ articles: results });
  } catch (error) {
    console.error("Articles list error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/articles – create (admin only)
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { title, slug, excerpt, content, coverImage, category, published } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { message: "Title, slug and content are required" },
        { status: 400 }
      );
    }

    const [article] = await db
      .insert(articles)
      .values({
        title,
        slug,
        excerpt: excerpt || "",
        content,
        coverImage: coverImage || null,
        category: category || "blog",
        published: published ?? false,
        authorId: admin.id,
      })
      .returning();

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error("Article create error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

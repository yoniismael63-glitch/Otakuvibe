import { NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { uploadFile, detectType } from "@/lib/storage";

// GET /api/media – list (admin only)
export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const items = await db
      .select()
      .from(media)
      .orderBy(desc(media.createdAt));

    return NextResponse.json({ media: items });
  } catch (error) {
    console.error("Media list error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/media – upload (admin only)
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "Aucun fichier fourni" }, { status: 400 });
    }

    const { url, filename } = await uploadFile(file, admin.id);

    const [item] = await db
      .insert(media)
      .values({
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url,
        type: detectType(file.type),
        alt: "",
        uploadedBy: admin.id,
      })
      .returning();

    return NextResponse.json({ media: item }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ message }, { status: 500 });
  }
}

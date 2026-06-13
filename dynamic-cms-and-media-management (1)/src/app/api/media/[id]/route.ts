import { NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { deleteFile } from "@/lib/storage";

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

    const [item] = await db
      .select()
      .from(media)
      .where(eq(media.id, parseInt(id)))
      .limit(1);

    if (!item) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    // Delete from storage provider (Cloudinary or local)
    await deleteFile(item.url).catch((err) =>
      console.warn("Storage delete warning:", err)
    );

    await db.delete(media).where(eq(media.id, parseInt(id)));
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

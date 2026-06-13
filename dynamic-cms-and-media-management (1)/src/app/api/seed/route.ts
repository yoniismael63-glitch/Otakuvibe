import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";

export async function POST() {
  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, "admin@otakuvibes.com"))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Admin user already exists" },
        { status: 200 }
      );
    }

    await db.insert(users).values({
      email: "admin@otakuvibes.com",
      name: "Admin Otaku",
      passwordHash: await hashPassword("admin123"),
      role: "admin",
    });

    return NextResponse.json(
      { message: "Admin created: admin@otakuvibes.com / admin123" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

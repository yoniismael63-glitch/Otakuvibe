import { NextResponse } from "next/server";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { clearSessionCookie, getSessionToken } from "@/lib/auth";

export async function POST() {
  const token = await getSessionToken();
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  await clearSessionCookie();
  return NextResponse.json({ message: "Logged out" });
}

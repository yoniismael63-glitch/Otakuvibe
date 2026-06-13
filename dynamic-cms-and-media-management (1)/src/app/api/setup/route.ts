import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, sessions, articles, testimonials, media } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { sql } from "drizzle-orm";

/**
 * One-click setup for Vercel / production.
 *
 * GET  /api/setup  → check status (have tables? have admin?)
 * POST /api/setup  → create tables + seed admin (idempotent)
 *
 * POST body (optional JSON):
 *   { "email": "...", "password": "..." }
 */

export async function GET() {
  try {
    const tableCheck = await db.execute(sql`
      SELECT to_regclass('public.users') AS u,
             to_regclass('public.sessions') AS s,
             to_regclass('public.articles') AS a,
             to_regclass('public.testimonials') AS t,
             to_regclass('public.media') AS m
    `);
    const row = (tableCheck.rows as Record<string, unknown>[])[0];
    const allTables = row.u && row.s && row.a && row.t && row.m;

    let adminExists = false;
    if (allTables) {
      const r = await db.execute(
        sql`SELECT 1 FROM users WHERE role = 'admin' LIMIT 1`
      );
      adminExists = (r.rowCount ?? 0) > 0;
    }

    return NextResponse.json({
      tablesReady: Boolean(allTables),
      adminExists,
    });
  } catch (error) {
    return NextResponse.json(
      { tablesReady: false, adminExists: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let email = "admin@otakuvibes.com";
  let password = "admin123";

  try {
    const body = await request.json().catch(() => ({}));
    if (body.email) email = body.email;
    if (body.password) password = body.password;
  } catch {
    // use defaults
  }

  try {
    // 1. Create tables using raw DDL (idempotent)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        excerpt TEXT,
        content TEXT NOT NULL,
        cover_image VARCHAR(500),
        category VARCHAR(100) DEFAULT 'blog',
        published BOOLEAN DEFAULT false NOT NULL,
        author_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        client_role VARCHAR(255),
        company VARCHAR(255),
        content TEXT NOT NULL,
        rating INTEGER DEFAULT 5,
        avatar VARCHAR(500),
        featured BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS media (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(500) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        size INTEGER NOT NULL,
        url VARCHAR(500) NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'image',
        alt VARCHAR(255),
        uploaded_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // 2. Create admin user if not exists
    const existing = await db.execute(
      sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`
    );

    let adminCreated = false;
    if ((existing.rowCount ?? 0) === 0) {
      await db.execute(sql`
        INSERT INTO users (email, name, password_hash, role)
        VALUES (${email}, 'Admin Otaku', ${await hashPassword(password)}, 'admin')
      `);
      adminCreated = true;
    }

    return NextResponse.json({
      success: true,
      tablesReady: true,
      adminCreated,
      login: adminCreated ? { email, password } : null,
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

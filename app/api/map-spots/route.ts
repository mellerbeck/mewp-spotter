import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const runtime = "nodejs"

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null
function db() {
  if (!sql) throw new Error("Database not configured")
  return sql
}

export async function GET() {
  try {
    const spots = await db().query(
      `select id, brand, type, model, note, latitude, longitude, photo_url, created_at
       from spots
       where status = 'approved'
         and latitude is not null
         and longitude is not null
       order by created_at desc
       limit 2000`
    )

    return NextResponse.json({ ok: true, spots })
  } catch (err: any) {
    const msg =
      process.env.NODE_ENV === "development"
        ? err?.message || String(err)
        : "Server error"
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

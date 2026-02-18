import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { auth } from "@/auth"

function db() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("Database not configured")
  return neon(url)
}

export async function GET() {
  try {
    const session = await auth()
    const userId = (session?.user as any)?.id as string | undefined

    if (!userId) {
      return NextResponse.json({ ok: true, spots: [] })
    }

    const sql = db()

    const spots = await sql.query(
      `select
          id,
          brand,
          type,
          model,
          note,
          latitude,
          longitude,
          photo_url,
          created_at
       from spots
       where user_id = $1
       order by created_at desc
       limit 200`,
      [userId]
    )

    return NextResponse.json({ ok: true, spots })
  } catch (err: any) {
    const msg =
      process.env.NODE_ENV === "development"
        ? err?.message || String(err)
        : "Server error"

    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    const userId = (session?.user as any)?.id as string | undefined

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const brand = String(body.brand || "").trim()
    const type = String(body.type || "").trim()
    const model = body.model ? String(body.model).trim() : null
    const note = body.note ? String(body.note).trim() : null

    const latitude = body.latitude == null ? null : Number(body.latitude)
    const longitude = body.longitude == null ? null : Number(body.longitude)
    const photo_url = body.photo_url ? String(body.photo_url).trim() : null

    if (!brand || !type) {
      return NextResponse.json(
        { ok: false, error: "brand and type are required" },
        { status: 400 }
      )
    }

    if (
      (latitude !== null && Number.isNaN(latitude)) ||
      (longitude !== null && Number.isNaN(longitude))
    ) {
      return NextResponse.json(
        { ok: false, error: "latitude/longitude must be numbers" },
        { status: 400 }
      )
    }

    const sql = db()

    const inserted = await sql.query(
      `insert into spots
        (user_id, brand, type, model, note, latitude, longitude, photo_url)
       values ($1,$2,$3,$4,$5,$6,$7,$8)
       returning id, created_at`,
      [userId, brand, type, model, note, latitude, longitude, photo_url]
    )

    return NextResponse.json({
      ok: true,
      spot: inserted[0],
    })
  } catch (err: any) {
    const msg =
      process.env.NODE_ENV === "development"
        ? err?.message || String(err)
        : "Server error"

    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 }
    )
  }
}

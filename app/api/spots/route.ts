import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { auth } from "@/auth"
import { del } from "@vercel/blob"

export const runtime = "nodejs"

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null
function db() {
  if (!sql) throw new Error("Database not configured")
  return sql
}

const DAILY_SPOT_LIMIT = 20
const todayISODate = () => new Date().toISOString().slice(0, 10)

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) return NextResponse.json({ ok: true, spots: [] })

    const spots = await db().query(
      `select
          id,
          brand,
          type,
          model,
          note,
          latitude,
          longitude,
          photo_url,
          created_at,
          status
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
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
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

    // ---- DAILY RATE LIMIT (20 spots/user/day) ----
    const day = todayISODate()

    await db().query(
      `insert into user_rate_limits (user_id, day)
       values ($1, $2)
       on conflict (user_id, day) do nothing`,
      [userId, day]
    )

    const limitRows = await db().query(
      `select spots_created
       from user_rate_limits
       where user_id = $1 and day = $2`,
      [userId, day]
    )

    const currentCount = Number(limitRows[0]?.spots_created ?? 0)

    if (currentCount >= DAILY_SPOT_LIMIT) {
      return NextResponse.json(
        { ok: false, error: `Daily limit reached (${DAILY_SPOT_LIMIT} spots per day)` },
        { status: 429 }
      )
    }

    const inserted = await db().query(
      `insert into spots
        (user_id, brand, type, model, note, latitude, longitude, photo_url, status)
       values ($1,$2,$3,$4,$5,$6,$7,$8,'pending')
       returning id, created_at, status`,
      [userId, brand, type, model, note, latitude, longitude, photo_url]
    )

    await db().query(
      `update user_rate_limits
       set spots_created = spots_created + 1
       where user_id = $1 and day = $2`,
      [userId, day]
    )

    return NextResponse.json({ ok: true, spot: inserted[0] })
  } catch (err: any) {
    const msg =
      process.env.NODE_ENV === "development"
        ? err?.message || String(err)
        : "Server error"
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const id = url.searchParams.get("id")?.trim()

    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 })
    }

    // Look up spot (must belong to user)
    const found = await db().query(
      `select photo_url
       from spots
       where id = $1 and user_id = $2
       limit 1`,
      [id, userId]
    )

    if (!found[0]) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 })
    }

    const photoUrl = found[0].photo_url as string | null

    // Delete spot (ownership enforced)
    await db().query(
      `delete from spots
       where id = $1 and user_id = $2`,
      [id, userId]
    )

    // Best-effort blob cleanup (only if it's in this user's folder)
    if (photoUrl && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const pathname = new URL(photoUrl).pathname
        if (pathname.includes(`/spots/${userId}/`)) {
          await del(photoUrl)
        }
      } catch {
        // ignore cleanup failures
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    const msg =
      process.env.NODE_ENV === "development"
        ? err?.message || String(err)
        : "Server error"
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

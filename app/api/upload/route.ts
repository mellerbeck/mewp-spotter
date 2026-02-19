import { NextResponse } from "next/server"
import { put, del } from "@vercel/blob"
import { neon } from "@neondatabase/serverless"
import { auth } from "@/auth"

export const runtime = "nodejs"

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null
function db() {
  if (!sql) throw new Error("Database not configured")
  return sql
}

const DAILY_UPLOAD_LIMIT = 20
const todayISO = () => new Date().toISOString().slice(0, 10)

function requireBlobToken() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "Blob not configured" },
      { status: 500 }
    )
  }
  return null
}

export async function POST(req: Request) {
  try {
    const tokenErr = requireBlobToken()
    if (tokenErr) return tokenErr

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // ---- DAILY UPLOAD RATE LIMIT ----
    const day = todayISO()

    await db().query(
      `insert into user_rate_limits (user_id, day)
       values ($1, $2)
       on conflict (user_id, day) do nothing`,
      [userId, day]
    )

    const rows = await db().query(
      `select uploads_created
       from user_rate_limits
       where user_id = $1 and day = $2`,
      [userId, day]
    )

    const current = Number(rows[0]?.uploads_created ?? 0)

    if (current >= DAILY_UPLOAD_LIMIT) {
      return NextResponse.json(
        { ok: false, error: `Daily limit reached (${DAILY_UPLOAD_LIMIT} uploads per day)` },
        { status: 429 }
      )
    }

    const form = await req.formData()
    const file = form.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Missing file" },
        { status: 400 }
      )
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { ok: false, error: "Only image uploads supported" },
        { status: 400 }
      )
    }

    const maxBytes = 8 * 1024 * 1024
    if (file.size > maxBytes) {
      return NextResponse.json(
        { ok: false, error: "File too large (max 8MB)" },
        { status: 400 }
      )
    }

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase()
    const safeExt = ["jpg", "jpeg", "png", "webp", "heic"].includes(ext)
      ? ext
      : "jpg"

    const filename = `spots/${userId}/${Date.now()}-${crypto.randomUUID()}.${safeExt}`

    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    })

    // increment counter AFTER successful upload
    await db().query(
      `update user_rate_limits
       set uploads_created = uploads_created + 1
       where user_id = $1 and day = $2`,
      [userId, day]
    )

    return NextResponse.json({ ok: true, url: blob.url })
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
    const tokenErr = requireBlobToken()
    if (tokenErr) return tokenErr

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const url = String(body?.url || "").trim()

    if (!url) {
      return NextResponse.json(
        { ok: false, error: "Missing url" },
        { status: 400 }
      )
    }

    let pathname = ""
    try {
      pathname = new URL(url).pathname
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid url" },
        { status: 400 }
      )
    }

    if (!pathname.includes(`/spots/${userId}/`)) {
      return NextResponse.json(
        { ok: false, error: "Forbidden" },
        { status: 403 }
      )
    }

    await del(url)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    const msg =
      process.env.NODE_ENV === "development"
        ? err?.message || String(err)
        : "Server error"

    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

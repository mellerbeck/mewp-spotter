import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function db() {
  if (!process.env.DATABASE_URL) throw new Error("Database not configured");
  return neon(process.env.DATABASE_URL);
}

export async function GET() {
  try {
    const sql = db();

    const rows = await sql.query(
      `select id, brand, type, model, note, latitude, longitude, photo_url, created_at
       from spots
       order by created_at desc
       limit 200`
    );

    return NextResponse.json({ ok: true, spots: rows });
  } catch (err: any) {
    const msg =
      process.env.NODE_ENV === "development"
        ? err?.message || String(err)
        : "Server error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sql = db();
    const body = await req.json();

    const brand = String(body.brand || "").trim();
    const type = String(body.type || "").trim();
    const model = body.model ? String(body.model).trim() : null;
    const note = body.note ? String(body.note).trim() : null;

    const latitude =
      body.latitude === null || body.latitude === undefined
        ? null
        : Number(body.latitude);
    const longitude =
      body.longitude === null || body.longitude === undefined
        ? null
        : Number(body.longitude);

    const photo_url = body.photo_url ? String(body.photo_url).trim() : null;

    if (!brand || !type) {
      return NextResponse.json(
        { ok: false, error: "brand and type are required" },
        { status: 400 }
      );
    }

    if (
      (latitude !== null && Number.isNaN(latitude)) ||
      (longitude !== null && Number.isNaN(longitude))
    ) {
      return NextResponse.json(
        { ok: false, error: "latitude/longitude must be numbers" },
        { status: 400 }
      );
    }

    const rows = await sql.query(
      `insert into spots (brand, type, model, note, latitude, longitude, photo_url)
       values ($1,$2,$3,$4,$5,$6,$7)
       returning id, created_at`,
      [brand, type, model, note, latitude, longitude, photo_url]
    );

    return NextResponse.json({ ok: true, spot: rows[0] });
  } catch (err: any) {
    const msg =
      process.env.NODE_ENV === "development"
        ? err?.message || String(err)
        : "Server error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

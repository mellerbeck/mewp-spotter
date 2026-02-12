import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("Database not configured");
    }

    const body = await req.json();

    const brand = String(body.brand || "").trim();
    const type = String(body.type || "").trim();
    const model = body.model ? String(body.model).trim() : null;
    const note = body.note ? String(body.note).trim() : null;
    const latitude =
      body.latitude == null ? null : Number(body.latitude);
    const longitude =
      body.longitude == null ? null : Number(body.longitude);
    const photo_url = body.photo_url ? String(body.photo_url).trim() : null;

    if (!brand || !type) {
      return NextResponse.json(
        { ok: false, error: "brand and type are required" },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    const result = await sql.query(
      `insert into spots (brand, type, model, note, latitude, longitude, photo_url)
       values ($1,$2,$3,$4,$5,$6,$7)
       returning id, created_at`,
      [brand, type, model, note, latitude, longitude, photo_url]
    );

    return NextResponse.json({ ok: true, spot: result.rows[0] });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { ok: false, error: "Blob not configured" },
        { status: 500 }
      );
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Missing file" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { ok: false, error: "Only image uploads supported" },
        { status: 400 }
      );
    }

    const maxBytes = 8 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { ok: false, error: "File too large (max 8MB)" },
        { status: 400 }
      );
    }

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const safeExt = ["jpg", "jpeg", "png", "webp", "heic"].includes(ext)
      ? ext
      : "jpg";

    const filename = `spots/${Date.now()}-${crypto.randomUUID()}.${safeExt}`;

    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });

    return NextResponse.json({ ok: true, url: blob.url });
  } catch (err: any) {
    const msg =
      process.env.NODE_ENV === "development"
        ? err?.message || String(err)
        : "Server error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { ok: false, error: "Blob not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const url = String(body?.url || "").trim();

    if (!url) {
      return NextResponse.json(
        { ok: false, error: "Missing url" },
        { status: 400 }
      );
    }

    await del(url);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const msg =
      process.env.NODE_ENV === "development"
        ? err?.message || String(err)
        : "Server error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

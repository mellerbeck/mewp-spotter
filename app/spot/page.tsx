"use client";

import { useEffect, useState } from "react";
import Nav from "../components/Nav";

export default function SpotPage() {
  const [brand, setBrand] = useState("Genie");
  const [type, setType] = useState("Boom");
  const [model, setModel] = useState("");
  const [note, setNote] = useState("");

  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<string>("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLoc({ lat: p.coords.latitude, lng: p.coords.longitude });
        setStatus("Location captured.");
      },
      () => setStatus("Location blocked. You can still save without it.")
    );
  }, []);

  function onPhoto(file: File | null) {
    setPhotoFile(file);
    if (!file) {
      setPhotoPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function uploadPhotoIfNeeded(): Promise<string | null> {
    if (!photoFile) return null;

    const form = new FormData();
    form.append("file", photoFile);

    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data?.error || "Photo upload failed");
    }

    return data.url as string;
  }

  async function saveSpot() {
  let photo_url: string | null = null;

  try {
    setStatus("Saving...");

    photo_url = await uploadPhotoIfNeeded();

    const res = await fetch("/api/spots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand,
        type,
        model: model.trim() ? model.trim() : null,
        note: note.trim() ? note.trim() : null,
        latitude: loc?.lat ?? null,
        longitude: loc?.lng ?? null,
        photo_url,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      // DB failed after upload: best-effort cleanup
      if (photo_url) {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: photo_url }),
        });
      }

      setStatus(data?.error || "Failed to save");
      return;
    }

    window.location.href = "/spots";
  } catch (err: any) {
    // also cleanup on unexpected errors
    if (photo_url) {
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: photo_url }),
        });
      } catch {}
    }

    setStatus(err?.message || "Failed to save");
  }
}


  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Nav />

      <main className="mx-auto max-w-2xl px-6 py-16 text-black dark:text-zinc-50">
        <h1 className="text-3xl font-bold">Add a MEWP Spot</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{status}</p>

        <div className="mt-8 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm">Brand</span>
            <select
              className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-black"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              <option>Genie</option>
              <option>JLG</option>
              <option>Skyjack</option>
              <option>Haulotte</option>
              <option>Niftylift</option>
              <option>Snorkel</option>
              <option>Other</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm">Type</span>
            <select
              className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-black"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option>Boom</option>
              <option>Scissor</option>
              <option>Telehandler</option>
              <option>Trailer</option>
              <option>Other</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm">Model (optional)</span>
            <input
              className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-black"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g., Z-45/25"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm">Note (optional)</span>
            <input
              className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-black"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., rental yard, electric, blue..."
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm">Photo</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-black"
              onChange={(e) => onPhoto(e.target.files?.[0] || null)}
            />
          </label>

          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoPreview}
              alt="MEWP photo preview"
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800"
            />
          ) : null}

          <button
            onClick={saveSpot}
            className="mt-2 rounded-full bg-black px-6 py-3 text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
          >
            Save Spot
          </button>
        </div>
      </main>
    </div>
  );
}

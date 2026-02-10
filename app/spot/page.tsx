"use client";

import { useEffect, useState } from "react";

export default function SpotPage() {
  const [brand, setBrand] = useState("Genie");
  const [type, setType] = useState("Boom");
  const [note, setNote] = useState("");
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<string>("");

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

  function saveLocal() {
    const spot = {
      brand,
      type,
      note,
      loc,
      ts: new Date().toISOString(),
    };
    const key = "mewp_spots";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.unshift(spot);
    localStorage.setItem(key, JSON.stringify(existing));
    setStatus("Saved locally ✅");
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
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
            <span className="text-sm">Note (optional)</span>
            <input
              className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-black"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., blue, electric, rental yard..."
            />
          </label>

          <button
            onClick={saveLocal}
            className="mt-2 rounded-full bg-black px-6 py-3 text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
          >
            Save spot
          </button>
        </div>
      </main>
    </div>
  );
}

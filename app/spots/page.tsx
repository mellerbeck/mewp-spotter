"use client";

import { useEffect, useMemo, useState } from "react";

type Spot = {
  brand: string;
  type: string;
  note?: string;
  loc: { lat: number; lng: number } | null;
  ts: string;
  photoDataUrl?: string | null;
};

export default function SpotsPage() {
  const [spots, setSpots] = useState<Spot[]>([]);

  useEffect(() => {
    const key = "mewp_spots";
    const raw = localStorage.getItem(key) || "[]";
    try {
      setSpots(JSON.parse(raw));
    } catch {
      setSpots([]);
    }
  }, []);

  const count = useMemo(() => spots.length, [spots]);

  function clearAll() {
    localStorage.removeItem("mewp_spots");
    setSpots([]);
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto max-w-2xl px-6 py-16 text-black dark:text-zinc-50">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Spots</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {count} saved
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href="/spot"
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm hover:bg-black/[.04] dark:border-zinc-800 dark:hover:bg-white/[.08]"
            >
              Add Spot
            </a>
            <button
              onClick={clearAll}
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm hover:bg-black/[.04] dark:border-zinc-800 dark:hover:bg-white/[.08]"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-3">
          {spots.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-600 dark:border-zinc-800 dark:bg-black dark:text-zinc-400">
              No spots yet. Go add your first one.
            </div>
          ) : (
            spots.map((s, i) => (
              <div
                key={`${s.ts}-${i}`}
                className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-black"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold">
                      {s.brand} · {s.type}
                    </div>
                    {s.note ? (
                      <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {s.note}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {new Date(s.ts).toLocaleString()}
                  </div>
                </div>

                {s.loc ? (
                  <div className="mt-3 text-xs text-zinc-500">
                    {s.loc.lat.toFixed(6)}, {s.loc.lng.toFixed(6)}
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-zinc-500">
                    No location saved
                  </div>
                )}

                {s.photoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.photoDataUrl}
                    alt="MEWP"
                    className="mt-3 rounded-2xl border border-zinc-200 dark:border-zinc-800"
                  />
                ) : null}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

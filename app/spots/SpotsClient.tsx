"use client"

import { useEffect, useMemo, useState } from "react"

type Spot = {
  id: string
  brand: string
  type: string
  model: string | null
  note: string | null
  latitude: number | null
  longitude: number | null
  photo_url: string | null
  created_at: string
}

export default function SpotsClient() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [status, setStatus] = useState("Loading...")

  async function load() {
    setStatus("Loading...")
    try {
      const res = await fetch("/api/spots", { cache: "no-store" })
      const data = await res.json()

      if (!res.ok || !data.ok) {
        setStatus(data?.error || "Failed to load")
        setSpots([])
        return
      }

      setSpots(Array.isArray(data.spots) ? data.spots : [])
      setStatus("")
    } catch {
      setStatus("Failed to load")
      setSpots([])
    }
  }

  async function deleteSpot(id: string) {
    if (!confirm("Delete this spot?")) return

    try {
      const res = await fetch(`/api/spots?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data.ok) {
        alert(data?.error || "Failed to delete")
        return
      }

      await load()
    } catch {
      alert("Failed to delete")
    }
  }

  useEffect(() => {
    load()
  }, [])

  const count = useMemo(() => spots.length, [spots])

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-black dark:text-zinc-50">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Spots</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {status ? status : `${count} saved`}
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
            onClick={load}
            className="rounded-full border border-zinc-200 px-4 py-2 text-sm hover:bg-black/[.04] dark:border-zinc-800 dark:hover:bg-white/[.08]"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-3">
        {spots.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-600 dark:border-zinc-800 dark:bg-black dark:text-zinc-400">
            No spots yet. Go add your first one.
          </div>
        ) : (
          spots.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-black"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">
                    {s.brand} · {s.type}
                    {s.model ? ` · ${s.model}` : ""}
                  </div>

                  {s.note ? (
                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {s.note}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs text-zinc-500">
                    {new Date(s.created_at).toLocaleString()}
                  </div>
                  <button
                    onClick={() => deleteSpot(s.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {s.latitude !== null && s.longitude !== null ? (
                <div className="mt-3 text-xs text-zinc-500">
                  {Number(s.latitude).toFixed(6)}, {Number(s.longitude).toFixed(6)}
                </div>
              ) : (
                <div className="mt-3 text-xs text-zinc-500">No location saved</div>
              )}

              {s.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.photo_url}
                  alt="MEWP"
                  className="mt-3 rounded-2xl border border-zinc-200 dark:border-zinc-800"
                />
              ) : null}
            </div>
          ))
        )}
      </div>
    </main>
  )
}

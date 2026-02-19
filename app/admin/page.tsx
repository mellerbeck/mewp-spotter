import Nav from "../components/Nav"
import { neon } from "@neondatabase/serverless"
import { auth } from "@/auth"
import { approveSpot, rejectSpot } from "./actions"

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null
function db() {
  if (!sql) throw new Error("Database not configured")
  return sql
}

function isAdmin(email: string | null | undefined) {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  return !!email && list.includes(email.toLowerCase())
}

export default async function AdminPage() {
  const session = await auth()
  const email = session?.user?.email

  if (!isAdmin(email)) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <Nav />
        <main className="mx-auto max-w-2xl px-6 py-16 text-black dark:text-zinc-50">
          <h1 className="text-2xl font-bold">Forbidden</h1>
        </main>
      </div>
    )
  }

  const pending = await db().query(
    `select id, brand, type, model, note, latitude, longitude, photo_url, created_at
     from spots
     where status = 'pending'
     order by created_at asc
     limit 200`
  )

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-16 text-black dark:text-zinc-50">
        <h1 className="text-3xl font-bold">Admin Review</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Pending: {pending.length}
        </p>

        <div className="mt-8 grid gap-4">
          {pending.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-600 dark:border-zinc-800 dark:bg-black dark:text-zinc-400">
              No pending spots.
            </div>
          ) : (
            pending.map((s: any) => (
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
                    <div className="mt-2 text-xs text-zinc-500">
                      {new Date(s.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <form
                      action={async () => {
                        "use server"
                        await approveSpot(s.id)
                      }}
                    >
                      <button
                        className="rounded-full border border-zinc-200 px-4 py-2 text-sm hover:bg-black/[.04] dark:border-zinc-800 dark:hover:bg-white/[.08]"
                        type="submit"
                      >
                        Approve
                      </button>
                    </form>

                    <form
                      action={async () => {
                        "use server"
                        await rejectSpot(s.id)
                      }}
                    >
                      <button
                        className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                        type="submit"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </div>

                {s.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.photo_url}
                    alt="MEWP"
                    className="mt-4 max-h-[360px] w-full rounded-2xl border border-zinc-200 object-cover dark:border-zinc-800"
                  />
                ) : null}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

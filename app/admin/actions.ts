"use server"

import { neon } from "@neondatabase/serverless"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

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

export async function approveSpot(id: string) {
  const session = await auth()
  const email = session?.user?.email
  const reviewerId = session?.user?.id

  if (!isAdmin(email) || !reviewerId) throw new Error("Forbidden")

  await db().query(
    `update spots
     set status = 'approved',
         reviewed_at = now(),
         reviewed_by = $2,
         rejection_reason = null
     where id = $1`,
    [id, reviewerId]
  )

  redirect("/admin")
}

export async function rejectSpot(id: string, reason?: string) {
  const session = await auth()
  const email = session?.user?.email
  const reviewerId = session?.user?.id

  if (!isAdmin(email) || !reviewerId) throw new Error("Forbidden")

  await db().query(
    `update spots
     set status = 'rejected',
         reviewed_at = now(),
         reviewed_by = $2,
         rejection_reason = $3
     where id = $1`,
    [id, reviewerId, (reason || "").trim() || null]
  )

  redirect("/admin")
}

"use client"

import type { Session } from "next-auth"

export default function AuthButtonClient({ session }: { session: Session | null }) {
  return (
    <div>
      {session?.user ? (
        <form action="/api/auth/signout" method="post">
          <button type="submit">Sign out</button>
        </form>
      ) : (
        <form action="/api/auth/signin/google" method="post">
          <button type="submit">Sign in</button>
        </form>
      )}
    </div>
  )
}

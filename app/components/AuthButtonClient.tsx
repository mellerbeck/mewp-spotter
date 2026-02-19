"use client"

import type { Session } from "next-auth"
import { signInGoogle, signOutAction } from "@/app/actions/auth"

export default function AuthButtonClient({ session }: { session: Session | null }) {
  return (
    <div>
      {session?.user ? (
        <form action={signOutAction}>
          <button type="submit">Sign out</button>
        </form>
      ) : (
        <form action={signInGoogle}>
          <button type="submit">Sign in with Google</button>
        </form>
      )}
    </div>
  )
}

"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session) {
    return (
      <button
        onClick={() => signIn("google")}
        className="text-sm underline text-zinc-600 dark:text-zinc-300"
      >
        Sign in
      </button>
    );
  }

  return (
    <button
      onClick={() => signOut()}
      className="text-sm underline text-zinc-600 dark:text-zinc-300"
    >
      Sign out
    </button>
  );
}

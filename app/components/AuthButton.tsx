"use client";

import { useTransition } from "react";
import { signInGoogle, signOutUser } from "@/app/actions/auth";

export default function AuthButton({ signedIn }: { signedIn: boolean }) {
  const [pending, start] = useTransition();

  return signedIn ? (
    <button
      disabled={pending}
      onClick={() => start(() => signOutUser())}
      className="text-sm underline text-zinc-600 disabled:opacity-50 dark:text-zinc-300"
    >
      Sign out
    </button>
  ) : (
    <button
      disabled={pending}
      onClick={() => start(() => signInGoogle())}
      className="text-sm underline text-zinc-600 disabled:opacity-50 dark:text-zinc-300"
    >
      Sign in
    </button>
  );
}

"use client";

import Link from "next/link";
import AuthButton from "./AuthButton";

export default function Nav() {
  return (
    <nav className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-black">
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="text-lg font-semibold text-black dark:text-white"
        >
          MEWP Spotter
        </Link>

        <Link
          href="/spots"
          className="text-sm text-zinc-600 hover:text-black dark:text-zinc-300 dark:hover:text-white"
        >
          My Spots
        </Link>

        <Link
          href="/map"
          className="text-sm text-zinc-600 hover:text-black dark:text-zinc-300 dark:hover:text-white"
        >
          Map
        </Link>

        <Link
          href="/spot"
          className="text-sm text-zinc-600 hover:text-black dark:text-zinc-300 dark:hover:text-white"
        >
          Add Spot
        </Link>
      </div>

      <AuthButton />
    </nav>
  );
}

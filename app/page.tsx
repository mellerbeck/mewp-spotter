import Nav from "./components/Nav";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Nav />

      <main className="flex flex-col items-center justify-center px-6 py-32 text-center text-black dark:text-zinc-50">
        <h1 className="text-4xl font-bold tracking-tight">
          MEWP Spotter
        </h1>

        <p className="mt-4 max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Spot. Snap. Share the MEWPs you see in the wild.
        </p>

        <div className="mt-8 flex gap-4">
          <a
            href="/spot"
            className="rounded-full bg-black px-6 py-3 text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
          >
            Add a MEWP Spot
          </a>

          <a
            href="/spots"
            className="rounded-full border border-zinc-200 px-6 py-3 hover:bg-black/[.04] dark:border-zinc-800 dark:hover:bg-white/[.08]"
          >
            View My Spots
          </a>
        </div>
      </main>
    </div>
  );
}

import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center gap-6 py-32 px-16 text-center bg-white dark:bg-black">
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
          MEWP Spotter
        </h1>

        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Spot. Snap. Share the MEWPs you see in the wild.
        </p>

	<button className="mt-6 rounded-full bg-black px-6 py-3 text-white hover:bg-zinc-800 dark:bg-white dark:text-black">
  Add a MEWP Spot
</button>


        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Coming soon.
        </p>
      </main>
    </div>
  );
}

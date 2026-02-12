export default function Nav() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
      <a href="/" className="font-bold">
        MEWP Spotter
      </a>
      <div className="flex gap-4 text-sm">
        <a href="/spot">Add Spot</a>
        <a href="/spots">My Spots</a>
      </div>
    </nav>
  );
}

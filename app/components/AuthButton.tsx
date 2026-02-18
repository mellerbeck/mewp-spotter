import { auth, signIn, signOut } from "@/auth";

export default async function AuthButton() {
  const session = await auth();

  if (!session) {
    return (
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/spots" });
        }}
      >
        <button className="text-sm underline text-zinc-600 dark:text-zinc-300">
          Sign in
        </button>
      </form>
    );
  }

  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button className="text-sm underline text-zinc-600 dark:text-zinc-300">
        Sign out
      </button>
    </form>
  );
}

"use server";

import { signIn, signOut } from "@/auth";

export async function signInGoogle() {
  await signIn("google", { redirectTo: "/spots" });
}

export async function signOutUser() {
  await signOut({ redirectTo: "/" });
}

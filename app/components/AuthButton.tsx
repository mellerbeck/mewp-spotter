// components/AuthButton.tsx
import { auth } from "@/auth"
import AuthButtonClient from "./AuthButtonClient"

export default async function AuthButton() {
  const session = await auth()
  return <AuthButtonClient session={session} />
}

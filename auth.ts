import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import NeonAdapter from "@auth/neon-adapter"
import { Pool } from "@neondatabase/serverless"

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  return {
    adapter: NeonAdapter(pool),

    providers: [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],

    session: {
      strategy: "database",
    },

    callbacks: {
      session({ session, user }) {
        // 🔥 This is critical
        // Makes session.user.id available everywhere
        ;(session.user as any).id = user.id
        return session
      },
    },
  }
})

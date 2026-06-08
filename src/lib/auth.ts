import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { connectDB } from "./db"
import { User } from "@/models/User"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    DiscordProvider({
      clientId: process.env.AUTH_DISCORD_ID ?? process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.AUTH_DISCORD_SECRET ?? process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify" } },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      try {
        if (account?.provider !== "discord" || !profile) return false

        const p = profile as { id: string; username: string; global_name?: string; avatar?: string }
        if (!p?.id) return false

        await connectDB()
        const existing = await User.findOne({ discordId: p.id })
        if (!existing) {
          await User.create({
            discordId: p.id,
            username: p.global_name || p.username || "Unknown",
            avatar: p.avatar ? `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png` : "",
            krwBalance: 10,
            joinedAt: new Date(),
          })
        } else {
          existing.username = p.global_name || p.username || existing.username
          existing.avatar = p.avatar ? `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png` : existing.avatar
          await existing.save()
        }
        return true
      } catch (error) {
        console.error("Sign in error:", error)
        return false
      }
    },
    async session({ session, token }) {
      if (session.user && token?.sub) {
        try {
          await connectDB()
          const user = await User.findOne({ discordId: token.sub })
          if (user) {
            session.user.id = user._id.toString()
            session.user.discordId = user.discordId
            session.user.isAdmin = user.isAdmin
            session.user.krwBalance = user.krwBalance
          }
        } catch (error) {
          console.error("Session error:", error)
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      discordId: string
      name?: string | null
      email?: string | null
      image?: string | null
      isAdmin: boolean
      krwBalance: number
    }
  }
}

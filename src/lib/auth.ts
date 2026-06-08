import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { connectDB } from "./db"
import { User } from "@/models/User"

interface DiscordProfile {
  id: string
  username: string
  global_name?: string
  avatar?: string
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify" } },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "discord" && profile) {
        const p = profile as unknown as DiscordProfile
        await connectDB()
        const existing = await User.findOne({ discordId: p.id })
        if (!existing) {
          await User.create({
            discordId: p.id,
            username: p.global_name || p.username,
            avatar: p.avatar ? `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png` : "",
            krwBalance: 10,
            joinedAt: new Date(),
          })
        } else {
          await User.updateOne(
            { discordId: p.id },
            {
              $set: {
                username: p.global_name || p.username,
                avatar: p.avatar ? `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png` : "",
              },
            }
          )
        }
        return true
      }
      return false
    },
    async session({ session, token }) {
      if (session.user) {
        await connectDB()
        const user = await User.findOne({ discordId: token.sub })
        if (user) {
          session.user.id = user._id.toString()
          session.user.discordId = user.discordId
          session.user.isAdmin = user.isAdmin
          session.user.krwBalance = user.krwBalance
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

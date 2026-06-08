import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"
import { auth } from "@/lib/auth"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminDiscordId = process.env.ADMIN_DISCORD_ID
  if (!adminDiscordId) {
    return NextResponse.json({ error: "ADMIN_DISCORD_ID not configured" }, { status: 500 })
  }

  await connectDB()
  const user = await User.findById(session.user.id)
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  if (user.discordId === adminDiscordId) {
    user.isAdmin = true
    await user.save()
    return NextResponse.json({ success: true, message: "관리자 권한이 부여되었습니다" })
  }

  return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
}

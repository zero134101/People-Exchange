import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"
import { Stock } from "@/models/Stock"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const user = await User.findById(session.user.id)
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const daysSinceJoined = (Date.now() - new Date(user.joinedAt).getTime()) / 86400000
  if (daysSinceJoined < 7) return NextResponse.json({ error: "가입 7일 이상만 상장 가능합니다" }, { status: 400 })

  const existing = await Stock.findOne({ userId: user._id })
  if (existing) return NextResponse.json({ error: "이미 상장 신청했거나 상장된 유저입니다" }, { status: 400 })

  await Stock.create({ userId: user._id })

  return NextResponse.json({ success: true, message: "상장 신청이 완료되었습니다. 관리자 승인 후 상장됩니다." })
}

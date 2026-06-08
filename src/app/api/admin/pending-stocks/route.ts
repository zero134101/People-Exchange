import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { Stock } from "@/models/Stock"
import { User } from "@/models/User"

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await connectDB()
  const stocks = await Stock.find({ status: "pending" }).lean()
  const userIds = stocks.map((s) => s.userId)
  const users = await User.find({ _id: { $in: userIds } }).lean()
  const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]))

  const result = stocks.map((s) => ({
    _id: s._id.toString(),
    userId: s.userId.toString(),
    username: userMap[s.userId.toString()]?.username || "Unknown",
    currentPrice: s.currentPrice,
    createdAt: s.createdAt,
  }))

  return NextResponse.json(result)
}

import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Stock } from "@/models/Stock"
import { User } from "@/models/User"

export async function GET() {
  await connectDB()
  const stocks = await Stock.find({ status: "listed" })
    .sort({ marketCap: -1 })
    .lean()

  const userIds = stocks.map((s) => s.userId)
  const users = await User.find({ _id: { $in: userIds } }).lean()
  const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]))

  const result = stocks.map((s) => ({
    ...s,
    _id: s._id.toString(),
    userId: s.userId.toString(),
    user: userMap[s.userId.toString()]
      ? { username: userMap[s.userId.toString()].username, discordId: userMap[s.userId.toString()].discordId }
      : null,
  }))

  return NextResponse.json(result)
}

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { Transaction } from "@/models/Transaction"
import { User } from "@/models/User"

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await connectDB()
  const txs = await Transaction.find({
    type: { $in: ["deposit", "withdraw"] },
    status: "pending",
  })
    .sort({ createdAt: -1 })
    .lean()

  const userIds = txs.map((t) => t.userId)
  const users = await User.find({ _id: { $in: userIds } }).lean()
  const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]))

  const result = txs.map((t) => ({
    _id: t._id.toString(),
    type: t.type,
    amount: t.amount,
    username: userMap[t.userId.toString()]?.username || "Unknown",
    discordId: userMap[t.userId.toString()]?.discordId || "",
    description: t.description,
    createdAt: t.createdAt,
  }))

  return NextResponse.json(result)
}

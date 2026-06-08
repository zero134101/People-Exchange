import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Stock } from "@/models/Stock"
import { User } from "@/models/User"
import { PriceHistory } from "@/models/PriceHistory"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()

  const stock = await Stock.findOne({ _id: id }).lean()
  if (!stock) return NextResponse.json({ error: "Stock not found" }, { status: 404 })

  const user = await User.findById(stock.userId).lean()
  const history = await PriceHistory.find({ stockId: stock._id })
    .sort({ recordedAt: -1 })
    .limit(168)
    .lean()

  return NextResponse.json({
    ...stock,
    _id: stock._id.toString(),
    userId: stock.userId.toString(),
    user: user ? { username: user.username, discordId: user.discordId, avatar: user.avatar, reputation: user.reputation } : null,
    history: history.reverse().map((h) => ({ price: h.price, date: h.recordedAt })),
  })
}

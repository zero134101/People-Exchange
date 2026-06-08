import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { Holding } from "@/models/Holding"
import { Stock } from "@/models/Stock"
import { User } from "@/models/User"
import { Transaction } from "@/models/Transaction"
import { calculateStockPrice } from "@/lib/price"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const holdings = await Holding.find({ userId: session.user.id }).lean()
  const stockIds = holdings.map((h) => h.stockId)
  const stocks = await Stock.find({ _id: { $in: stockIds } }).lean()
  const stockMap = Object.fromEntries(stocks.map((s) => [s._id.toString(), s]))

  const userIds = stocks.map((s) => s.userId)
  const users = await User.find({ _id: { $in: userIds } }).lean()
  const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]))

  const portfolio = await Promise.all(
    holdings.map(async (h) => {
      const sid = h.stockId.toString()
      const stock = stockMap[sid]
      const user = userMap[stock?.userId?.toString() || ""]
      const currentPrice = stock ? await calculateStockPrice(stock._id.toString()) : 0
      const invested = h.avgPrice * h.quantity
      const currentValue = currentPrice * h.quantity
      const profit = currentValue - invested
      return {
        holdingId: h._id.toString(),
        stockId: sid,
        username: user?.username || "Unknown",
        discordId: user?.discordId || "",
        quantity: h.quantity,
        avgPrice: h.avgPrice,
        currentPrice,
        invested,
        currentValue,
        profit,
        profitRate: invested > 0 ? ((profit / invested) * 100).toFixed(2) : "0",
      }
    })
  )

  const transactions = await Transaction.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()

  return NextResponse.json({ portfolio, transactions })
}

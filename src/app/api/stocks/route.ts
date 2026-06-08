import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Stock } from "@/models/Stock"
import { User } from "@/models/User"
import { PriceHistory } from "@/models/PriceHistory"
import { calculateStockPrice, getGrade } from "@/lib/price"

const UPDATE_INTERVAL = 60 * 60 * 1000

export async function GET() {
  await connectDB()

  const stocks = await Stock.find({ status: "listed" }).lean()

  const now = Date.now()
  const needsUpdate = stocks.some(
    (s) => !s.updatedAt || now - new Date(s.updatedAt).getTime() > UPDATE_INTERVAL
  )

  if (needsUpdate) {
    for (const stock of stocks) {
      const newPrice = await calculateStockPrice(stock._id.toString())
      stock.currentPrice = newPrice
      stock.marketCap = newPrice * stock.totalShares
      stock.grade = getGrade(stock.marketCap) as any

      await Stock.findByIdAndUpdate(stock._id, {
        currentPrice: newPrice,
        marketCap: newPrice * stock.totalShares,
        grade: getGrade(newPrice * stock.totalShares),
      })

      await PriceHistory.create({
        stockId: stock._id,
        price: newPrice,
        recordedAt: new Date(),
      })
    }
  }

  const userIds = stocks.map((s) => s.userId)
  const users = await User.find({ _id: { $in: userIds } }).lean()
  const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]))

  const result = stocks.map((s) => ({
    _id: s._id.toString(),
    userId: s.userId.toString(),
    currentPrice: s.currentPrice,
    marketCap: s.marketCap,
    totalShares: s.totalShares,
    grade: s.grade,
    updatedAt: s.updatedAt,
    user: userMap[s.userId.toString()]
      ? {
          username: userMap[s.userId.toString()].username,
          discordId: userMap[s.userId.toString()].discordId,
        }
      : null,
  }))

  return NextResponse.json(result)
}

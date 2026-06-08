import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { PriceHistory } from "@/models/PriceHistory"
import { Stock } from "@/models/Stock"
import { User } from "@/models/User"

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await connectDB()
  const twoHoursAgo = new Date(Date.now() - 7200000)

  const recentPrices = await PriceHistory.find({ recordedAt: { $gte: twoHoursAgo } })
    .sort({ recordedAt: -1 })
    .lean()

  const priceMap: Record<string, number[]> = {}
  for (const p of recentPrices) {
    const sid = p.stockId.toString()
    if (!priceMap[sid]) priceMap[sid] = []
    priceMap[sid].push(p.price)
  }

  const suspicious: { stockId: string; username: string; change: number }[] = []
  for (const [sid, prices] of Object.entries(priceMap)) {
    if (prices.length < 2) continue
    const first = prices[prices.length - 1]
    const last = prices[0]
    const change = first > 0 ? ((last - first) / first) * 100 : 0
    if (Math.abs(change) > 30) {
      const stock = await Stock.findById(sid).lean()
      const user = stock ? await User.findById(stock.userId).lean() : null
      suspicious.push({
        stockId: sid,
        username: user?.username || "Unknown",
        change: Math.round(change * 100) / 100,
      })
    }
  }

  return NextResponse.json(suspicious)
}

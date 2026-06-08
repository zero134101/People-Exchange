import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Stock } from "@/models/Stock"
import { User } from "@/models/User"
import { ActivityLog } from "@/models/ActivityLog"
import { PriceHistory } from "@/models/PriceHistory"
import { ExchangeRate } from "@/models/ExchangeRate"
import { News } from "@/models/News"
import { calculateStockPrice, getGrade } from "@/lib/price"

export const maxDuration = 300
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || process.env.BOT_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()
  const stocks = await Stock.find({ status: "listed" })
  const newsEntries: { title: string; content: string; type: string; relatedUserIds: string[] }[] = []

  for (const stock of stocks) {
    const user = await User.findById(stock.userId)
    if (!user) continue

    const oldPrice = stock.currentPrice
    const newPrice = await calculateStockPrice(stock._id.toString())

    stock.currentPrice = newPrice
    stock.marketCap = newPrice * stock.totalShares
    stock.grade = getGrade(stock.marketCap) as any

    const recentLogs = await ActivityLog.find({
      userId: stock.userId,
      date: { $gte: getDaysAgo(7) },
    })

    if (recentLogs.length > 0) {
      stock.activityMetrics = {
        messages: recentLogs.reduce((s, l) => s + l.messages, 0),
        voice: recentLogs.reduce((s, l) => s + l.voiceMinutes, 0),
        attendance: recentLogs.filter((l) => l.attendance).length,
        events: recentLogs.reduce((s, l) => s + l.events, 0),
        contribution: recentLogs.reduce((s, l) => s + l.contribution, 0),
        referrals: recentLogs.reduce((s, l) => s + l.referrals, 0),
      }
    }

    await stock.save()
    await PriceHistory.create({ stockId: stock._id, price: newPrice, recordedAt: new Date() })

    const changeRate = oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : 0
    if (Math.abs(changeRate) > 20) {
      newsEntries.push({
        title: `${user.username} 주가 ${changeRate > 0 ? "급등" : "급락"}!`,
        content: `${user.username}의 주가가 ${Math.abs(changeRate).toFixed(1)}% ${changeRate > 0 ? "상승" : "하락"}하여 ${newPrice.toLocaleString()} KRW`,
        type: changeRate > 0 ? "activity_surge" : "inactive",
        relatedUserIds: [stock.userId.toString()],
      })
    }
  }

  for (const n of newsEntries) {
    await News.create(n as any)
  }

  return NextResponse.json({ success: true, updated: stocks.length, newsGenerated: newsEntries.length })
}

function getDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

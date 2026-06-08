import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { Stock } from "@/models/Stock"
import { User } from "@/models/User"
import { ExchangeRate } from "@/models/ExchangeRate"
import { News } from "@/models/News"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { stockId } = await req.json()
  await connectDB()

  const stock = await Stock.findById(stockId)
  if (!stock) return NextResponse.json({ error: "Stock not found" }, { status: 404 })

  const rates = await ExchangeRate.findOne().sort({ createdAt: -1 })
  const basePrice = rates?.basePrice || 1000

  stock.status = "listed"
  stock.currentPrice = basePrice
  stock.listedAt = new Date()
  await stock.save()

  const user = await User.findById(stock.userId)
  if (user) {
    user.isListed = true
    await user.save()
  }

  await News.create({
    title: `${user?.username || "Unknown"} 유저 상장`,
    content: `${user?.username || "Unknown"}님이 People Exchange에 상장되었습니다! 초기 주가: ${basePrice} KRW`,
    type: "ipo",
    relatedUserIds: [stock.userId],
  })

  return NextResponse.json({ success: true })
}

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"
import { Stock } from "@/models/Stock"
import { Holding } from "@/models/Holding"
import { Transaction } from "@/models/Transaction"
import { calculateStockPrice } from "@/lib/price"
import { FEE_RATE } from "@/lib/constants"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { stockId, quantity } = await req.json()
  if (!stockId || !quantity || quantity <= 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  await connectDB()
  const seller = await User.findById(session.user.id)
  if (!seller) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const holding = await Holding.findOne({ userId: seller._id, stockId })
  if (!holding || holding.quantity < quantity) {
    return NextResponse.json({ error: "보유 주식이 부족합니다" }, { status: 400 })
  }

  const stock = await Stock.findById(stockId)
  if (!stock) return NextResponse.json({ error: "Stock not found" }, { status: 404 })

  const price = await calculateStockPrice(stockId)
  const totalValue = quantity * price
  const fee = Math.round(totalValue * FEE_RATE)
  const netValue = totalValue - fee

  holding.quantity -= quantity
  if (holding.quantity === 0) {
    await Holding.deleteOne({ _id: holding._id })
  } else {
    await holding.save()
  }

  seller.krwBalance += netValue
  await seller.save()

  await Transaction.create({
    type: "sell", userId: seller._id, stockId: stock._id,
    amount: quantity, price, fee, status: "completed",
    description: `${stock._id} ${quantity}주 매도 (1주당 ${price} KRW)`,
  })

  return NextResponse.json({
    success: true, quantity, price, fee, netValue,
    balance: seller.krwBalance,
  })
}

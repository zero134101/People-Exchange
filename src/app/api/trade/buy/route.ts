import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"
import { Stock } from "@/models/Stock"
import { Holding } from "@/models/Holding"
import { Transaction } from "@/models/Transaction"
import { calculateStockPrice } from "@/lib/price"

const FEE_RATE = 0.005

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { stockId, amount } = await req.json()
  if (!stockId || !amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  await connectDB()
  const buyer = await User.findById(session.user.id)
  if (!buyer) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const stock = await Stock.findById(stockId)
  if (!stock || stock.status !== "listed") return NextResponse.json({ error: "Stock not available" }, { status: 404 })

  const price = await calculateStockPrice(stockId)
  const totalCost = amount * price
  const fee = Math.round(totalCost * FEE_RATE)
  const totalWithFee = totalCost + fee

  if (buyer.krwBalance < totalWithFee) {
    return NextResponse.json({ error: "잔액이 부족합니다" }, { status: 400 })
  }

  const sharesAvailable = stock.totalShares
  const totalBought = await Holding.aggregate([
    { $match: { stockId: stock._id } },
    { $group: { _id: null, total: { $sum: "$quantity" } } },
  ])
  const boughtSoFar = totalBought[0]?.total || 0
  if (boughtSoFar + amount > sharesAvailable) {
    return NextResponse.json({ error: "발행 주식 수를 초과했습니다" }, { status: 400 })
  }

  let holding = await Holding.findOne({ userId: buyer._id, stockId: stock._id })
  if (holding) {
    const totalQty = holding.quantity + amount
    const totalValue = holding.avgPrice * holding.quantity + price * amount
    holding.avgPrice = Math.round(totalValue / totalQty)
    holding.quantity = totalQty
  } else {
    holding = new Holding({ userId: buyer._id, stockId: stock._id, quantity: amount, avgPrice: price })
  }
  await holding.save()

  buyer.krwBalance -= totalWithFee
  await buyer.save()

  await Transaction.create({
    type: "buy", userId: buyer._id, stockId: stock._id,
    amount, price, fee, status: "completed",
    description: `${stock._id} ${amount}주 매수 (1주당 ${price} KRW)`,
  })

  return NextResponse.json({
    success: true,
    quantity: amount,
    price,
    fee,
    totalCost: totalWithFee,
    balance: buyer.krwBalance,
  })
}

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"
import { Transaction } from "@/models/Transaction"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { amount } = await req.json()
  if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 })

  await connectDB()
  const user = await User.findById(session.user.id)
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  if (user.krwBalance < amount) return NextResponse.json({ error: "잔액 부족" }, { status: 400 })

  if (!user.bankAccount?.bank || !user.bankAccount?.number || !user.bankAccount?.holder) {
    return NextResponse.json({ error: "출금 계좌 정보를 먼저 등록해주세요" }, { status: 400 })
  }

  await Transaction.create({
    type: "withdraw",
    userId: user._id,
    amount,
    price: 0,
    fee: 0,
    status: "pending",
    description: `출금 요청: ${amount} KRW → ${user.bankAccount.bank} ${user.bankAccount.number}`,
  })

  return NextResponse.json({
    success: true,
    message: "출금 요청이 접수되었습니다. 관리자가 확인 후 처리합니다.",
  })
}

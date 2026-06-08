import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { Transaction } from "@/models/Transaction"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { amount, bankAccount } = await req.json()
  if (!amount || amount <= 0 || !bankAccount?.bank || !bankAccount?.number || !bankAccount?.holder) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  await connectDB()
  const tx = await Transaction.create({
    type: "deposit",
    userId: session.user.id,
    amount,
    price: 0,
    fee: 0,
    status: "pending",
    description: `입금 요청: ${amount} KRW (${bankAccount.bank} ${bankAccount.number} ${bankAccount.holder})`,
  })

  return NextResponse.json({
    success: true,
    message: "입금 요청이 접수되었습니다. 관리자가 확인 후 처리합니다.",
    transactionId: tx._id,
    bankAccount: {
      bank: "신한은행",
      number: "110-123-456789",
      holder: "PEOPLE EXCHANGE",
    },
  })
}

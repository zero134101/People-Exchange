import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { Transaction } from "@/models/Transaction"
import { User } from "@/models/User"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { transactionId, action } = await req.json()
  await connectDB()

  const tx = await Transaction.findById(transactionId)
  if (!tx || tx.status !== "pending") return NextResponse.json({ error: "Invalid transaction" }, { status: 400 })

  if (action === "approve") {
    tx.status = "completed"
    if (tx.type === "deposit") {
      await User.findByIdAndUpdate(tx.userId, { $inc: { krwBalance: tx.amount } })
    }
  } else if (action === "reject") {
    tx.status = "cancelled"
  }

  await tx.save()
  return NextResponse.json({ success: true })
}

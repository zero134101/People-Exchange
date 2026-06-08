import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { ExchangeRate } from "@/models/ExchangeRate"
import { User } from "@/models/User"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await connectDB()

  const existing = await ExchangeRate.findOne().sort({ createdAt: -1 })
  if (!existing) {
    await ExchangeRate.create({
      messageWeight: 0.2,
      voiceWeight: 0.2,
      attendanceWeight: 0.2,
      eventWeight: 0.15,
      contributionWeight: 0.1,
      referralWeight: 0.1,
      reputationWeight: 0.05,
      basePrice: 1000,
      dividendRate: 0.2,
    })
  }

  return NextResponse.json({ success: true, message: "Exchange rates seeded" })
}

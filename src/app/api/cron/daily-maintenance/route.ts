import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { ActivityLog } from "@/models/ActivityLog"
import { User } from "@/models/User"
import { DAILY_ATTENDANCE_REWARD } from "@/lib/constants"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()
  const today = new Date().toISOString().slice(0, 10)

  const activeUsers = await ActivityLog.find({ date: today, messages: { $gt: 0 } })
  for (const log of activeUsers) {
    log.attendance = true
    await log.save()
  }

  for (const log of activeUsers) {
    const user = await User.findOne({ discordId: log.discordId })
    if (user) {
      user.krwBalance += DAILY_ATTENDANCE_REWARD
      await user.save()
    }
  }

  return NextResponse.json({
    success: true,
    attendanceMarked: activeUsers.length,
  })
}

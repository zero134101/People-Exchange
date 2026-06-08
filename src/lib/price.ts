import { connectDB } from "./db"
import { ExchangeRate } from "@/models/ExchangeRate"
import { Stock } from "@/models/Stock"
import { User } from "@/models/User"
import { ActivityLog } from "@/models/ActivityLog"

const WEIGHTS = {
  message: 0.2,
  voice: 0.2,
  attendance: 0.2,
  events: 0.15,
  contribution: 0.1,
  referrals: 0.1,
  reputation: 0.05,
}

export async function calculateStockPrice(stockId: string): Promise<number> {
  await connectDB()

  const stock = await Stock.findById(stockId)
  if (!stock) return 0

  const user = await User.findById(stock.userId)
  if (!user) return 0

  const rates = await ExchangeRate.findOne().sort({ createdAt: -1 })

  const w = {
    message: rates?.messageWeight ?? WEIGHTS.message,
    voice: rates?.voiceWeight ?? WEIGHTS.voice,
    attendance: rates?.attendanceWeight ?? WEIGHTS.attendance,
    events: rates?.eventWeight ?? WEIGHTS.events,
    contribution: rates?.contributionWeight ?? WEIGHTS.contribution,
    referrals: rates?.referralWeight ?? WEIGHTS.referrals,
    reputation: rates?.reputationWeight ?? WEIGHTS.reputation,
    basePrice: rates?.basePrice ?? 1000,
  }

  const metrics = stock.activityMetrics
  const today = new Date().toISOString().slice(0, 10)

  const recentLogs = await ActivityLog.find({
    userId: stock.userId,
    date: { $gte: getDaysAgo(7), $lte: today },
  })

  const avgMessages = average(recentLogs.map((l) => l.messages))
  const avgVoice = average(recentLogs.map((l) => l.voiceMinutes))
  const attendanceRate = recentLogs.length > 0
    ? recentLogs.filter((l) => l.attendance).length / recentLogs.length
    : 0
  const totalEvents = recentLogs.reduce((s, l) => s + l.events, 0)
  const totalContribution = recentLogs.reduce((s, l) => s + l.contribution, 0)
  const totalReferrals = recentLogs.reduce((s, l) => s + l.referrals, 0)

  const score =
    avgMessages * w.message +
    avgVoice * w.voice +
    attendanceRate * 100 * w.attendance +
    totalEvents * w.events +
    totalContribution * w.contribution +
    totalReferrals * w.referrals +
    user.reputation * w.reputation

  return Math.round(w.basePrice + score)
}

function getDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function average(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

export function getGrade(marketCap: number): string {
  if (marketCap >= 10_000_000) return "diamond"
  if (marketCap >= 5_000_000) return "platinum"
  if (marketCap >= 1_000_000) return "gold"
  if (marketCap >= 500_000) return "silver"
  return "bronze"
}

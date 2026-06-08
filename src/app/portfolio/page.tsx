"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, ArrowLeft, Wallet } from "lucide-react"

interface PortfolioItem {
  holdingId: string
  stockId: string
  username: string
  discordId: string
  quantity: number
  avgPrice: number
  currentPrice: number
  invested: number
  currentValue: number
  profit: number
  profitRate: string
}

export default function PortfolioPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status !== "authenticated") return
    fetch("/api/portfolio").then((r) => r.json()).then((data) => {
      setPortfolio(data.portfolio || [])
    }).finally(() => setLoading(false))
  }, [status, router])

  if (status === "loading" || loading) return <div className="text-center py-12 text-muted-foreground">로딩 중...</div>

  const totalInvested = portfolio.reduce((s, i) => s + i.invested, 0)
  const totalValue = portfolio.reduce((s, i) => s + i.currentValue, 0)
  const totalProfit = totalValue - totalInvested

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold">내 포트폴리오</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">총 투자금액</p>
              <p className="text-2xl font-bold font-mono">{totalInvested.toLocaleString()} KRW</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">평가금액</p>
              <p className="text-2xl font-bold font-mono">{totalValue.toLocaleString()} KRW</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">총 손익</p>
              <p className={`text-2xl font-bold font-mono ${totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                {totalProfit >= 0 ? "+" : ""}{totalProfit.toLocaleString()} KRW
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">보유 현금</p>
              <p className="text-2xl font-bold font-mono text-blue-400">
                {session?.user?.krwBalance?.toLocaleString() || 0} KRW
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {portfolio.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">보유한 주식이 없습니다</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {portfolio.map((item) => (
            <Link key={item.holdingId} href={`/stocks/${item.stockId}`}>
              <Card className="hover:border-green-500/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.username}</p>
                      <p className="text-sm text-muted-foreground">{item.quantity}주 보유</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold">{item.currentValue.toLocaleString()} KRW</p>
                      <p className={`text-sm font-mono ${item.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {item.profit >= 0 ? "+" : ""}{item.profit.toLocaleString()} ({item.profitRate}%)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

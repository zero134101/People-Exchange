"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Trophy, Medal, TrendingUp } from "lucide-react"
import type { IStock, IUser } from "@/types"
import { useRouter } from "next/navigation"

const gradeVariant: Record<string, "bronze" | "silver" | "gold" | "platinum" | "diamond"> = {
  bronze: "bronze", silver: "silver", gold: "gold", platinum: "platinum", diamond: "diamond",
}

const rankIcons = ["🥇", "🥈", "🥉"]

export default function RankingPage() {
  const router = useRouter()
  const [stocks, setStocks] = useState<(IStock & { user?: IUser })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stocks").then((r) => r.json()).then((data) => {
      setStocks(data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12 text-muted-foreground">로딩 중...</div>

  const marketCapRanking = [...stocks].sort((a, b) => b.marketCap - a.marketCap)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="h-6 w-6 text-yellow-500" />랭킹</h1>
      </div>

      <Tabs defaultValue="marketcap">
        <TabsList>
          <TabsTrigger value="marketcap"><TrendingUp className="h-4 w-4 mr-1" />시가총액</TabsTrigger>
        </TabsList>
        <TabsContent value="marketcap" className="space-y-3">
          {marketCapRanking.map((stock, i) => (
            <Link key={stock._id} href={`/stocks/${stock.userId}`}>
              <Card className="hover:border-green-500/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 text-center text-lg">
                      {i < 3 ? rankIcons[i] : <span className="text-muted-foreground font-mono">#{i + 1}</span>}
                    </div>
                    <div>
                      <p className="font-medium">{stock.user?.username || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{stock.user?.discordId || ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={gradeVariant[stock.grade] || "outline"} className="text-[10px]">
                      {stock.grade?.toUpperCase()}
                    </Badge>
                    <div className="text-right">
                      <p className="font-mono font-bold">{stock.marketCap?.toLocaleString()} KRW</p>
                      <p className="text-xs text-muted-foreground">1주 {stock.currentPrice?.toLocaleString()} KRW</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

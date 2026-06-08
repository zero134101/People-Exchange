"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Newspaper, ArrowRight, Users, BarChart3 } from "lucide-react"
import type { IStock, IUser, INewsDoc } from "@/types"

export default function HomePage() {
  const { data: session } = useSession()
  const [stocks, setStocks] = useState<(IStock & { user?: IUser })[]>([])
  const [news, setNews] = useState<INewsDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [stocksRes, newsRes] = await Promise.all([
          fetch("/api/stocks"),
          fetch("/api/news"),
        ])
        if (stocksRes.ok) setStocks(await stocksRes.json())
        if (newsRes.ok) setNews(await newsRes.json())
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const gradeVariant: Record<string, "bronze" | "silver" | "gold" | "platinum" | "diamond"> = {
    bronze: "bronze", silver: "silver", gold: "gold", platinum: "platinum", diamond: "diamond",
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">People Exchange</h1>
        <p className="text-muted-foreground">
          디스코드 서버의 활동량이 곧 기업 가치입니다. 유저에게 투자하고 배당을 받아보세요.
        </p>
        {!session && (
          <div>
            <Link href="/api/auth/signin">
              <Button size="lg" className="gap-2">
                <Users className="h-5 w-5" /> Discord로 시작하기
              </Button>
            </Link>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2"><BarChart3 className="h-5 w-5" />실시간 인기 종목</h2>
          <Link href="/ranking"><Button variant="ghost" size="sm" className="gap-1">전체보기 <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-32" /></Card>)}
          </div>
        ) : stocks.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">상장된 종목이 없습니다</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks.slice(0, 6).map((stock) => (
              <Link key={stock._id} href={`/stocks/${stock._id}`}>
                <Card className="hover:border-green-500/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center text-sm font-bold text-green-400">
                          {(stock.user?.username || "?")[0]}
                        </div>
                        <span className="font-medium">{stock.user?.username || "Unknown"}</span>
                      </div>
                      <Badge variant={gradeVariant[stock.grade] || "outline"} className="text-[10px]">
                        {stock.grade.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className="text-2xl font-bold font-mono">{stock.currentPrice.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">KRW</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono">{stock.marketCap.toLocaleString()} KRW</p>
                        <p className="text-xs text-muted-foreground">시가총액</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Newspaper className="h-5 w-5" />실시간 뉴스</h2>
          <Link href="/news"><Button variant="ghost" size="sm" className="gap-1">전체보기 <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
        {news.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">뉴스가 없습니다</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {news.slice(0, 5).map((item) => (
              <Card key={item._id}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`mt-1 p-1.5 rounded-full ${item.type === 'activity_surge' ? 'bg-green-900/30' : item.type === 'inactive' ? 'bg-red-900/30' : 'bg-blue-900/30'}`}>
                    {item.type === 'activity_surge' ? <TrendingUp className="h-4 w-4 text-green-400" /> :
                     item.type === 'inactive' ? <TrendingDown className="h-4 w-4 text-red-400" /> :
                     <Newspaper className="h-4 w-4 text-blue-400" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(item.createdAt || "").toLocaleString("ko-KR")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

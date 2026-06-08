"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, TrendingUp, TrendingDown, Activity, MessageCircle, Mic, Calendar, Award, Users, Star } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface StockDetail {
  _id: string
  userId: string
  currentPrice: number
  marketCap: number
  totalShares: number
  grade: string
  status: string
  activityMetrics: {
    messages: number
    voice: number
    attendance: number
    events: number
    contribution: number
    referrals: number
  }
  user: { username: string; discordId: string; avatar: string; reputation: number } | null
  history: { price: number; date: string }[]
}

const gradeVariant: Record<string, "bronze" | "silver" | "gold" | "platinum" | "diamond"> = {
  bronze: "bronze", silver: "silver", gold: "gold", platinum: "platinum", diamond: "diamond",
}

export default function StockDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [stock, setStock] = useState<StockDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [buyAmount, setBuyAmount] = useState("")
  const [sellAmount, setSellAmount] = useState("")
  const [tradeMsg, setTradeMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetch(`/api/stocks/${params.userId}`)
      .then((r) => r.json())
      .then((data) => { setStock(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.userId])

  const handleBuy = async () => {
    if (!session) return router.push("/login")
    if (!buyAmount || Number(buyAmount) <= 0) return
    setTradeMsg(null)
    const res = await fetch("/api/trade/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockId: stock?._id, amount: Number(buyAmount) }),
    })
    const data = await res.json()
    if (res.ok) {
      setTradeMsg({ type: "success", text: `${data.quantity}주 매수 완료! (수수료: ${data.fee} KRW)` })
      setBuyAmount("")
    } else {
      setTradeMsg({ type: "error", text: data.error })
    }
  }

  const handleSell = async () => {
    if (!session) return router.push("/login")
    if (!sellAmount || Number(sellAmount) <= 0) return
    setTradeMsg(null)
    const res = await fetch("/api/trade/sell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockId: stock?._id, quantity: Number(sellAmount) }),
    })
    const data = await res.json()
    if (res.ok) {
      setTradeMsg({ type: "success", text: `${data.quantity}주 매도 완료! (수수료: ${data.fee} KRW)` })
      setSellAmount("")
    } else {
      setTradeMsg({ type: "error", text: data.error })
    }
  }

  if (loading) return <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
  if (!stock) return <div className="text-center py-12 text-muted-foreground">종목을 찾을 수 없습니다</div>

  const metrics = [
    { label: "메시지", value: stock.activityMetrics?.messages || 0, icon: MessageCircle },
    { label: "음성활동", value: `${stock.activityMetrics?.voice || 0}분`, icon: Mic },
    { label: "출석률", value: `${(stock.activityMetrics?.attendance || 0)}%`, icon: Calendar },
    { label: "이벤트", value: stock.activityMetrics?.events || 0, icon: Award },
    { label: "기여도", value: stock.activityMetrics?.contribution || 0, icon: Users },
    { label: "추천", value: stock.activityMetrics?.referrals || 0, icon: Star },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center text-lg font-bold text-green-400">
            {stock.user?.username?.[0] || "?"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{stock.user?.username || "Unknown"}</h1>
            <p className="text-xs text-muted-foreground font-mono">{stock.user?.discordId || ""}</p>
          </div>
        </div>
        <Badge variant={gradeVariant[stock.grade] || "outline"}>{stock.grade?.toUpperCase()}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">현재가</p>
                  <p className="text-4xl font-bold font-mono">{stock.currentPrice?.toLocaleString()} KRW</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">시가총액</p>
                  <p className="text-xl font-mono">{stock.marketCap?.toLocaleString()} KRW</p>
                  <p className="text-xs text-muted-foreground">발행주식 {stock.totalShares?.toLocaleString()}주</p>
                </div>
              </div>
              {stock.history && stock.history.length > 0 && (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stock.history}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => new Date(v).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })} />
                      <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v.toLocaleString()}`} />
                      <Tooltip contentStyle={{ background: "#14141a", border: "1px solid #1e293b", borderRadius: "8px" }} labelFormatter={(v) => new Date(v).toLocaleString("ko-KR")} formatter={(v) => [`${Number(v).toLocaleString()} KRW`, "가격"]} />
                      <Line type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />활동 지표</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {metrics.map((m) => (
                  <div key={m.label} className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <m.icon className="h-4 w-4" /> {m.label}
                    </div>
                    <p className="text-xl font-bold">{typeof m.value === "number" ? m.value.toLocaleString() : m.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>매수</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input type="number" placeholder="주식 수" value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} min="1" />
              {stock && (
                <p className="text-xs text-muted-foreground">
                  예상 금액: {(Number(buyAmount) * (stock.currentPrice || 0) * 1.005).toLocaleString()} KRW (수수료 0.5% 포함)
                </p>
              )}
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleBuy} disabled={!session}>매수</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>매도</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input type="number" placeholder="주식 수" value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} min="1" />
              {stock && (
                <p className="text-xs text-muted-foreground">
                  예상 금액: {(Number(sellAmount) * (stock.currentPrice || 0) * 0.995).toLocaleString()} KRW (수수료 0.5% 차감)
                </p>
              )}
              <Button className="w-full" variant="outline" onClick={handleSell} disabled={!session}>매도</Button>
            </CardContent>
          </Card>

          {tradeMsg && (
            <div className={`p-3 rounded-lg text-sm ${tradeMsg.type === "success" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
              {tradeMsg.text}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

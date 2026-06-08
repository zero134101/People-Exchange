"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, TrendingDown, Newspaper, Rocket, AlertTriangle } from "lucide-react"
import type { INewsDoc } from "@/types"

export default function NewsPage() {
  const router = useRouter()
  const [news, setNews] = useState<INewsDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/news").then((r) => r.json()).then(setNews).finally(() => setLoading(false))
  }, [])

  const typeIcon: Record<string, React.ReactNode> = {
    activity_surge: <TrendingUp className="h-4 w-4 text-green-400" />,
    inactive: <AlertTriangle className="h-4 w-4 text-red-400" />,
    event_win: <TrendingUp className="h-4 w-4 text-yellow-400" />,
    ipo: <Rocket className="h-4 w-4 text-blue-400" />,
    general: <Newspaper className="h-4 w-4 text-muted-foreground" />,
  }

  const typeColor: Record<string, string> = {
    activity_surge: "bg-green-900/30", inactive: "bg-red-900/30",
    event_win: "bg-yellow-900/30", ipo: "bg-blue-900/30", general: "bg-muted",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Newspaper className="h-6 w-6" />뉴스</h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
      ) : news.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">뉴스가 없습니다</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {news.map((item) => (
            <Card key={item._id}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`mt-1 p-1.5 rounded-full ${typeColor[item.type] || "bg-muted"}`}>
                  {typeIcon[item.type] || <Newspaper className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{item.title}</p>
                    <Badge variant="outline" className="text-[9px]">{item.type.replace("_", " ")}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(item.createdAt || "").toLocaleString("ko-KR")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

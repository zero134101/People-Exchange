"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, AlertTriangle } from "lucide-react"

interface SuspiciousActivity {
  stockId: string
  username: string
  change: number
}

export default function AdminReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activities, setActivities] = useState<SuspiciousActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status !== "authenticated" || !session?.user?.isAdmin) return
    fetch("/api/admin/suspicious-activities").then((r) => r.json()).then(setActivities).finally(() => setLoading(false))
  }, [status, session, router])

  if (status !== "authenticated" || !session?.user?.isAdmin) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin")}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-red-400" />시세 조작 탐지</h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
      ) : activities.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">의심되는 활동이 없습니다</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {activities.map((a, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{a.username}</p>
                  <p className="text-xs text-muted-foreground">Stock ID: {a.stockId}</p>
                </div>
                <div className="text-right">
                  <Badge variant="destructive" className="text-sm">
                    {a.change > 0 ? "+" : ""}{a.change}%
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">2시간 내 변동</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

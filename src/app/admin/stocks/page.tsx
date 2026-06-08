"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"

interface PendingStock {
  _id: string
  userId: string
  username: string
  currentPrice: number
  createdAt: string
}

export default function AdminStocksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pending, setPending] = useState<PendingStock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status !== "authenticated" || !session?.user?.isAdmin) return
    fetch("/api/admin/pending-stocks").then((r) => r.json()).then(setPending).finally(() => setLoading(false))
  }, [status, session, router])

  const handleAction = async (stockId: string, action: "approve" | "reject") => {
    const res = await fetch(`/api/admin/${action === "approve" ? "approve-stock" : "reject-stock"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockId }),
    })
    if (res.ok) setPending((prev) => prev.filter((s) => s._id !== stockId))
  }

  if (status !== "authenticated" || !session?.user?.isAdmin) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin")}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold">상장 승인</h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
      ) : pending.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">대기 중인 상장 신청이 없습니다</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {pending.map((stock) => (
            <Card key={stock._id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{stock.username}</p>
                  <p className="text-xs text-muted-foreground">신청일: {new Date(stock.createdAt).toLocaleString("ko-KR")}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1" onClick={() => handleAction(stock._id, "approve")}>
                    <CheckCircle className="h-4 w-4" /> 승인
                  </Button>
                  <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleAction(stock._id, "reject")}>
                    <XCircle className="h-4 w-4" /> 거절
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

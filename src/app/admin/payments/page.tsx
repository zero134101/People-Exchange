"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"

interface PaymentRequest {
  _id: string
  type: "deposit" | "withdraw"
  amount: number
  username: string
  discordId: string
  description: string
  createdAt: string
}

export default function AdminPaymentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status !== "authenticated" || !session?.user?.isAdmin) return
    fetch("/api/admin/payment-requests").then((r) => r.json()).then(setRequests).finally(() => setLoading(false))
  }, [status, session, router])

  const handleAction = async (txId: string, action: "approve" | "reject") => {
    const res = await fetch("/api/admin/process-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId: txId, action }),
    })
    if (res.ok) setRequests((prev) => prev.filter((r) => r._id !== txId))
  }

  if (status !== "authenticated" || !session?.user?.isAdmin) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin")}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold">입출금 처리</h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
      ) : requests.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">처리 대기 중인 요청이 없습니다</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req._id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{req.username}</p>
                      <Badge variant={req.type === "deposit" ? "default" : "secondary"} className="text-[9px]">
                        {req.type === "deposit" ? "입금" : "출금"}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold font-mono">{req.amount.toLocaleString()} KRW</p>
                    <p className="text-xs text-muted-foreground">{req.description}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(req.createdAt).toLocaleString("ko-KR")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1" onClick={() => handleAction(req._id, "approve")}>
                      <CheckCircle className="h-4 w-4" /> 승인
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleAction(req._id, "reject")}>
                      <XCircle className="h-4 w-4" /> 거절
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

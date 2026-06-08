"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Wallet } from "lucide-react"

export default function WithdrawPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  if (status === "unauthenticated") { router.push("/login"); return null }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return
    setSubmitting(true)
    setMessage(null)
    try {
      const res = await fetch("/api/payment/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) }),
      })
      const data = await res.json()
      setMessage({ type: res.ok ? "success" : "error", text: data.error || data.message })
    } catch {
      setMessage({ type: "error", text: "서버 오류" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Wallet className="h-6 w-6 text-blue-500" />KRW 출금</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>출금 신청</CardTitle>
          <CardDescription>
            보유 KRW를 출금 신청합니다. 보유 잔고: {session?.user?.krwBalance?.toLocaleString() || 0} KRW
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>출금할 KRW</Label>
              <Input
                type="number"
                placeholder="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
                max={session?.user?.krwBalance || 0}
              />
            </div>
            <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground">
              출금 계좌는 Discord 봇 명령어 /계좌등록 으로 설정할 수 있습니다.
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "처리 중..." : "출금 신청"}
            </Button>
          </form>
          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
              {message.text}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

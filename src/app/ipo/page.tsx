"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Rocket, Info } from "lucide-react"

export default function IPOPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [applying, setApplying] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleApply = async () => {
    if (!session) return router.push("/login")
    setApplying(true)
    setMessage(null)
    try {
      const res = await fetch("/api/stocks/apply", { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: "success", text: data.message })
      } else {
        setMessage({ type: "error", text: data.error })
      }
    } catch {
      setMessage({ type: "error", text: "서버 오류가 발생했습니다" })
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Rocket className="h-6 w-6 text-green-500" />IPO</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>상장 신청</CardTitle>
          <CardDescription>나를 주식으로 상장하고 투자받아보세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
            <div className="flex items-start gap-2"><Info className="h-4 w-4 mt-0.5 text-blue-400" /><span>디스코드 가입 7일 이상</span></div>
            <div className="flex items-start gap-2"><Info className="h-4 w-4 mt-0.5 text-blue-400" /><span>본인 동의 후 상장 가능</span></div>
            <div className="flex items-start gap-2"><Info className="h-4 w-4 mt-0.5 text-blue-400" /><span>비공개 상장 옵션 지원</span></div>
            <div className="flex items-start gap-2"><Info className="h-4 w-4 mt-0.5 text-blue-400" /><span>관리자 승인 후 상장</span></div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApply} disabled={applying || !session}>
              {applying ? "처리 중..." : "상장 신청하기"}
            </Button>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
              {message.text}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

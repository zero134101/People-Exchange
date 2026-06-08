"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Wallet, Copy, Check } from "lucide-react"

export default function DepositPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [bank, setBank] = useState("")
  const [accountNum, setAccountNum] = useState("")
  const [holder, setHolder] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ message: string; bankInfo?: { bank: string; number: string; holder: string } } | null>(null)
  const [copied, setCopied] = useState(false)

  if (status === "unauthenticated") { router.push("/login"); return null }

  const bankInfo = { bank: "신한은행", number: "110-123-456789", holder: "PEOPLE EXCHANGE" }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/payment/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          bankAccount: { bank, number: accountNum, holder },
        }),
      })
      const data = await res.json()
      if (res.ok) setResult({ message: data.message, bankInfo: data.bankAccount })
      else setResult({ message: data.error })
    } catch {
      setResult({ message: "서버 오류" })
    } finally {
      setSubmitting(false)
    }
  }

  const copyAccount = () => {
    navigator.clipboard.writeText(`${bankInfo.bank} ${bankInfo.number} ${bankInfo.holder}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Wallet className="h-6 w-6 text-green-500" />KRW 충전</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>입금 계좌 정보</CardTitle>
          <CardDescription>아래 계좌로 입금 후 신청서를 제출해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{bankInfo.bank}</p>
                <p className="text-lg font-bold font-mono">{bankInfo.number}</p>
                <p className="text-sm text-muted-foreground">{bankInfo.holder}</p>
              </div>
              <Button variant="outline" size="sm" onClick={copyAccount} className="gap-1">
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                {copied ? "복사됨" : "복사"}
              </Button>
            </div>
          </div>

          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>충전할 KRW</Label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label>입금자명</Label>
                <Input placeholder="홍길동" value={holder} onChange={(e) => setHolder(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>은행</Label>
                  <Input placeholder="국민은행" value={bank} onChange={(e) => setBank(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>계좌번호</Label>
                  <Input placeholder="123456789012" value={accountNum} onChange={(e) => setAccountNum(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "처리 중..." : "입금 신청"}
              </Button>
            </form>
          ) : (
            <div className="bg-green-900/30 text-green-400 p-4 rounded-lg text-sm">
              {result.message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Shield, CheckCircle, Users, Wallet, AlertTriangle, ClipboardList } from "lucide-react"

const adminLinks = [
  { href: "/admin/stocks", label: "상장 승인", desc: "상장 신청 검토 및 승인", icon: CheckCircle, color: "text-green-400" },
  { href: "/admin/users", label: "유저 관리", desc: "유저 제재 및 정보 조회", icon: Users, color: "text-blue-400" },
  { href: "/admin/payments", label: "입출금 처리", desc: "입출금 요청 승인/거절", icon: Wallet, color: "text-yellow-400" },
  { href: "/admin/reports", label: "시세 조작 탐지", desc: "의심 거래 내역 모니터링", icon: AlertTriangle, color: "text-red-400" },
]

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    else if (status === "authenticated" && !session?.user?.isAdmin) router.push("/")
  }, [status, session, router])

  if (status !== "authenticated" || !session?.user?.isAdmin) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-green-400" />
        <h1 className="text-2xl font-bold">관리자 페이지</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adminLinks.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:border-green-500/50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <item.icon className={`h-6 w-6 ${item.color}`} />
                <div>
                  <CardTitle className="text-lg">{item.label}</CardTitle>
                  <CardDescription>{item.desc}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

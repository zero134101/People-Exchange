"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  if (status !== "authenticated" || !session?.user?.isAdmin) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin")}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold">유저 관리</h1>
      </div>
      <Card><CardContent className="py-12 text-center text-muted-foreground">
        유저 관리 기능은 Discord Bot을 통해 더욱 상세하게 이용할 수 있습니다.<br />
        (개발 진행 중)
      </CardContent></Card>
    </div>
  )
}

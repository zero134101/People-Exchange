"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CircleUser, TrendingUp, Wallet, LogOut, Shield } from "lucide-react"

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <TrendingUp className="h-5 w-5 text-green-500" />
            People Exchange
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/ranking" className="text-muted-foreground hover:text-foreground transition">랭킹</Link>
            <Link href="/ipo" className="text-muted-foreground hover:text-foreground transition">IPO</Link>
            <Link href="/news" className="text-muted-foreground hover:text-foreground transition">뉴스</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link href="/deposit">
                <Button variant="outline" size="sm" className="gap-1">
                  <Wallet className="h-4 w-4" />
                  <span className="font-mono">{session.user.krwBalance?.toLocaleString()} KRW</span>
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                      <AvatarFallback>{(session.user.name || "U")[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        잔고: {session.user.krwBalance?.toLocaleString()} KRW
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/portfolio">
                    <DropdownMenuItem><CircleUser className="mr-2 h-4 w-4" />포트폴리오</DropdownMenuItem>
                  </Link>
                  <Link href="/deposit">
                    <DropdownMenuItem><Wallet className="mr-2 h-4 w-4" />충전하기</DropdownMenuItem>
                  </Link>
                  {session.user.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <Link href="/admin">
                        <DropdownMenuItem><Shield className="mr-2 h-4 w-4" />관리자 페이지</DropdownMenuItem>
                      </Link>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={() => signIn("discord")} size="sm">
              Discord 로그인
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

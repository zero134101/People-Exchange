import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Provider } from "@/components/layout/Provider"
import { Header } from "@/components/layout/Header"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "People Exchange — 가상 증권거래소",
  description: "디스코드 서원의 활동량 기반 가상 주식 거래 플랫폼",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Provider>
          <Header />
          <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
        </Provider>
      </body>
    </html>
  )
}

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { Stock } from "@/models/Stock"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { stockId } = await req.json()
  await connectDB()

  const stock = await Stock.findByIdAndUpdate(stockId, { status: "rejected" })
  if (!stock) return NextResponse.json({ error: "Stock not found" }, { status: 404 })

  return NextResponse.json({ success: true })
}

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { userId, action } = await req.json()
  await connectDB()

  if (action === "ban") {
    await User.findByIdAndUpdate(userId, { krwBalance: 0, isListed: false })
  } else if (action === "unban") {
    // unban logic
  }

  return NextResponse.json({ success: true })
}

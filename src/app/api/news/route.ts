import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { News } from "@/models/News"

export async function GET() {
  await connectDB()
  const news = await News.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()

  const result = news.map((n) => ({
    ...n,
    _id: n._id.toString(),
    relatedUserIds: n.relatedUserIds?.map((id) => id.toString()) || [],
  }))

  return NextResponse.json(result)
}

import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    env: {
      hasMongo: !!process.env.MONGODB_URI,
      hasDiscordId: !!(process.env.AUTH_DISCORD_ID ?? process.env.DISCORD_CLIENT_ID),
      hasDiscordSecret: !!(process.env.AUTH_DISCORD_SECRET ?? process.env.DISCORD_CLIENT_SECRET),
      hasAuthSecret: !!(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET),
      hasAuthUrl: !!(process.env.AUTH_URL ?? process.env.NEXTAUTH_URL),
      nodeEnv: process.env.NODE_ENV,
    },
  })
}

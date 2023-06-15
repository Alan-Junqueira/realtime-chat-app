import { authOptions } from "@/lib/next-auth"
import { upstashRedis } from "@/services/upstash-redis"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { ZodError, z } from "zod"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { id: idToDeny } = z.object({ id: z.string() }).parse(body)

    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await upstashRedis.srem(`user:${session.user.id}:incoming_friend_requests`, idToDeny)

    return new NextResponse('Ok')
  } catch (error) {
    if (error instanceof ZodError) {
      return new NextResponse('Invalid request payload', { status: 422 })
    }

    return new NextResponse("Invalid request", { status: 400 })
  }
}
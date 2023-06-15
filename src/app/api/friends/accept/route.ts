import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/next-auth"
import { upstashRedis } from "@/services/upstash-redis"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { ZodError, z } from "zod"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { id: idToAdd } = z.object({ id: z.string() }).parse(body)

    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // verify both users are already friends
    const isAlreadyFriends = await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd)

    if (isAlreadyFriends) {
      return new NextResponse('Already friends', { status: 400 })
    }

    const hasFriendRequest = await fetchRedis('sismember', `user:${session.user.id}:incoming_friend_request`, idToAdd)

    if (!hasFriendRequest) {
      return new NextResponse('No friend request', { status: 400 })
    }
    await Promise.all([
      upstashRedis.sadd(`user:${session.user.id}:friends`, idToAdd),
      upstashRedis.sadd(`user:${idToAdd}:friends`, session.user.id),
      // upstashRedis.srem(`user:${idToAdd}:incoming_friend_request`, session.user.id)
      upstashRedis.srem(`user:${session.user.id}:incoming_friend_request`, idToAdd)
    ])

    return new NextResponse("ok")
  } catch (error) {
    if (error instanceof ZodError) {
      return new NextResponse('Invalid request payload', { status: 422 })
    }

    return new NextResponse("Invalid request", { status: 400 })
  }
}
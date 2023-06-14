import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/next-auth"
import { addFriendValidator } from "@/lib/validations/add-friend"
import { upstashRedis } from "@/services/upstash-redis"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { ZodError } from "zod"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { email: emailToAdd } = addFriendValidator.parse(body.email)
    
    const idToAdd = await fetchRedis('get', `user:email:${emailToAdd}`)

    if (!idToAdd) {
      return new NextResponse('This person does not exist.', { status: 400 })
    }

    const session = await getServerSession(authOptions)

    console.log("session ==>>", session)

    if (!session) {
      return new NextResponse('Unauthorized.', { status: 401 })
    }

    if (idToAdd === session.user.id) {
      return new NextResponse('You cannot add yourself as a friend.', { status: 400 })
    }

    // * Check if user already added
    const isAlreadyAdded = await fetchRedis('sismember', `user:${idToAdd}:incoming_friend_request`, session.user.id)

    if (isAlreadyAdded) {
      return new NextResponse("Already added this user.", { status: 400 })
    }

    // * Check if user already added
    const isAlreadyFriends = await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd)

    if (isAlreadyFriends) {
      return new NextResponse("Already friends with this user.", { status: 400 })
    }


    // * valid request, send friend request.
    upstashRedis.sadd(`user:${idToAdd}:incoming_friend_request`, session.user.id)

    return new NextResponse('OK')

  } catch (error) {
    if (error instanceof ZodError) {
      return new NextResponse("Invalid request payload.", { status: 422 })
    }

    return new NextResponse("Invalid request", { status: 400 })
  }
}
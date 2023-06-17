import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/next-auth"
import { Message, messageValidator } from "@/lib/validations/message"
import { upstashRedis } from "@/services/upstash-redis"
import { nanoid } from "nanoid"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { text, chatId }: { text: string, chatId: string } = await req.json()
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const [userId1, userId2] = chatId.split('--')

    if (session.user.id !== userId1 && session.user.id !== userId2) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const friendId = session.user.id === userId1 ? userId2 : userId1

    const friendList = await fetchRedis('smembers', `user:${session.user.id}:friends`) as string[]
    const isFriend = friendList.includes(friendId)

    if (!isFriend) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const rawSender = await fetchRedis('get', `user:${session.user.id}`) as string
    // eslint-disable-next-line no-undef
    const sender = JSON.parse(rawSender) as User

    const timestamp = Date.now()

    const messageData: Message = {
      id: nanoid(),
      senderId: session.user.id,
      text,
      timestamp
    }

    const message = messageValidator.parse(messageData)

    // All valid, send the message
    await upstashRedis.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: JSON.stringify(message)
    })

    return new NextResponse("OK")
  } catch (error) {
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 })
    }

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
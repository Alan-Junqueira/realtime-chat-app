import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/next-auth"
import { upstashRedis } from "@/services/upstash-redis"
import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"

interface IDashboardChatPage {
  params: {
    chatId: string
  }
}

const getChatMessages = async (chatId: string) => {
  try {
    const results: string[] = await fetchRedis(
      'zrange',
      `chat:${chatId}:messages`,
      0,
      -1
    )

    // eslint-disable-next-line no-undef
    const dbMessages = results.map(message => JSON.parse(message) as Message)

    const reverseDbMessages = dbMessages.reverse()

    const messages = 
  } catch (error) {
    notFound()
  }
}

export default async function DashboardChatPage({ params: { chatId } }: IDashboardChatPage) {
  const session = await getServerSession(authOptions)

  if (!session) notFound()
  const { user } = session

  const [userId1, userId2] = chatId.split("--")

  if (user.id !== userId1 && user.id !== userId2) {
    notFound()
  }

  const chatPartnerId = user.id === userId1 ? userId2 : userId1
  // eslint-disable-next-line no-undef
  const chatPartner = await upstashRedis.get(`user:${chatPartnerId}`) as User
  const initialMessages = await getChatMessages(chatId)
  return (
    <div>
      Chat Page
      {chatId}
    </div>
  )
}
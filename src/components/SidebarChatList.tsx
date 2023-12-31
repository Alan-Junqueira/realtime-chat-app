'use client'

import { pusherClient } from "@/lib/pusher";
import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { UnseenChatToast } from "./UnseenChatToast";

interface ISidebarChatList {
  // eslint-disable-next-line no-undef
  friends: User[]
  sessionId: string
}

// eslint-disable-next-line no-undef
interface IExtendedMessage extends Message {
  senderImage: string
  senderName: string
}

export const SidebarChatList = ({ friends, sessionId }: ISidebarChatList) => {
  // eslint-disable-next-line no-undef
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  // eslint-disable-next-line no-undef
  const [activeChats, setActiveChats] = useState<User[]>(friends);

  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname.includes('chat')) {
      setUnseenMessages(prev => {
        return prev.filter(message => !pathname.includes(message.senderId))
      })
    }
  }, [pathname])

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`))
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

    // eslint-disable-next-line no-undef
    const newFriendHandler = (newFriend: User) => {
      setActiveChats(prev => [...prev, newFriend])
    }

    const chatHandler = (message: IExtendedMessage) => {
      const shouldNotify = pathname !== `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`

      if (!shouldNotify) return

      toast.custom(t => (
        <UnseenChatToast
          t={t}
          sessionId={sessionId}
          senderId={message.senderId}
          senderImage={message.senderImage}
          senderMessage={message.text}
          senderName={message.senderName}
        />
      ))

      setUnseenMessages(prev => [...prev, message])
    }

    pusherClient.bind('new_message', chatHandler)
    pusherClient.bind('new_friend', newFriendHandler)

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`))
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

      pusherClient.unbind('new_message', chatHandler)
      pusherClient.unbind('new_friend', newFriendHandler)
    }

  }, [pathname, router, sessionId])

  return (
    <ul
      role="list"
      className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1"
    >
      {activeChats && activeChats.sort().map(friend => {
        const unseenMessagesCount = unseenMessages.filter(unseenMessage => {
          return unseenMessage.senderId === friend.id
        }).length

        return (
          <li key={friend.id}>
            <a href={`/dashboard/chat/${chatHrefConstructor(
              sessionId,
              friend.id
            )}`}
              className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
            >
              {friend.name}
              {unseenMessagesCount > 0 && (
                <div
                  className="bg-indigo-600 font-medium text-xm text-white w-4 h-4 rounded-full flex justify-center items-center"
                >
                  {unseenMessagesCount}
                </div>
              )}
            </a>
          </li>)
      })}
    </ul>
  )
}

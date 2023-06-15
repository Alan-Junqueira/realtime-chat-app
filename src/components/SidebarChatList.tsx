'use client'

import { chatHrefConstructor } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ISidebarChatList {
  // eslint-disable-next-line no-undef
  friends: User[]
  sessionId: string
}

export const SidebarChatList = ({ friends, sessionId }: ISidebarChatList) => {
  // eslint-disable-next-line no-undef
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);

  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname.includes('chat')) {
      setUnseenMessages(prev => {
        return prev.filter(message => !pathname.includes(message.senderId))
      })
    }
  }, [pathname])

  return (
    <ul
      role="list"
      className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1"
    >
      {friends.sort().map(friend => {
        const unseenMessagesCount = unseenMessages.filter(unseenMessage => {
          return unseenMessage.senderId === friend.id
        }).length

        return (
          <li key={friend.id}>
            <a href={`/dashboard/chat/${chatHrefConstructor(
              sessionId,
              friend.id
            )}`}>
              Hello
            </a>
          </li>)
      })}
    </ul>
  )
}

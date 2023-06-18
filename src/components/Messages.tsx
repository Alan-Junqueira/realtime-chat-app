"use client"

import { pusherClient } from '@/lib/pusher'
import { cn, toPusherKey } from '@/lib/utils'
import { Message } from '@/lib/validations/message'
import { format } from 'date-fns'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

interface IMessages {
  initialMessages: Message[]
  sessionId: string
  chatId: string
  sessionImage?: string | null
  // eslint-disable-next-line no-undef
  chatPartner: User
}

export const Messages = ({
  initialMessages,
  sessionId,
  chatPartner,
  chatId,
  sessionImage
}: IMessages) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const scrollDownRef = useRef<HTMLDivElement | null>(null)

  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, "HH:mm")
  }

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`chat:${chatId}`))

    // eslint-disable-next-line no-undef
    const messageHandler = (message: Message) => {
      setMessages(prev => [message, ...prev])
    }

    pusherClient.bind('incoming-message', messageHandler)

    return () => {
      pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`))
      pusherClient.unbind('incoming-message', messageHandler)
    }
  }, [chatId, sessionId])

  return (
    <div
      id='messages'
      className='flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch'
    >
      <div
        ref={scrollDownRef}
      />
      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === sessionId

        const hasNextMessageFromSameUser = messages[index - 1]?.senderId === messages[index].senderId

        return (
          <div
            key={`${message.id}-${message.timestamp}`}
            className='chat-message'
          >
            <div
              className={cn('flex items-end', {
                'justify-end': isCurrentUser,
              })}
            >
              <div
                className={cn('flex flex-col space-y-2 text-base max-w-xs mx-2', {
                  'order-1 items-end': isCurrentUser,
                  'order-2 items-start': !isCurrentUser
                })}
              >
                <span
                  className={cn('px-4 py-2 rounded-lg inline-block', {
                    'bg-indigo-600 text-white': isCurrentUser,
                    'bg-gray-200 text-gray-900': !isCurrentUser,
                    'rounded-br-none': !hasNextMessageFromSameUser && isCurrentUser,
                    'rounded-bl-none': !hasNextMessageFromSameUser && !isCurrentUser

                  })}
                >
                  {message.text}{" "}
                  <span
                    className='ml-2 text-sm text-gray-400'
                  >
                    {formatTimestamp(message.timestamp)}
                  </span>
                </span>
              </div>

              <div
                className={cn('relative w-6 h-6', {
                  'order-2': isCurrentUser,
                  'order-1': !isCurrentUser,
                  'invisible': hasNextMessageFromSameUser
                })}>
                <Image
                  fill
                  src={isCurrentUser ? (sessionImage as string) : chatPartner.image}
                  alt='Profile picture'
                  referrerPolicy="no-referrer"
                  className='rounded-full'
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
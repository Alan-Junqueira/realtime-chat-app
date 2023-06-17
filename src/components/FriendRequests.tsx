'use client'

import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import axios from "axios";
import { Check, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface IFriendRequests {
  // eslint-disable-next-line no-undef
  incomingFriendRequests: IncomingFriendRequest[]
  sessionId: string
}

export const FriendRequests = ({ incomingFriendRequests, sessionId }: IFriendRequests) => {
  // eslint-disable-next-line no-undef
  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests
  );

  const router = useRouter()

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))

    const friendRequestHandler = () => {

    }

    pusherClient.bind('incoming_friend_requests', friendRequestHandler)

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))
      pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
    }
  }, [sessionId])

  const handleAcceptFriend = async (senderId: string) => {
    await axios.post('/api/friends/accept', {
      id: senderId
    })

    setFriendRequests(prev => prev.filter(request => request.senderId !== senderId))

    router.refresh()
  }

  const handleDenyFriend = async (senderId: string) => {
    await axios.post('/api/friends/deny', {
      id: senderId
    })

    setFriendRequests(prev => prev.filter(request => request.senderId !== senderId))

    router.refresh()
  }
  return (
    <>
      {friendRequests.length === 0 ? (
        <p
          className="text-sm text-zinc-500"
        >
          Nothing to show here
        </p>
      ) : (
        friendRequests.map(request => (
          <div
            className="flex gap-4 items-center"
            key={request.senderId}
          >
            <UserPlus className="text-black" />
            <p className="font-medium text-lg">{request.senderEmail}</p>
            <button
              onClick={() => handleAcceptFriend(request.senderId)}
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
              aria-label="accept friend"
            >
              <Check className="font-semibold text-white w-3/4 h-3/4" />
            </button>

            <button
              onClick={() => handleDenyFriend(request.senderId)}
              className="w-8 h-8 bg-red-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
              aria-label="deny friend"
            >
              <X className="font-semibold text-white w-3/4 h-3/4" />
            </button>
          </div>
        ))
      )}
    </>
  )
}

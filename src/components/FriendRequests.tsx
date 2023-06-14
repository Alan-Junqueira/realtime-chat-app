'use client'

import { Check, UserPlus, X } from "lucide-react";
import { useState } from "react";

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
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
              aria-label="accept friend"
            >
              <Check className="font-semibold text-white w-3/4 h-3/4" />
            </button>

            <button
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

import { authOptions } from "@/lib/next-auth"
import { addFriendValidator } from "@/lib/validations/add-friend"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { email: emailToAdd } = addFriendValidator.parse(body.email)

    const RESTResponse = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/user:email:${emailToAdd}`, {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
      },
      cache: 'no-store'
    })

    const data = await RESTResponse.json() as { result: string }
    const idToAdd = data.result

    if (!idToAdd) {
      return NextResponse.json('This person does not exist.', { status: 400 })
    }

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json('Unauthorized.', { status: 401 })
    }

    if (idToAdd === session.user.id) {
      return NextResponse.json('You cannot add yourself as a friend.', { status: 400 })
    }



    // valid request

  } catch (error) {

  }
}
import PusherServer from 'pusher'
import PusherCLient from 'pusher-js'

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: "sa1",
  useTLS: true
})

export const pusherClient = new PusherCLient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  {
    cluster: 'sa1'
  })
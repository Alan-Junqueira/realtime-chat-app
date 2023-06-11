import { upstashRedis } from "@/services/upstash-redis"

export default async function HomePage() {
  await upstashRedis.set('hello', 'hello')
  return (
    <main>
      <p>Hello</p>
    </main>
  )
}

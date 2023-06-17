import { Button } from "@/components/ui/Button"
import { upstashRedis } from "@/services/upstash-redis"

export default async function HomePage() {
  await upstashRedis.set('hello', 'hello')
  return (
    <main>
      <p>Hello</p>
      <Button>Teste</Button>
    </main>
  )
}
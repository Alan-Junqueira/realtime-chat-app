import { authOptions } from "@/lib/next-auth"
import { getServerSession } from "next-auth"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  console.log(session)
  return (
    <div>
      <p>Dashboard</p>
      <pre>{JSON.stringify(session)}</pre>
    </div>
  )
}

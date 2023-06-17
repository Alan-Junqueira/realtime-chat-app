import { authOptions } from "@/lib/next-auth"
import { getServerSession } from "next-auth"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  return (
    <div>
      <p>Dashboard</p>
    </div>
  )
}

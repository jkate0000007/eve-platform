import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardTabs } from "@/components/dashboard-tabs"

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirect=/dashboard")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  const isCreator = profile?.account_type === "creator"

  return (
    <div className="container py-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <DashboardTabs isCreator={isCreator} userId={session.user.id} />
    </div>
  )
}

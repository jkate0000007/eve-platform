import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/profile-form"

export default async function ProfilePage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirect=/profile")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
      <ProfileForm profile={profile} />
    </div>
  )
}

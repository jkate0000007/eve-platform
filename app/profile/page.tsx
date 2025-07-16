import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreatorQualificationPrompts } from "@/components/creator-qualification-prompts"

export default async function ProfilePage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirect=/profile")
  }

  const { data: profile } = await supabase.from("profiles").select("*", { count: "exact" }).eq("id", session.user.id).single()

  const isCreator = profile?.account_type === "creator"

  // Fetch follower count if creator
  let followerCount = 0
  if (isCreator) {
    const { count } = await supabase
      .from("followers")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", session.user.id)
    followerCount = count ?? 0
  }

  return (
    <div className="container py-10 max-w-4xl mx-auto">
      <div className="flex flex-col items-center mb-8">
        <Avatar className="h-20 w-20 mb-2">
          {profile?.avatar_url ? (
            <AvatarImage
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`}
              alt={profile?.username || ""}
              className="object-cover"
            />
          ) : null}
          <AvatarFallback>
            {profile?.username?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-2xl font-bold">{profile?.username || session.user.email}</h2>
          <p className="text-muted-foreground text-sm">
            {profile?.account_type === "creator" ? "Creator" : "Fan"}
          </p>
          {isCreator && (
            <p className="text-sm text-muted-foreground mt-1">
              {followerCount} follower{followerCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
      
      {/* Show qualification prompts for creators */}
      {isCreator && (
        <CreatorQualificationPrompts followerCount={followerCount} />
      )}
      
      <DashboardTabs isCreator={isCreator} userId={session.user.id} />
    </div>
  )
}

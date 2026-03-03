import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreatorQualificationPromptsWrapper } from "@/components/creator-qualification-prompts"
import Link from "next/link"
import { Pencil, UploadCloud } from "lucide-react"
import RatingStars from "@/components/RatingStars"
import { getAge } from "@/utils/get-age"
import TraitsRating  from "@/components/TraitsRating"

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

  // Fetch creator ratings if the user is a creator
let averageRating = 0
let totalRatings = 0

if (isCreator) {
  const { data: ratingsData } = await supabase
    .from("ratings")
    .select("rating", { count: "exact" })
    .eq("creator_id", profile.id)

  if (ratingsData && ratingsData.length > 0) {
    totalRatings = ratingsData.length
    averageRating =
      ratingsData.reduce((sum, r: any) => sum + r.rating, 0) / totalRatings
  }
}


  // Fetch follower count if creator
  let followerCount = 0
  if (isCreator) {
    const { count } = await supabase
      .from("followers")
      .select("*", { count: "exact", head: true })
      .eq("followed_id", session.user.id)
    followerCount = count ?? 0
  }

  // Show warning if username is missing
  const needsUsername = !profile?.username

  

  return (
    <div className="container py-10 max-w-4xl mx-auto">
      {needsUsername && (
        <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded">
          <p className="font-semibold">You need to set a username for your profile.</p>
          {/* Optionally, add a link to profile/account-type page */}
        </div>
      )}
      <div className="flex flex-col items-center mb-8 relative">
        {/* Edit Profile Button */}
        <Link
          href="/profile/edit"
          className="absolute right-0 top-0 bg-muted rounded-full p-2 hover:bg-accent transition"
          title="Edit Profile"
        >
          <Pencil className="h-5 w-5 text-muted-foreground" />
        </Link>
        {/* Create Post Button (only for creators) */}
        {isCreator && (
          <Link
            href="/create"
            className="absolute right-12 top-0 bg-muted rounded-full p-2 hover:bg-accent transition"
            title="Create Post"
          >
            <UploadCloud className="h-5 w-5 text-muted-foreground" />
          </Link>
        )}
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
      {/* Debug info for development */}
      {/* <pre className="text-xs bg-muted p-2 rounded mb-4">{JSON.stringify(profile, null, 2)}</pre> */}
      {/* Show qualification prompts for creators */}
      {isCreator && (
  <div className="mt-2 flex flex-col items-center">
    <p className="text-lg font-semibold">
      ⭐ {averageRating.toFixed(1)} ({totalRatings} ratings)
    </p>

    {/* RatingStars component for logged-in users */}
    {/* <RatingStars creatorId={profile.id} userId={session.user.id} /> */}
    <TraitsRating creatorId={profile.id} userId={session.user.id} />
  </div>
)}

      {isCreator && (
        <CreatorQualificationPromptsWrapper followerCount={followerCount} />
      )}
      <DashboardTabs isCreator={isCreator} userId={session.user.id} />
    </div>
  )
}

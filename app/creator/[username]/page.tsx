import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SubscribeButton } from "@/components/subscribe-button"
import { AppleGiftButton } from "@/components/apple-gift-button"
import { PostCard } from "@/components/post-card"
import { Apple } from "lucide-react"
import { FollowButton } from "@/components/follow-button"
import { getFollowerCount, getFollowingCount, isFollowing } from "@/app/actions/follow-actions"
import { ShareButton } from "@/components/share-button"

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = createClient()

  // Get creator profile
  const { data: creator } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .eq("account_type", "creator")
    .single()

  if (!creator) {
    notFound()
  }

  // Get current user if logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const currentUserId = session?.user?.id

  // Check if user is subscribed to this creator
  let isSubscribed = false
  if (currentUserId) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("subscriber_id", currentUserId)
      .eq("creator_id", creator.id)
      .eq("status", "active")
      .maybeSingle()

    isSubscribed = !!subscription
  }

  // Get creator's public posts (preview posts)
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("creator_id", creator.id)
    .eq("is_preview", true)
    .not("file_url", "is", null)
    .order("created_at", { ascending: false })

  // Get a featured post with media for the header
  const featuredPost = posts?.find((post) => post.file_url) || null
  let featuredMediaUrl = null

  if (featuredPost?.file_url) {
    try {
      const { data } = await supabase.storage.from("content").createSignedUrl(featuredPost.file_url, 3600)
      featuredMediaUrl = data?.signedUrl
    } catch (error) {
      console.error("Error getting signed URL:", error)
    }
  }

  // Get subscriber count
  const { count: subscriberCount } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("creator_id", creator.id)
    .eq("status", "active")

  // Get post count
  const { count: postCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("creator_id", creator.id)
    .not("file_url", "is", null)

  // Get recent apple gifts
  const { data: recentGifts } = await supabase
    .from("apple_gifts")
    .select("*, sender:profiles!sender_id(username, avatar_url)")
    .eq("creator_id", creator.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get total apple gifts count
  const { count: totalGifts } = await supabase
    .from("apple_gifts")
    .select("*", { count: "exact", head: true })
    .eq("creator_id", creator.id)

  // Get follower/following counts
  const { count: followerCount } = await supabase
    .from("followers")
    .select("*", { count: "exact", head: true })
    .eq("followed_id", creator.id)
  const { count: followingCount } = await supabase
    .from("followers")
    .select("*", { count: "exact", head: true })
    .eq("user_id", creator.id)

  // Check if current user is following this creator
  let following = false
  if (currentUserId) {
    const { data: followData } = await supabase
      .from("followers")
      .select("id")
      .eq("user_id", currentUserId)
      .eq("followed_id", creator.id)
      .maybeSingle()
    following = !!followData
  }

  return (
    <div>
      {/* Hero section with featured media */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 bg-gradient-to-r from-primary/20 to-primary/5">
        {featuredMediaUrl && featuredPost?.file_url?.match(/\.(jpeg|jpg|gif|png)$/i) ? (
          <img
            src={featuredMediaUrl || "/placeholder.svg"}
            alt={`Featured content from ${creator.username}`}
            className="w-full h-full object-cover opacity-50"
          />
        ) : featuredMediaUrl && featuredPost?.file_url?.match(/\.(mp4|webm|mov)$/i) ? (
          <video
            src={featuredMediaUrl}
            className="w-full h-full object-cover opacity-50"
            muted
            autoPlay
            loop
            playsInline
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Creator profile sidebar */}
          <div className="md:w-1/3">
            <Card className="-mt-20 relative z-10">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4 ring-4 ring-background">
                    {creator.avatar_url ? (
                      <AvatarImage
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${creator.avatar_url}`}
                        alt={creator.username}
                         className="object-cover "
                      />
                    ) : null}
                    <AvatarFallback>{creator.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <h1 className="text-2xl font-bold mb-1">{creator.username}</h1>
                  <p className="text-muted-foreground mb-4">Creator</p>
                  <p className="mb-6">{creator.bio || "No bio available."}</p>

                  {/* Action Buttons */}
                  <div className="w-full space-y-3">
                    <FollowButton
                      creatorId={creator.id}
                      currentUserId={currentUserId}
                      isFollowing={following}
                      followerCount={followerCount || 0}
                    />
                    {(followerCount ?? 0) >= 100 && (
                      <AppleGiftButton
                        postId={featuredPost?.id || "general"}
                        creatorId={creator.id}
                        creatorUsername={creator.username}
                        currentUserId={currentUserId}
                        variant="profile"
                      />
                    )}
                    {(followerCount ?? 0) >= 1000 && (
                      <SubscribeButton
                        creatorId={creator.id}
                        isSubscribed={isSubscribed}
                        price={creator.subscription_price || 4.99}
                        currentUserId={currentUserId}
                      />
                    )}
                    <ShareButton
                      url={`${process.env.NEXT_PUBLIC_BASE_URL || "https://" + (typeof window !== "undefined" ? window.location.host : "")}/creator/${creator.username}`}
                      variant="profile"
                      label="Share Profile"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 w-full mt-6">
                    <div className="text-center p-3 bg-muted rounded-md">
                      <p className="text-2xl font-bold">{postCount || 0}</p>
                      <p className="text-sm text-muted-foreground">Posts</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-md">
                      <p className="text-2xl font-bold">{followerCount || 0}</p>
                      <p className="text-sm text-muted-foreground">Followers</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-md">
                      <p className="text-2xl font-bold">{followingCount || 0}</p>
                      <p className="text-sm text-muted-foreground">Following</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Gifts Section */}
            {recentGifts && recentGifts.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Apple className="h-5 w-5 text-red-500" />
                    Recent Gifts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentGifts.map((gift) => (
                      <div key={gift.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-md">
                        <Avatar className="h-8 w-8">
                          {gift.sender?.avatar_url ? (
                            <AvatarImage
                              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${gift.sender.avatar_url}`}
                              alt={gift.sender.username}
                            />
                          ) : null}
                          <AvatarFallback className="text-xs">
                            {gift.sender?.username?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            @{gift.sender?.username || "Anonymous"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {gift.apple_count} apple{gift.apple_count > 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(gift.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Creator content */}
          <div className="md:w-2/3">
            <h2 className="text-2xl font-bold mb-6">Preview Content</h2>

            {posts && posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={{ ...post, creator }}
                    isSubscribed={isSubscribed}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">This creator hasn't posted any preview content(s) yet.</p>
                </CardContent>
              </Card>
            )}

            {!isSubscribed && (
              <div className="mt-8 p-6 bg-muted rounded-lg text-center">
                <h3 className="text-xl font-bold mb-2">Subscribe for Exclusive Content</h3>
                <p className="mb-4">Get access to all of {creator.username}'s exclusive content by subscribing.</p>
                <SubscribeButton
                  creatorId={creator.id}
                  isSubscribed={isSubscribed}
                  price={creator.subscription_price || 4.99}
                  currentUserId={currentUserId}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

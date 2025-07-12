import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MediaPreview } from "@/components/media-preview"

export default async function ExplorePage() {
  const supabase = createClient()

  // Fetch creators with their preview posts
  const { data: creators } = await supabase
    .from("profiles")
    .select("*")
    .eq("account_type", "creator")
    .order("created_at", { ascending: false })

  // For each creator, fetch a preview post with media
  const creatorsWithContent = await Promise.all(
    (creators || []).map(async (creator) => {
      // Get a preview post with media for this creator
      const { data: previewPost } = await supabase
        .from("posts")
        .select("*")
        .eq("creator_id", creator.id)
        .eq("is_preview", true)
        .not("file_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      // Get a signed URL for the media if available
      let mediaUrl = null
      if (previewPost?.file_url) {
        try {
          const { data } = await supabase.storage.from("content").createSignedUrl(previewPost.file_url, 3600)
          mediaUrl = data?.signedUrl
        } catch (error) {
          console.error("Error getting signed URL:", error)
        }
      }

      return {
        ...creator,
        previewPost: previewPost || null,
        mediaUrl,
      }
    }),
  )

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Explore Creators</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {creatorsWithContent && creatorsWithContent.length > 0 ? (
          creatorsWithContent.map((creator) => (
            <Card key={creator.id} className="overflow-hidden">
              <div className="aspect-video relative bg-muted">
                <MediaPreview 
                  mediaUrl={creator.mediaUrl}
                  fileUrl={creator.previewPost?.file_url}
                  creatorName={creator.username}
                />
              </div>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    {creator.avatar_url ? (
                      <AvatarImage
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${creator.avatar_url}`}
                        alt={creator.username}
                         className="object-cover "
                      />
                    ) : null}
                    <AvatarFallback>{creator.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{creator.username}</CardTitle>
                    <CardDescription>Creator</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-muted-foreground">
                  Subscribe to view exclusive content from {creator.username}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">${creator.subscription_price?.toFixed(2) || "4.99"}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {creator.previewPost && (
                    <div className="text-sm text-muted-foreground">
                      {creator.previewPost ? "Preview available" : "No preview"}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/creator/${creator.username}`}>View Profile</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-medium mb-2">No creators found</h3>
            <p className="text-muted-foreground mb-6">Be the first to create content on Eve!</p>
            <Button asChild>
              <Link href="/signup">Become a Creator</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

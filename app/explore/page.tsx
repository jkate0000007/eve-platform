import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CreatorCard } from "@/components/creator-card"

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
            <CreatorCard key={creator.id} creator={creator} />
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

import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CreatorCard } from "@/components/creator-card"
import { ArrowRight, Heart, MessageCircle, Share2 } from "lucide-react"

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
    <div className="container mx-auto max-w-6xl py-10">
      <section className="w-full py-8 md:py-12 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
                Discover Amazing Creators
              </h1>
              <p className="mx-auto max-w-[600px] text-muted-foreground">
                Explore exclusive content from talented creators. Subscribe to unlock full access.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild size="sm">
                <Link href="/signup">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/explore">Browse All</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
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

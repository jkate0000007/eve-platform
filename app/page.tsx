import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Heart, MessageCircle, Share2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ContentCard } from "@/components/content-card"

export default async function Home() {
  const supabase = createClient()

  // Fetch featured preview posts with creator info and signed URLs
  const { data: previewPosts } = await supabase
    .from("posts")
    .select("*, creator:profiles!creator_id(*)")
    .eq("is_preview", true)
    .not("file_url", "is", null)
    .order("created_at", { ascending: false })
    .limit(12)

  // Get signed URLs for media
  const postsWithMedia = await Promise.all(
    (previewPosts || []).map(async (post) => {
      let mediaUrl = null
      if (post.file_url) {
        try {
          const { data } = await supabase.storage.from("content").createSignedUrl(post.file_url, 3600)
          mediaUrl = data?.signedUrl
        } catch (error) {
          console.error("Error getting signed URL:", error)
        }
      }

      return {
        ...post,
        mediaUrl,
      }
    })
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Compact */}
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

      {/* Content Feed - Main Focus */}
      <section className="w-full py-6">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Featured Content</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/explore">View All</Link>
            </Button>
          </div>
          
          {postsWithMedia && postsWithMedia.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {postsWithMedia.map((post) => (
                <ContentCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Play className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No content available yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to create amazing content on Eve!
              </p>
              <Button asChild>
                <Link href="/signup">Become a Creator</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Quick Features - Bottom */}
      <section className="w-full py-8 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Exclusive Content</h3>
              <p className="text-sm text-muted-foreground">
                Access premium content from your favorite creators
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Direct Connection</h3>
              <p className="text-sm text-muted-foreground">
                Message and interact with creators directly
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Support Creators</h3>
              <p className="text-sm text-muted-foreground">
                Help creators monetize their passion
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

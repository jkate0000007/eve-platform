"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ContentCard } from "@/components/content-card"
import Link from "next/link"
import { Play } from "lucide-react"

export function ContentFeed() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
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

        setPosts(postsWithMedia)
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [supabase])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="w-full h-48" />
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
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
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {posts.map((post) => (
        <ContentCard key={post.id} post={post} />
      ))}
    </div>
  )
} 
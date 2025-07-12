"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AppleGiftButton } from "@/components/apple-gift-button"
import { LikeButton } from "@/components/like-button"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Database } from "@/lib/database.types"

type Post = Database["public"]["Tables"]["posts"]["Row"] & {
  creator?: Database["public"]["Tables"]["profiles"]["Row"]
}

interface PostCardProps {
  post: Post
  isSubscribed?: boolean
  currentUserId?: string
}

export function PostCard({ post, isSubscribed, currentUserId }: PostCardProps) {
  const isCreator = currentUserId === post.creator_id
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [creatorAvatarUrl, setCreatorAvatarUrl] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Set creator avatar URL
    if (post.creator?.avatar_url) {
      setCreatorAvatarUrl(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${post.creator.avatar_url}`,
      )
    }

    // If there's no file URL, don't do anything
    if (!post.file_url) return

    const fetchMediaUrl = async () => {
      setIsLoading(true)
      // For preview posts or if the user is subscribed or is the creator, we can access the content
      const canAccessContent = post.is_preview || isSubscribed || isCreator

      if (canAccessContent) {
        // For content bucket, we need to use signed URLs since it's not public
        try {
          const { data, error } = await supabase.storage.from("content").createSignedUrl(post.file_url, 3600) // 1 hour expiry

          if (data?.signedUrl) {
            setMediaUrl(data.signedUrl)
          } else if (error) {
            console.error("Error getting signed URL:", error)
            // Fallback to public URL in case the bucket is public
            const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content/${post.file_url}`
            setMediaUrl(publicUrl)
          }
        } catch (error) {
          console.error("Error in signed URL generation:", error)
          const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content/${post.file_url}`
          setMediaUrl(publicUrl)
        }
      }
      setIsLoading(false)
    }

    fetchMediaUrl()
  }, [post.file_url, post.creator?.avatar_url, post.is_preview, isSubscribed, isCreator, supabase])

  const handlePostClick = () => {
    if (post.creator?.username) {
      router.push(`/creator/${post.creator.username}`)
    }
  }

  const handleInteractionClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent post click when interacting with buttons
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handlePostClick}>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="h-10 w-10">
            {creatorAvatarUrl ? (
              <AvatarImage src={creatorAvatarUrl || "/placeholder.svg"} alt={post.creator?.username || "Creator"}
              className="object-cover" />
            ) : null}
            <AvatarFallback>{post.creator?.username?.charAt(0).toUpperCase() || "C"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-sm">{post.creator?.username || "Unknown Creator"}</p>
            <p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <CardTitle>{post.title}</CardTitle>
        {post.content && <CardDescription className="line-clamp-3">{post.content}</CardDescription>}
      </CardHeader>
      <CardContent>
        {post.file_url && (
          <div className="mb-4">
            {!mediaUrl && !post.is_preview && !isSubscribed && !isCreator ? (
              <div className="p-4 bg-muted rounded-md text-center">
                <p>Subscribe to view this content</p>
              </div>
            ) : isLoading ? (
              <div className="p-4 bg-muted rounded-md text-center">
                <p>Loading media...</p>
              </div>
            ) : mediaUrl && post.file_url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
              <img
                src={mediaUrl || "/placeholder.svg"}
                alt="Post media"
                className="rounded-md max-h-96 object-contain mx-auto w-full"
                onError={(e) => {
                  console.error("Image failed to load:", post.file_url)
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
              />
            ) : mediaUrl && post.file_url.match(/\.(mp4|webm|mov)$/i) ? (
              <video
                src={mediaUrl}
                controls
                className="rounded-md max-h-96 w-full"
                onError={(e) => {
                  console.error("Video failed to load:", post.file_url)
                  ;(e.target as HTMLVideoElement).style.display = "none"
                }}
              />
            ) : (
              <div className="p-4 bg-muted rounded-md text-center">
                <p>Unsupported media format or media not available</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center" onClick={handleInteractionClick}>
          <div className="flex space-x-2">
            <LikeButton postId={post.id} currentUserId={currentUserId} />

            {!isCreator && post.creator && (
              <AppleGiftButton
                postId={post.id}
                creatorId={post.creator_id}
                creatorUsername={post.creator?.username || "Creator"}
                currentUserId={currentUserId}
              />
            )}
          </div>

          {!isSubscribed && !post.is_preview && !isCreator && (
            <Button variant="outline" size="sm" className="ml-auto">
              Subscribe to see full content
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

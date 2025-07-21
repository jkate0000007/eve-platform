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
import { formatTimeAgo, getSafeStorageUrl, getFallbackImage } from "@/lib/utils"
import { Edit, Trash2 } from "lucide-react"
import { Spinner } from "@/components/ui/skeleton"

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
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Set creator avatar URL with error handling
    if (post.creator?.avatar_url) {
      const avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${post.creator.avatar_url}`
      setCreatorAvatarUrl(avatarUrl)
    }

    // If there's no file URL, don't do anything
    if (!post.file_url) return

    const fetchMediaUrl = async () => {
      setIsLoading(true)
      // For preview posts or if the user is subscribed or is the creator, we can access the content
      const canAccessContent = post.is_preview || isSubscribed || isCreator

      if (canAccessContent) {
        try {
          // Use the safe storage URL function
          const mediaUrl = await getSafeStorageUrl("content", post.file_url, false)
          if (mediaUrl) {
            setMediaUrl(mediaUrl)
          } else {
            console.warn("Media file not found:", post.file_url)
            setMediaUrl("") // Set empty to show fallback
          }
        } catch (error) {
          console.error("Error getting media URL:", error)
          setMediaUrl("") // Set empty to show fallback
        }
      }
      setIsLoading(false)
    }

    fetchMediaUrl()
  }, [post.file_url, post.is_preview, isSubscribed, isCreator, post.creator?.avatar_url, supabase])

  const handlePostClick = () => {
    if (post.creator?.username) {
      router.push(`/creator/${post.creator.username}`)
    }
  }

  const handleInteractionClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent post click when interacting with buttons
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/post/${post.id}/edit`)
  }
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm("Are you sure you want to delete this post? This cannot be undone.")) return
    setDeleting(true)
    try {
      // Delete file from storage
      if (post.file_url) {
        await supabase.storage.from("content").remove([post.file_url])
      }
      // Delete post from DB
      const { error } = await supabase.from("posts").delete().eq("id", post.id)
      if (error) throw error
      // Optionally, show a toast or refresh the page
      router.refresh()
    } catch (err: any) {
      alert(err.message || "Failed to delete post")
    } finally {
      setDeleting(false)
    }
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
            <p className="text-xs text-muted-foreground">{formatTimeAgo(post.created_at)}</p>
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
                src={mediaUrl}
                alt="Post media"
                className="rounded-md max-h-96 object-contain mx-auto w-full"
                onError={(e) => {
                  console.error("Image failed to load:", post.file_url)
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                  // Show fallback content
                  const fallback = target.nextElementSibling as HTMLElement
                  if (fallback) {
                    fallback.style.display = "block"
                  }
                }}
              />
            ) : mediaUrl && post.file_url.match(/\.(mp4|webm|mov)$/i) ? (
              <video
                src={mediaUrl}
                controls
                className="rounded-md max-h-96 w-full"
                onError={(e) => {
                  console.error("Video failed to load:", post.file_url)
                  const target = e.target as HTMLVideoElement
                  target.style.display = "none"
                  // Show fallback content
                  const fallback = target.nextElementSibling as HTMLElement
                  if (fallback) {
                    fallback.style.display = "block"
                  }
                }}
              />
            ) : (
              <div className="p-4 bg-muted rounded-md text-center">
                <p>Unsupported media format or media not available</p>
              </div>
            )}
            
            {/* Fallback content for failed media */}
            <div 
              className="p-4 bg-muted rounded-md text-center hidden"
              style={{ display: 'none' }}
            >
              <img 
                src={getFallbackImage('content')} 
                alt="Content unavailable" 
                className="mx-auto max-h-48 rounded-md opacity-50"
              />
              <p className="mt-2 text-sm text-muted-foreground">Content unavailable</p>
            </div>
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
                variant="post"
              />
            )}
          </div>
          {/* Edit/Delete for creator */}
          {isCreator && (
            <div className="flex space-x-2 ml-auto">
              <Button size="icon" variant="ghost" onClick={handleEdit} title="Edit Post">
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleDelete} title="Delete Post" disabled={deleting}>
                {deleting ? <Spinner size={16} /> : <Trash2 className="h-4 w-4 text-destructive" />}
              </Button>
            </div>
          )}

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

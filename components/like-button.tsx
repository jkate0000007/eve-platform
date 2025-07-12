"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { toggleLike, getLikeCount, checkIfUserLiked } from "@/app/actions/like-actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface LikeButtonProps {
  postId: string
  currentUserId?: string
  variant?: "default" | "profile" | "shorts"
}

export function LikeButton({ postId, currentUserId, variant = "default" }: LikeButtonProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchLikeData = async () => {
      if (!postId) return

      // Get like count
      const likeCountResult = await getLikeCount(postId)
      if (likeCountResult.success) {
        setLikeCount(likeCountResult.count)
      }

      // Check if user has liked the post
      if (currentUserId) {
        const userLikedResult = await checkIfUserLiked(postId, currentUserId)
        if (userLikedResult.success) {
          setLiked(userLikedResult.liked)
        }
      }
    }

    fetchLikeData()
  }, [postId, currentUserId])

  const handleLike = async () => {
    if (!currentUserId) {
      // Redirect to login instead of showing error
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname))
      return
    }

    setIsLoading(true)
    try {
      const result = await toggleLike(postId)
      if (result.success) {
        setLiked(result.liked ?? false)
        // Update like count
        setLikeCount((prev) => ((result.liked ?? false) ? prev + 1 : Math.max(0, prev - 1)))
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to like post",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (variant === "shorts") {
    return (
      <Button
        type="button"
        size="icon"
        className={`rounded-full shadow-md transition-colors flex flex-col items-center justify-center w-12 h-12
          ${liked ? "bg-red-600 text-white" : "bg-white text-gray-900 hover:bg-red-100"}
        `}
        style={{ border: "none" }}
        onClick={handleLike}
        disabled={isLoading}
      >
        <Heart className={`h-6 w-6 ${liked ? "fill-current" : ""}`} />
        <span className="text-xs font-semibold mt-1">{likeCount > 0 ? likeCount : ""}</span>
      </Button>
    )
  }
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`flex items-center gap-1 ${liked ? "text-red-500 hover:text-red-600" : ""}`}
      onClick={handleLike}
      disabled={isLoading}
    >
      <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
      <span>{likeCount > 0 ? likeCount : ""}</span>
    </Button>
  )
}

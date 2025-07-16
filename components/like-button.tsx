"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart as LucideHeart } from "lucide-react"
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid"
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
      <div className="flex flex-col items-center">
        <button
          type="button"
          className="bg-transparent border-none p-0 m-0 focus:outline-none"
          
          onClick={handleLike}
          disabled={isLoading}
          title={liked ? 'Unlike' : 'Like'}
        >
          <HeartSolid className={`h-8 w-8 transition-colors ${liked ? "text-pink-700" : "text-white"}`} />
        </button>
        
        <span className="text-sm font-semibold mt-1 text-white drop-shadow" >{likeCount > 0 ? likeCount : ""}</span>
      </div>
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
      <LucideHeart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
      <span>{likeCount > 0 ? likeCount : ""}</span>
    </Button>
  )
}

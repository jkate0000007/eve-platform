"use client"

import { useState, useRef, useEffect } from "react"
import { Heart, MessageCircle, Share2, User, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface ContentPlayerProps {
  post: any
  isActive: boolean
  onLike?: () => void
  onComment?: () => void
  onShare?: () => void
}

export function ContentPlayer({ post, isActive, onLike, onComment, onShare }: ContentPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const isVideo = post.file_url?.match(/\.(mp4|webm|mov)$/i)
  const isImage = post.file_url?.match(/\.(jpeg|jpg|gif|png)$/i)

  useEffect(() => {
    if (isActive && isVideo) {
      setIsPlaying(true)
    } else if (!isActive && isVideo) {
      setIsPlaying(false)
    }
  }, [isActive, isVideo])

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(console.error)
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying])

  const handlePlayPause = () => {
    if (isVideo) {
      setIsPlaying(!isPlaying)
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike?.()
  }

  const handleContainerClick = () => {
    if (isVideo) {
      handlePlayPause()
    }
    setShowControls(true)
    setTimeout(() => setShowControls(false), 3000)
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black cursor-pointer"
      onClick={handleContainerClick}
    >
      {/* Media Content */}
      <div className="absolute inset-0">
        {isVideo ? (
          <video
            ref={videoRef}
            src={post.mediaUrl}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            onError={(e) => {
              console.error("Video error:", e)
            }}
          />
        ) : isImage ? (
          <img
            src={post.mediaUrl}
            alt={post.caption || "Content"}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none"
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">Unsupported media format</p>
          </div>
        )}
      </div>

      {/* Overlay Controls */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-300",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        {/* Play/Pause Button for Videos */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-16 w-16 bg-black/50 text-white hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation()
                handlePlayPause()
              }}
            >
              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </Button>
          </div>
        )}
      </div>

      {/* Content Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
        <div className="flex items-end justify-between">
          {/* Creator Info and Caption */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Link href={`/creator/${post.creator?.username}`}>
                <Avatar className="h-10 w-10 border-2 border-white">
                  {post.creator?.avatar_url ? (
                    <AvatarImage
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${post.creator.avatar_url}`}
                      alt={post.creator.username}
                    />
                  ) : null}
                  <AvatarFallback className="text-sm">
                    {post.creator?.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/creator/${post.creator?.username}`}>
                  <p className="font-semibold text-white text-sm truncate">
                    @{post.creator?.username}
                  </p>
                </Link>
                <p className="text-white/80 text-xs">
                  ${post.creator?.subscription_price?.toFixed(2) || "4.99"}/month
                </p>
              </div>
            </div>
            {post.caption && (
              <p className="text-white text-sm line-clamp-2 mb-2">
                {post.caption}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-4 ml-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 bg-black/50 text-white hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation()
                handleLike()
              }}
            >
              <Heart className={cn("h-6 w-6", isLiked && "fill-red-500 text-red-500")} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 bg-black/50 text-white hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation()
                onComment?.()
              }}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 bg-black/50 text-white hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation()
                onShare?.()
              }}
            >
              <Share2 className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Subscribe Button */}
      <div className="absolute top-4 right-4">
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 text-white"
          asChild
        >
          <Link href={`/creator/${post.creator?.username}`}>
            Subscribe
          </Link>
        </Button>
      </div>
    </div>
  )
} 
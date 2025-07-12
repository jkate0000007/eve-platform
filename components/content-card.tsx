"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Play } from "lucide-react"

interface ContentCardProps {
  post: any
}

export function ContentCard({ post }: ContentCardProps) {
  const isVideo = post.file_url?.match(/\.(mp4|webm|mov)$/i)
  const isImage = post.file_url?.match(/\.(jpeg|jpg|gif|png)$/i)
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)

  // Pause video when component unmounts or when navigating
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      }
    }
  }, [])

  // Make card clickable except for profile links
  const handleCardClick = (e: React.MouseEvent) => {
    // Pause video before navigating
    if (videoRef.current) {
      videoRef.current.pause()
    }
    
    // If the click is on a link or button, do nothing
    const target = e.target as HTMLElement
    if (target.closest("a") || target.closest("button")) return
    router.push(`/post/${post.id}`)
  }

  return (
    <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all" onClick={handleCardClick} tabIndex={0}>
      <CardContent className="p-0">
        <div className="aspect-[4/5] relative bg-muted overflow-hidden">
          {isVideo ? (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                src={post.mediaUrl}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                muted
                preload="metadata"
                poster=""
              />
              {/* Play button overlay for videos */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/5 transition-colors">
                <div className="w-10 h-10 bg-white/95 rounded-full flex items-center justify-center shadow-md backdrop-blur-sm">
                  <Play className="h-5 w-5 text-black ml-0.5" />
                </div>
              </div>
            </div>
          ) : isImage ? (
            <img
              src={post.mediaUrl}
              alt={post.caption || "Content"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          {/* Overlay with creator info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
            <Link 
              href={`/creator/${post.creator?.username}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="h-6 w-6">
                {post.creator?.avatar_url ? (
                  <AvatarImage
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${post.creator.avatar_url}`}
                    alt={post.creator.username}
                  />
                ) : null}
                <AvatarFallback className="text-xs">
                  {post.creator?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-white text-xs font-medium truncate">
                @{post.creator?.username}
              </span>
            </Link>
          </div>
        </div>
        
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <Link 
              href={`/creator/${post.creator?.username}`}
              className="text-sm font-medium text-primary hover:underline"
              onClick={e => e.stopPropagation()}
            >
              ${post.creator?.subscription_price?.toFixed(2) || "4.99"}/month
            </Link>
            <span className="text-xs text-muted-foreground">Preview</span>
          </div>
          {post.caption && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {post.caption}
            </p>
          )}
          
          {/* View Profile Button */}
          <Link 
            href={`/creator/${post.creator?.username}`}
            className="block w-full"
            onClick={e => e.stopPropagation()}
          >
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs"
            >
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
} 
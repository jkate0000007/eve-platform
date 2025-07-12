"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Play, Heart, MessageCircle, Share2, ArrowRight } from "lucide-react"
import Link from "next/link"

interface HeroContentFeedProps {
  posts: any[]
}

export function HeroContentFeed({ posts }: HeroContentFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!posts || posts.length === 0) {
    return (
      <div className="w-full py-12 md:py-16 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6 text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to Eve</h1>
          <p className="text-muted-foreground mb-6">
            Connect with amazing creators and access exclusive content
          </p>
          <Button asChild size="lg">
            <Link href="/signup">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const currentPost = posts[currentIndex]
  const isVideo = currentPost.file_url?.match(/\.(mp4|webm|mov)$/i)
  const isImage = currentPost.file_url?.match(/\.(jpeg|jpg|gif|png)$/i)

  return (
    <div className="w-full min-h-[70vh] bg-black relative overflow-hidden">
      {/* Hero Content */}
      <div className="absolute inset-0">
        {isVideo ? (
          <video
            src={currentPost.mediaUrl}
            className="w-full h-full object-cover"
            muted
            autoPlay
            loop
            playsInline
          />
        ) : isImage ? (
          <img
            src={currentPost.mediaUrl}
            alt={currentPost.caption || "Featured content"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
        )}
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
        <div className="container px-4 md:px-6 h-full flex flex-col justify-end pb-12">
          <div className="max-w-2xl">
            {/* Creator Info */}
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-12 w-12 border-2 border-white">
                {currentPost.creator?.avatar_url ? (
                  <AvatarImage
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${currentPost.creator.avatar_url}`}
                    alt={currentPost.creator.username}
                  />
                ) : null}
                <AvatarFallback className="text-sm">
                  {currentPost.creator?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-white text-xl font-bold">
                  @{currentPost.creator?.username}
                </h2>
                <p className="text-white/80 text-sm">
                  ${currentPost.creator?.subscription_price?.toFixed(2) || "4.99"}/month
                </p>
              </div>
            </div>

            {/* Content Caption */}
            {currentPost.caption && (
              <p className="text-white text-lg mb-6 line-clamp-3">
                {currentPost.caption}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link href={`/creator/${currentPost.creator?.username}`}>
                  Subscribe Now
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Link href="/explore">Explore More</Link>
              </Button>
            </div>

            {/* Content Navigation */}
            {posts.length > 1 && (
              <div className="flex items-center gap-2 mt-6">
                {posts.slice(0, 5).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                    title={`View content ${index + 1}`}
                  />
                ))}
                {posts.length > 5 && (
                  <span className="text-white/60 text-sm ml-2">
                    +{posts.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full">
        <span className="text-white text-sm">
          {currentIndex + 1} of {posts.length} featured
        </span>
      </div>
    </div>
  )
} 
"use client"

import React from "react"
import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Play } from "lucide-react"
import Link from "next/link"

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const [post, setPost] = useState<any>(null)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const supabase = createClient()
  const { id } = React.use(params)

  useEffect(() => {
    async function fetchPost() {
      try {
        // Fetch post with creator info
        const { data: postData } = await supabase
          .from("posts")
          .select("*, creator:profiles!creator_id(*)")
          .eq("id", id)
          .maybeSingle()

        if (!postData) {
          notFound()
        }

        setPost(postData)

        // Get signed URL for media
        if (postData.file_url) {
          try {
            const { data } = await supabase.storage.from("content").createSignedUrl(postData.file_url, 3600)
            setMediaUrl(data?.signedUrl || null)
          } catch (error) {
            console.error("Error getting signed URL:", error)
          }
        }
      } catch (error) {
        console.error("Error fetching post:", error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id, supabase])

  // Pause all other videos when this component mounts
  useEffect(() => {
    const pauseAllVideos = () => {
      const allVideos = document.querySelectorAll('video')
      allVideos.forEach(video => {
        if (video !== videoRef.current) {
          video.pause()
          video.currentTime = 0
        }
      })
    }

    pauseAllVideos()
    
    // Also pause when component unmounts
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!post) {
    notFound()
  }

  const isVideo = post.file_url?.match(/\.(mp4|webm|mov)$/i)
  const isImage = post.file_url?.match(/\.(jpeg|jpg|gif|png)$/i)

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile Full Screen Layout */}
      <div className="md:hidden">
        <div className="relative w-full h-screen">
          {isVideo && mediaUrl ? (
            <video
              ref={videoRef}
              src={mediaUrl}
              className="w-full h-full object-cover"
              controls
              autoPlay
              playsInline
            />
          ) : isImage && mediaUrl ? (
            <img
              src={mediaUrl}
              alt={post.caption || "Content"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          {/* Creator info overlay - mobile */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-2 rounded-md">
            <Link href={`/creator/${post.creator?.username}`} className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
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
              <span className="text-white text-sm font-medium truncate">
                @{post.creator?.username}
              </span>
            </Link>
          </div>

          {/* Back button - mobile */}
          <Link 
            href="/"
            className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black/80"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen flex-col items-center justify-center py-8 px-2">
        <div className="max-w-2xl w-full mx-auto">
          {/* Media Container - Full Resolution */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            {isVideo && mediaUrl ? (
              <video
                ref={videoRef}
                src={mediaUrl}
                className="w-full h-auto max-h-[80vh] object-contain"
                controls
                autoPlay
                playsInline
              />
            ) : isImage && mediaUrl ? (
              <img
                src={mediaUrl}
                alt={post.caption || "Content"}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-muted">
                <Play className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            
            {/* Creator info overlay - desktop */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-2 rounded-md">
              <Link href={`/creator/${post.creator?.username}`} className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
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
                <span className="text-white text-sm font-medium truncate">
                  @{post.creator?.username}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
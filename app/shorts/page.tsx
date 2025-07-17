"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Play, MessageCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AppleGiftButton } from "@/components/apple-gift-button"
import { LikeButton } from "@/components/like-button"
import { ShareButton } from "@/components/share-button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatTimeAgo } from "@/lib/utils"

export default function ShortsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const supabase = createClient()

  // Fetch posts based on auth
  useEffect(() => {
    async function fetchPosts() {
      setLoading(true)
      let sessionUserId: string | null = null
      let previewPosts: any[] = []
      let exclusivePosts: any[] = []

      // Get session
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.id) {
        sessionUserId = session.user.id
        setUserId(sessionUserId)
      }

      // Fetch preview videos
      const { data: preview } = await supabase
        .from("posts")
        .select("*, creator:profiles!creator_id(*)")
        .eq("is_preview", true)
        .not("file_url", "is", null)
        .order("created_at", { ascending: false })
      previewPosts = (preview || []).filter(p => p.file_url.match(/\.(mp4|webm|mov)$/i))

      // If logged in, fetch exclusive videos from subscriptions
      if (sessionUserId) {
        const { data: subs } = await supabase
          .from("subscriptions")
          .select("creator_id")
          .eq("subscriber_id", sessionUserId)
          .eq("status", "active")
        const creatorIds = subs?.map(s => s.creator_id) || []
        if (creatorIds.length > 0) {
          const { data: exclusive } = await supabase
            .from("posts")
            .select("*, creator:profiles!creator_id(*)")
            .in("creator_id", creatorIds)
            .eq("is_preview", false)
            .not("file_url", "is", null)
            .order("created_at", { ascending: false })
          exclusivePosts = (exclusive || []).filter(p => p.file_url.match(/\.(mp4|webm|mov)$/i))
        }
      }

      // Merge and dedupe by post id
      const allPosts = [...previewPosts, ...exclusivePosts].filter(
        (post, idx, arr) => arr.findIndex(p => p.id === post.id) === idx
      )

      // Get signed URLs for all videos
      const postsWithMedia = await Promise.all(
        allPosts.map(async (post) => {
          let mediaUrl = null
          if (post.file_url) {
            try {
              const { data } = await supabase.storage.from("content").createSignedUrl(post.file_url, 3600)
              mediaUrl = data?.signedUrl
            } catch (error) {
              console.error("Error getting signed URL:", error)
            }
          }
          return { ...post, mediaUrl }
        })
      )
      setPosts(postsWithMedia)
      setLoading(false)
    }
    fetchPosts()
  }, [supabase])

  // Play only the video in view using Intersection Observer
  useEffect(() => {
    if (!posts.length) return;
    const observers: IntersectionObserver[] = [];
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      const observer = new window.IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
              // Pause all other videos
              videoRefs.current.forEach((v, i) => {
                if (v && i !== idx) {
                  v.pause();
                  v.currentTime = 0;
                }
              });
              // Play this video
              video.play().catch(() => {});
            } else {
              // Pause and reset this video if not in view
              video.pause();
              video.currentTime = 0;
            }
          });
        },
        { threshold: [0.7] }
      );
      observer.observe(video);
      observers.push(observer);
    });
    // Auto-play the first video on mount if available
    if (videoRefs.current[0]) {
      videoRefs.current[0].play().catch(() => {});
    }
    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [posts]);

  if (loading) {
    return (
      <div className="bg-black min-h-screen w-full flex flex-col items-center justify-center">
        <div className="w-full max-w-md mx-auto h-screen overflow-y-auto snap-y snap-mandatory scrollbar-none shorts-scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <section
              key={i}
              className="shorts-snap snap-start h-screen w-full flex flex-col relative bg-black"
              style={{ scrollSnapAlign: 'start' }}
            >
              <Skeleton className="w-full h-full object-cover" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-20">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
              <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16 ml-2" />
                </div>
                <Skeleton className="h-4 w-3/4 mt-2" />
              </div>
            </section>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black min-h-screen w-full">
      <div className="flex flex-col items-center w-full">
        <div className="w-full max-w-md mx-auto h-screen overflow-y-auto snap-y snap-mandatory scrollbar-none shorts-scrollbar-hide">
          {posts.length === 0 && (
            <div className="h-screen flex items-center justify-center text-white">No shorts available</div>
          )}
          {posts.map((post, idx) => (
            <section
              key={post.id}
              className="shorts-snap snap-start h-screen w-full flex flex-col relative bg-black"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Black container box for better video placement */}
              <div className="w-full h-full max-w-md mx-auto bg-black relative overflow-hidden">
                
              {post.mediaUrl ? (
                <video
                  ref={el => { videoRefs.current[idx] = el || null; }}
                  src={post.mediaUrl}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  preload="auto"
                  style={{ background: '#000', objectFit: 'cover' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Play className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              {/* TikTok-style vertical action buttons - OUTSIDE overlay, relative to section */}
              <div className="absolute right-4 top-[400px] -translate-y-1/2 flex flex-col items-center gap-8 z-20">
                <LikeButton postId={post.id} currentUserId={userId || undefined} variant="shorts" />
                <AppleGiftButton
                  postId={post.id}
                  creatorId={post.creator_id}
                  creatorUsername={post.creator?.username || "Creator"}
                  currentUserId={userId || undefined}
                  variant="shorts"
                  appleCount={post.apple_count}
                />
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    className="bg-transparent border-none p-0 m-0 focus:outline-none"
                    title="Comment"
                  >
                    <MessageCircle className="h-8 w-8 transition-colors fill-current text-white" />
                  </button>
                  <span className="text-sm font-semibold mt-1 text-white drop-shadow">0</span>
                </div>
                <ShareButton
                  url={`${typeof window !== "undefined" ? window.location.origin : ""}/post/${post.id}`}
                  variant="shorts"
                />
              </div>

              {/* Overlay: creator info, caption */}
              <div className="absolute bottom-6 left-0 w-full p-4  flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Link href={`/creator/${post.creator?.username || ''}`} className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      {post.creator?.avatar_url ? (
                        <AvatarImage
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${post.creator.avatar_url}`}
                          alt={post.creator?.username}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="text-sm">
                        {post.creator?.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white text-base font-medium truncate">
                      @{post.creator?.username}
                    </span>
                  </Link>
                  <span className="text-xs text-muted-foreground ml-2">{formatTimeAgo(post.created_at)}</span>
                </div>
                {post.caption && (
                  <p className="text-white text-sm mt-2 line-clamp-3 max-w-[70vw] md:max-w-[60ch]">{post.caption}</p>
                )}
              </div>
              </div>
              <div className="w-full h-20 bg-black"></div>
            </section>
          ))}
        </div>
      </div>
      <style jsx global>{`
        .shorts-scrollbar-hide {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE 10+ */
        }
        .shorts-scrollbar-hide::-webkit-scrollbar {
          display: none; /* Chrome/Safari/Webkit */
        }
      `}</style>
    </div>
  )
} 
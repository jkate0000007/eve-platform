"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Play, MessageCircle } from "lucide-react"
import Link from "next/link"
import { AppleGiftButton } from "@/components/apple-gift-button"
import { LikeButton } from "@/components/like-button"
import { ShareButton } from "@/components/share-button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatTimeAgo } from "@/lib/utils"

const PAGE_SIZE = 5
const MAX_ACTIVE_VIDEOS = 3 // only keep 3 videos mounted

export default function ShortsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0) // currently visible video index
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const supabase = createClient()

  const lastCreatedAt = posts.length > 0 ? posts[posts.length - 1].created_at : null

  // fetch posts
  const fetchPosts = useCallback(async (loadMore = false) => {
    try {
      if (loadMore) setLoadingMore(true)
      else setLoading(true)

      let sessionUserId = userId
      if (!userId) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.id) {
          sessionUserId = session.user.id
          setUserId(sessionUserId)
        }
      }

      let query = supabase
        .from("posts")
        .select("*, creator:profiles!creator_id(*)")
        .not("file_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE)

      if (loadMore && lastCreatedAt) query = query.lt("created_at", lastCreatedAt)

      let previewPosts: any[] = []
      let exclusivePosts: any[] = []

      const { data: preview, error: previewErr } = await query.eq("is_preview", true)
      if (previewErr) throw previewErr
      previewPosts = (preview || []).filter(p => p.file_url.match(/\.(mp4|webm|mov)$/i))

      if (sessionUserId) {
        const { data: subs } = await supabase
          .from("subscriptions")
          .select("creator_id")
          .eq("subscriber_id", sessionUserId)
          .eq("status", "active")

        const creatorIds = subs?.map(s => s.creator_id) || []
        if (creatorIds.length > 0) {
          let exQuery = supabase
            .from("posts")
            .select("*, creator:profiles!creator_id(*)")
            .in("creator_id", creatorIds)
            .eq("is_preview", false)
            .not("file_url", "is", null)
            .order("created_at", { ascending: false })
            .limit(PAGE_SIZE)

          if (loadMore && lastCreatedAt) exQuery = exQuery.lt("created_at", lastCreatedAt)

          const { data: exclusive, error: exclusiveErr } = await exQuery
          if (exclusiveErr) throw exclusiveErr
          exclusivePosts = (exclusive || []).filter(p => p.file_url.match(/\.(mp4|webm|mov)$/i))
        }
      }

      // Merge & dedupe
      const allPosts = [...previewPosts, ...exclusivePosts].filter(
        (post, idx, arr) => arr.findIndex(p => p.id === post.id) === idx
      )

      if (allPosts.length < PAGE_SIZE) setHasMore(false)

      // Signed URLs
      const postsWithMedia = await Promise.all(
        allPosts.map(async (post) => {
          let mediaUrl = null
          if (post.file_url) {
            const { data } = await supabase.storage.from("content").createSignedUrl(post.file_url, 3600)
            mediaUrl = data?.signedUrl
          }
          return { ...post, mediaUrl }
        })
      )

      setPosts(prev => loadMore ? [...prev, ...postsWithMedia] : postsWithMedia)
    } catch (err: any) {
      console.error("Error fetching posts:", err.message)
      setError("Failed to load posts. Please try again.")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [supabase, userId, lastCreatedAt])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || loadingMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchPosts(true)
      },
      { threshold: 1.0 }
    )
    const sentinel = document.querySelector("#load-more-trigger")
    if (sentinel) observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchPosts, hasMore, loadingMore])

  // IntersectionObserver to detect active video
  useEffect(() => {
    if (!posts.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-idx"))
            setActiveIndex(idx)
          }
        })
      },
      { threshold: 0.7 }
    )

    document.querySelectorAll(".shorts-video-container").forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [posts])

  // Play active video, pause others
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return
      if (idx === activeIndex) {
        video.play().catch(() => {})
      } else {
        video.pause()
        video.removeAttribute("src")
        video.load()
      }
    })
  }, [activeIndex])

  if (loading && posts.length === 0) return <SkeletonLoader />

  // Only render 3 videos max (current ±1)
  const visiblePosts = posts.slice(
    Math.max(0, activeIndex - 1),
    activeIndex + 2
  )

  return (
    <div className="bg-black min-h-screen w-full">
      <div className="flex flex-col items-center w-full">
        <div className="w-full max-w-md mx-auto h-screen overflow-y-auto snap-y snap-mandatory scrollbar-none shorts-scrollbar-hide">
          {error && <div className="text-red-500 text-center p-4">{error}</div>}

          {visiblePosts.map((post, idx) => (
            <ShortsPost
              key={post.id}
              post={post}
              idx={posts.indexOf(post)} // maintain real index
              videoRefs={videoRefs}
              userId={userId}
            />
          ))}

          {hasMore && (
            <div id="load-more-trigger" className="h-20 flex items-center justify-center text-white">
              {loadingMore ? "Loading more..." : "Scroll to load more"}
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        .shorts-scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .shorts-scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

function ShortsPost({ post, idx, videoRefs, userId }: any) {
  return (
    <section
      className="shorts-snap snap-start h-screen w-full flex flex-col relative bg-black shorts-video-container"
      data-idx={idx}
    >
      <div className="w-full h-full max-w-md mx-auto bg-black relative overflow-hidden">
        {post.mediaUrl ? (
          <video
            ref={(el) => { videoRefs.current[idx] = el || null }}
            src={post.mediaUrl}
            className="w-full h-full object-cover"
            controls
            playsInline
            preload="metadata"
            loop
            style={{ background: "#000", objectFit: "cover" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Play className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        {/* Actions */}
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
            <button type="button" className="bg-transparent border-none p-0 m-0 focus:outline-none" title="Comment">
              <MessageCircle className="h-8 w-8 transition-colors fill-current text-white" />
            </button>
            <span className="text-sm font-semibold mt-1 text-white drop-shadow">0</span>
          </div>
          <ShareButton
            url={`${typeof window !== "undefined" ? window.location.origin : ""}/post/${post.id}`}
            variant="shorts"
          />
        </div>

        {/* Overlay info */}
        <div className="absolute bottom-6 left-0 w-full p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Link href={`/creator/${post.creator?.username || ""}`} className="flex items-center gap-2">
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
              <span className="text-white text-base font-medium truncate">@{post.creator?.username}</span>
            </Link>
            <span className="text-xs text-muted-foreground ml-2">{formatTimeAgo(post.created_at)}</span>
          </div>
          {post.caption && (
            <p className="text-white text-sm mt-2 line-clamp-3 max-w-[70vw] md:max-w-[60ch]">{post.caption}</p>
          )}
        </div>
      </div>
      <div className="w-full h-24 bg-black"></div>
    </section>
  )
}

function SkeletonLoader() {
  return (
    <div className="bg-black min-h-screen w-full flex flex-col items-center justify-center">
      <div
        className="w-full max-w-md mx-auto h-screen overflow-y-auto snap-y snap-mandatory scrollbar-none shorts-scrollbar-hide"
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <section
            key={i}
            className="shorts-snap snap-start h-screen w-full flex flex-col relative bg-black"
          >
            <Skeleton className="w-full h-full object-cover" />
          </section>
        ))}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { followUser, unfollowUser } from "@/app/actions/follow-actions"
import { Button } from "@/components/ui/button"

interface FollowButtonProps {
  creatorId: string
  currentUserId?: string | null
  isFollowing: boolean
  followerCount: number
}

export function FollowButton({ creatorId, currentUserId, isFollowing: initialIsFollowing, followerCount: initialFollowerCount }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followerCount, setFollowerCount] = useState(initialFollowerCount)
  const [loading, setLoading] = useState(false)

  // Don't show follow button for self
  if (!creatorId || !currentUserId || creatorId === currentUserId) {
    return (
      <Button disabled variant="outline" className="w-full">This is you</Button>
    )
  }

  const handleFollow = async () => {
    setLoading(true)
    const result = await followUser(currentUserId, creatorId)
    if (result.success) {
      setIsFollowing(true)
      setFollowerCount((c) => c + 1)
    }
    setLoading(false)
  }

  const handleUnfollow = async () => {
    setLoading(true)
    const result = await unfollowUser(currentUserId, creatorId)
    if (result.success) {
      setIsFollowing(false)
      setFollowerCount((c) => Math.max(0, c - 1))
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center w-full">
      <Button
        onClick={isFollowing ? handleUnfollow : handleFollow}
        disabled={loading}
        className={`w-full font-semibold ${isFollowing ? "bg-red-600 text-foreground hover:bg-red-500" : "bg-red-600 text-white hover:bg-red-500"}`}
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>
      <span className="text-xs text-muted-foreground mt-1">{followerCount} follower{followerCount === 1 ? "" : "s"}</span>
    </div>
  )
} 
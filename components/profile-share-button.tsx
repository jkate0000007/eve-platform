"use client"

import { useEffect, useState } from "react"
import { ShareButton } from "@/components/share-button"

export function ProfileShareButton({ username }: { username: string }) {
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/creator/${username}`)
    }
  }, [username])

  if (!shareUrl) return null

  return (
    <ShareButton url={shareUrl} variant="profile" label="Share Profile" />
  )
} 
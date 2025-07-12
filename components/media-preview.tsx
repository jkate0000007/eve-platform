"use client"

import { useState } from "react"

interface MediaPreviewProps {
  mediaUrl: string | null
  fileUrl: string | null | undefined
  creatorName: string
}

export function MediaPreview({ mediaUrl, fileUrl, creatorName }: MediaPreviewProps) {
  const [imageError, setImageError] = useState(false)
  const [videoError, setVideoError] = useState(false)

  if (!mediaUrl || !fileUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-primary/10">
        <p className="text-center text-muted-foreground">No preview content available</p>
      </div>
    )
  }

  const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png)$/i)
  const isVideo = fileUrl.match(/\.(mp4|webm|mov)$/i)

  if (isImage && !imageError) {
    return (
      <img
        src={mediaUrl}
        alt={`Preview from ${creatorName}`}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    )
  }

  if (isVideo && !videoError) {
    return (
      <video
        src={mediaUrl}
        className="w-full h-full object-cover"
        muted
        autoPlay
        loop
        playsInline
        onError={() => setVideoError(true)}
      />
    )
  }

  // Fallback for errors or unsupported formats
  return (
    <div className="w-full h-full flex items-center justify-center bg-primary/10">
      <p className="text-center text-muted-foreground">No preview content available</p>
    </div>
  )
} 
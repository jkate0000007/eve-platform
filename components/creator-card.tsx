"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MediaPreview } from "@/components/media-preview"
import { useGlobalLoading } from "@/components/global-loading-context"
import { useRouter } from "next/navigation"

interface CreatorCardProps {
  creator: {
    id: string
    username: string
    avatar_url?: string
    subscription_price?: number
    previewPost?: any
    mediaUrl?: string
  }
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const { setLoading } = useGlobalLoading()
  const router = useRouter()

  const handleViewProfile = () => {
    console.log("Explore View Profile clicked for:", creator.username)
    setLoading(true)
    router.push(`/creator/${creator.username}`)
  }

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative bg-muted">
        <MediaPreview 
          mediaUrl={creator.mediaUrl}
          fileUrl={creator.previewPost?.file_url}
          creatorName={creator.username}
        />
      </div>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            {creator.avatar_url ? (
              <AvatarImage
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${creator.avatar_url}`}
                alt={creator.username}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback>{creator.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{creator.username}</CardTitle>
            <CardDescription>Creator</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-muted-foreground">
          Subscribe to view exclusive content from {creator.username}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium">${creator.subscription_price?.toFixed(2) || "4.99"}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          {creator.previewPost && (
            <div className="text-sm text-muted-foreground">
              {creator.previewPost ? "Preview available" : "No preview"}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleViewProfile} className="w-full">
          View Profile
        </Button>
      </CardFooter>
    </Card>
  )
} 
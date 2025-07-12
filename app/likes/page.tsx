import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, MessageCircle, Share2 } from "lucide-react"

export default function LikesPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Liked Content</h1>
      
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Heart className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-medium mb-2">No liked content yet</h3>
        <p className="text-muted-foreground mb-6">
          Content you like will appear here for easy access
        </p>
        <Button asChild>
          <a href="/explore">Explore Creators</a>
        </Button>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Coming Soon</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Like Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Like posts and videos from your favorite creators
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Leave comments and interact with creators
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Share content with friends and family
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 
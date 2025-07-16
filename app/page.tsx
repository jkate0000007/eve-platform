import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Heart, MessageCircle, Share2 } from "lucide-react"
import { ContentFeed } from "@/components/content-feed"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Compact */}
      <section className="w-full py-8 md:py-12 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
                Discover Amazing Creators
              </h1>
              <p className="mx-auto max-w-[600px] text-muted-foreground">
                Explore exclusive content from talented creators. Subscribe to unlock full access.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild size="sm">
                <Link href="/signup">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/explore">Browse All</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Feed - Main Focus */}
      <section className="w-full py-6">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Featured Content</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/explore">View All</Link>
            </Button>
          </div>
          
          <ContentFeed />
        </div>
      </section>

      {/* Quick Features - Bottom */}
      <section className="w-full py-8 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Exclusive Content</h3>
              <p className="text-sm text-muted-foreground">
                Access premium content from your favorite creators
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Direct Connection</h3>
              <p className="text-sm text-muted-foreground">
                Message and interact with creators directly
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Support Creators</h3>
              <p className="text-sm text-muted-foreground">
                Help creators monetize their passion
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

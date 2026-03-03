import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, ShieldCheck } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/server"
import { getTopTraits } from "@/utils/get-top-traits"
import { ContestantCarousel }from "@/components/creators-carousel"
import { MockCreatorsCarousel } from "@/components/mock-creators-carousel"

export default async function Home() {
  const supabase = createClient()

  // Fetch featured creators (recent creators with preview posts)
  const { data: featuredCreators } = await supabase
    .from("profiles")
    .select("*")
    .eq("account_type", "creator")
    .order("created_at", { ascending: false })
    .limit(6)

  // Add preview posts and media URLs for featured creators
  const featuredCreatorsWithContent = await Promise.all(
    (featuredCreators || []).map(async (creator) => {
      // Get a preview post with media for this creator
      const { data: previewPost } = await supabase
        .from("posts")
        .select("*")
        .eq("creator_id", creator.id)
        .eq("is_preview", true)
        .not("file_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      // Get a signed URL for the media if available
      let mediaUrl = null
      if (previewPost?.file_url) {
        try {
          const { data } = await supabase.storage.from("content").createSignedUrl(previewPost.file_url, 3600)
          mediaUrl = data?.signedUrl
        } catch (error) {
          console.error("Error getting signed URL:", error)
        }
      }

      const { data: traitStats } = await supabase
      .rpc("get_creator_traits", { creator_uuid: creator.id })

    const topTraits = traitStats
      ? getTopTraits(traitStats)
      : []

     


      // Calculate average rating for this creator
      const { data: ratingStats, error } = await supabase
  .from("ratings")
  .select("rating", { count: "exact" })
  .eq("creator_id", creator.id)

const averageRating =
  ratingStats && ratingStats.length > 0
    ? ratingStats.reduce((sum, r) => sum + Number(r.rating), 0) / ratingStats.length
    : null

const totalRatings = ratingStats?.length ?? 0


return {
  ...creator,
  previewPost: previewPost || null,
  mediaUrl,
  averageRating,
  totalRatings,
  topTraits,
}

    }),
  )

  // Fetch top rated creators (top 5 from leaderboard)
  const { data: topRatedCreators } = await supabase.rpc("get_leaderboard_ranking")
  return (
    <div className="min-h-screen bg-background">

      {/* ================= HERO ================= */}
      <section className="py-16 px-4 ">
  <div className="container mx-auto max-w-6xl grid gap-10 md:grid-cols-2 items-center">
    
    {/* Text */}
    <div className=" text-center md:text-left">
      <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
        Exclusive content from creators you love
      </h1>

      <p className="mt-4 text-muted-foreground max-w-xl">
        Subscribe monthly. Unlock exclusive content. Rate creators on Eve.
      </p>

      {/* Responsive CTA */}
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button asChild size="lg" className="rounded-full w-full sm:w-auto">
            <Link href="/explore">Explore Creators</Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full w-full sm:w-auto"
          >
            <Link href="/signup">Become a Creator</Link>
          </Button>
        </div>
      </div>
    </div>

    {/* Image */}
    <div className="relative w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto md:mx-0">
  <div className="relative aspect-[4/5] sm:aspect-[16/10] rounded-3xl overflow-hidden shadow-lg">
    <img
      src="https://nhjsbrcctdbatwdeipwo.supabase.co/storage/v1/object/public/public%20contents/home%20page/download%20(4).jpg"
      alt="Eve creators preview"
      className="absolute inset-0 w-full h-full object-cover"
    />
  </div>
</div>

  {/* Video */}
  {/* <div className="relative w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto md:mx-0">
  <div className="relative aspect-[4/5] sm:aspect-[16/10] rounded-3xl overflow-hidden shadow-lg">
    <video
      autoPlay
      muted
      loop
      playsInline
      poster="https://nhjsbrcctdbatwdeipwo.supabase.co/storage/v1/object/public/public%20contents/home%20page/download%20(4).jpg"
      className="absolute inset-0 w-full h-full object-cover"
    >
      <source
        src="https://nhjsbrcctdbatwdeipwo.supabase.co/storage/v1/object/public/public%20contents/home%20page/hero-vid.mp4"
        type="video/mp4"
      />
    </video>
  </div>
</div> */}


  </div>
</section>
<ContestantCarousel />
<MockCreatorsCarousel />
<div className="fixed bottom-4 left-4 right-4 sm:hidden z-50">
  <Button asChild size="lg" className="w-full rounded-full shadow-lg">
    <Link href="/explore">Explore Creators</Link>
  </Button>
</div>

      {/* ================= FEATURED CREATORS ================= */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Featured creators</h2>
            <Link
              href="/explore"
              className="text-sm text-muted-foreground hover:underline"
            >
              View all →
            </Link>
          </div>

          {/* Mobile: horizontal scroll | Desktop: grid */}
          <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
          {featuredCreatorsWithContent && featuredCreatorsWithContent.length > 0 ? (
            featuredCreatorsWithContent.map((creator) => (
              <div
                key={creator.id}
                className="min-w-[240px] md:min-w-0 bg-muted/30 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarImage
                      src={creator.avatar_url ?
                        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${creator.avatar_url}` :
                        "https://i.pravatar.cc/150"
                      }
                      className="object-cover "
                    />
                    <AvatarFallback>{creator.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>

                  <div className="flex w-full justify-between">
                   <div>
                      <p className="font-semibold">@{creator.username}</p>

                      {/* Top traits */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {creator.topTraits.map((trait: string) => (
                        <span
                        key={trait}
                        className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground capitalize"
                        >
                        {trait}
                        </span>
                        ))}
                      </div>
                   </div>

                    <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                      <span>
                      ⭐ {creator.averageRating !== null
                        ? creator.averageRating.toFixed(1)
                        : "N/A"}

                      </span>

                      {creator.country && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <img
                            src={`https://flagcdn.com/w20/${creator.country.toLowerCase()}.png`}
                            className="w-4 h-4 rounded-full"
                            alt={creator.country}
                          />
                          {creator.country}
                        </span>
                      )}

                    </div>
                


                  </div>
                </div>
             
                <Button
                  size="sm"
                  className="mt-4 w-full rounded-full"
                  asChild
                >
                  <Link href={`/creator/${creator.username}`}>Subscribe</Link>
                </Button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-medium mb-2">No creators found</h3>
              <p className="text-muted-foreground mb-6">Be the first to create content on Eve!</p>
              <Button asChild>
                <Link href="/signup">Become a Creator</Link>
              </Button>
            </div>
          )}
          </div>
        </div>
      </section>

      {/* ================= TOP RATED ================= */}
      <section className="py-12 px-4 bg-muted/40">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Top rated creators</h2>
            <Link
              href="/leaderboard"
              className="text-sm text-muted-foreground hover:underline"
            >
              View leaderboard →
            </Link>
          </div>

          <div className="space-y-3">
          {topRatedCreators && topRatedCreators.length > 0 ? (
            topRatedCreators.slice(0, 5).map((creator: any, index: number) => (
              <div
                key={creator.creator_id}
                className="flex items-center justify-between bg-background rounded-xl p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold w-5">{index + 1}</span>
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={creator.avatar_url ?
                        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${creator.avatar_url}` :
                        "https://i.pravatar.cc/100"
                      }
                      className="object-cover "
                    />
                    <AvatarFallback>{creator.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">@{creator.username}</span>
                </div>

                <span className="text-sm font-semibold text-yellow-500">
                  ⭐ {creator.average_rating.toFixed(1)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No ratings yet</p>
            </div>
          )}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-16 px-4">
        <div className="grid gap-8 md:grid-cols-3 text-center">
          <div>
            <p className="text-3xl mb-2">🔍</p>
            <h3 className="font-semibold">Discover creators</h3>
          </div>
          <div>
            <p className="text-3xl mb-2">💳</p>
            <h3 className="font-semibold">Subscribe monthly</h3>
          </div>
          <div>
            <p className="text-3xl mb-2">⭐</p>
            <h3 className="font-semibold">Rate & support</h3>
          </div>
        </div>
      </section>

      {/* ================= CREATOR CTA ================= */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-muted/40 to-background">
        <h2 className="text-2xl md:text-3xl font-semibold">
          Built for creators
        </h2>

        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          Earn directly from your audience. No algorithms. Fair payouts.
        </p>

        <Button asChild size="lg" className="mt-6 rounded-full">
          <Link href="/signup">Start creating on Eve</Link>
        </Button>
      </section>

      {/* ================= SAFETY ================= */}
      <section className="py-8 px-4 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Secure payments · Private content · Creator control
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-6 text-center text-xs text-muted-foreground">
        <div className="flex justify-center gap-4 mb-2">
          <Link href="/about">About</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="https://x.com">X</Link>
        </div>
        © {new Date().getFullYear()} Eve
      </footer>
    </div>
  )
}

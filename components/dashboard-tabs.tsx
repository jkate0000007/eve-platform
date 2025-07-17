"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { UploadCloud, Apple, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { PostCard } from "./post-card"
import { getCreatorAppleGifts, redeemApples } from "@/app/actions/apple-gift-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardTabs({ isCreator, userId }: { isCreator: boolean; userId: string }) {
  const { toast } = useToast()
  const supabase = createClient()
  const [posts, setPosts] = useState<any[]>([])
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [appleGifts, setAppleGifts] = useState<any[]>([])
  const [totalApples, setTotalApples] = useState(0)
  const [totalAppleAmount, setTotalAppleAmount] = useState("0.00")
  const [redeemableApples, setRedeemableApples] = useState(0)
  const [appleRedemptionAmount, setAppleRedemptionAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [appleFeatureAvailable, setAppleFeatureAvailable] = useState(true)
  const [uploadingPost, setUploadingPost] = useState(false)
  const [redeemingApples, setRedeemingApples] = useState(false)
  const [postTitle, setPostTitle] = useState("")
  const [postContent, setPostContent] = useState("")
  const [postFile, setPostFile] = useState<File | null>(null)
  const [isPreview, setIsPreview] = useState(false)
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch posts if creator
        if (isCreator) {
          const { data: postsData } = await supabase
            .from("posts")
            .select("*")
            .eq("creator_id", userId)
            .not("file_url", "is", null)
            .order("created_at", { ascending: false })

          setPosts(postsData || [])

          // Fetch subscribers
          const { data: subsData } = await supabase
            .from("subscriptions")
            .select("*, subscriber:profiles!subscriber_id(*)")
            .eq("creator_id", userId)
            .eq("status", "active")

          setSubscribers(subsData || [])

          // Fetch apple gifts
          try {
            const appleGiftsResult = await getCreatorAppleGifts(userId)
            if (appleGiftsResult.success && appleGiftsResult.data) {
              setAppleGifts(appleGiftsResult.data.gifts || [])
              setTotalApples(appleGiftsResult.data.totalApples || 0)
              setTotalAppleAmount(appleGiftsResult.data.totalAmount || "0.00")
              setRedeemableApples(appleGiftsResult.data.redeemableApples || 0)
              setAppleFeatureAvailable(true)
            }
          } catch (error) {
            console.error("Error fetching apple gifts:", error)
            setAppleFeatureAvailable(false)
          }
        } else {
          // Fetch subscriptions for fans
          const { data: subsData } = await supabase
            .from("subscriptions")
            .select("*, creator:profiles!creator_id(*)")
            .eq("subscriber_id", userId)
            .eq("status", "active")

          setSubscriptions(subsData || [])

          // Fetch posts from subscribed creators
          if (subsData && subsData.length > 0) {
            const creatorIds = subsData.map((sub) => sub.creator_id)
            const { data: postsData } = await supabase
              .from("posts")
              .select("*, creator:profiles!creator_id(*)")
              .in("creator_id", creatorIds)
              .not("file_url", "is", null)
              .order("created_at", { ascending: false })

            setPosts(postsData || [])
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, userId, isCreator])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPostFile(e.target.files[0])
      setMediaPreviewUrl(URL.createObjectURL(e.target.files[0]))
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your post",
        variant: "destructive",
      })
      return
    }

    if (!postFile) {
      toast({
        title: "Error",
        description: "Media is required. Please upload an image or video.",
        variant: "destructive",
      })
      return
    }

    setUploadingPost(true)
    try {
      // Upload file (required)
      const fileExt = postFile!.name.split(".").pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`

      const { error: uploadError, data } = await supabase.storage.from("content").upload(fileName, postFile!)

      if (uploadError) throw uploadError

      const fileUrl = fileName

      // Create post
      const { error: postError } = await supabase.from("posts").insert({
        title: postTitle,
        content: postContent,
        creator_id: userId,
        file_url: fileUrl,
        is_preview: isPreview,
      })

      if (postError) throw postError

      toast({
        title: "Success",
        description: "Your post has been created",
      })

      // Reset form
      setPostTitle("")
      setPostContent("")
      setPostFile(null)
      setMediaPreviewUrl(null)
      setIsPreview(false)

      // Refresh posts
      const { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .eq("creator_id", userId)
        .not("file_url", "is", null)
        .order("created_at", { ascending: false })

      setPosts(postsData || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      })
    } finally {
      setUploadingPost(false)
    }
  }

  const handleRedeemApples = async () => {
    if (appleRedemptionAmount < 100) {
      toast({
        title: "Error",
        description: "Minimum redemption is 100 apples",
        variant: "destructive",
      })
      return
    }

    if (appleRedemptionAmount > redeemableApples) {
      toast({
        title: "Error",
        description: "You don't have enough apples to redeem",
        variant: "destructive",
      })
      return
    }

    setRedeemingApples(true)
    try {
      const result = await redeemApples(userId, appleRedemptionAmount)

      if (result.success) {
        toast({
          title: "Redemption requested",
          description: `Your redemption request for ${appleRedemptionAmount} apples has been submitted`,
        })

        // Refresh apple gifts data
        const appleGiftsResult = await getCreatorAppleGifts(userId)
        if (appleGiftsResult.success && appleGiftsResult.data) {
          setAppleGifts(appleGiftsResult.data.gifts || [])
          setTotalApples(appleGiftsResult.data.totalApples || 0)
          setTotalAppleAmount(appleGiftsResult.data.totalAmount || "0.00")
          setRedeemableApples(appleGiftsResult.data.redeemableApples || 0)
        }

        setAppleRedemptionAmount(0)
      } else {
        throw new Error(result.error || "Failed to redeem apples")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to redeem apples",
        variant: "destructive",
      })
    } finally {
      setRedeemingApples(false)
    }
  }

  return (
    <Tabs defaultValue={isCreator ? "content" : "feed"} className="w-full max-w-4xl mx-auto">
      <TabsList className="grid w-full max-w-md grid-cols-4 gap-4 mx-auto">
        <TabsTrigger value={isCreator ? "content" : "feed"}>{isCreator ? "Content" : "Feed"}</TabsTrigger>
        <TabsTrigger value={isCreator ? "subscribers" : "subscriptions"}>
          {isCreator ? "Subscribers" : "Subscriptions"}
        </TabsTrigger>
        {isCreator && <TabsTrigger value="apples">Apple Gifts</TabsTrigger>}
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="likes">Likes</TabsTrigger>
      </TabsList>

      {/* Content/Feed Tab */}
      <TabsContent value={isCreator ? "content" : "feed"} className="max-w-4xl mx-auto">
        {/* {isCreator && (
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Post</CardTitle>
              <p>create your first post on Eve!</p>
              <CardDescription>Share exclusive content with your subscribers. Media (image or video) is required for all posts.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Post title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Write your post content here..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file" className="flex items-center gap-2">
                    Media <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-4">
                    <Label
                      htmlFor="file"
                      className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-input bg-background hover:bg-accent/40"
                    >
                      <UploadCloud className="mb-2 h-6 w-6" />
                      <span className="text-sm text-muted-foreground">
                        {postFile ? postFile.name : "Click to upload image or video (required)"}
                      </span>
                    </Label>
                    <Input
                      id="file"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*,video/*"
                      required
                      title="Upload image or video"
                      placeholder="Upload image or video"
                    />
                  </div>
                  {mediaPreviewUrl && postFile && (
                    <div className="mt-2">
                      {postFile.type.startsWith("image") ? (
                        <img src={mediaPreviewUrl} alt="Preview" className="max-h-48 rounded-md border" />
                      ) : postFile.type.startsWith("video") ? (
                        <video src={mediaPreviewUrl} controls className="max-h-48 rounded-md border" />
                      ) : null}
                    </div>
                  )}
                  {!postFile && (
                    <p className="text-sm text-red-500">Media is required for all posts</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="preview"
                    checked={isPreview}
                    onChange={(e) => setIsPreview(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    title="Make this post available as a preview"
                    placeholder="Preview checkbox"
                  />
                  <Label
                    htmlFor="preview"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Make this post available as a preview (visible to non-subscribers)
                  </Label>
                </div>
                <Button type="submit" disabled={uploadingPost}>
                  {uploadingPost ? "Creating post..." : "Create Post"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )} */}

        <div className="grid gap-6">
          {loading ? (
            // Show skeletons while loading
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="rounded-md w-full h-56 mb-4" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  {isCreator ? "You haven't created any posts yet." : "No posts from your subscriptions yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} isSubscribed={true} currentUserId={userId} />)
          )}
        </div>
      </TabsContent>

      {/* Subscribers/Subscriptions Tab */}
      <TabsContent value={isCreator ? "subscribers" : "subscriptions"} className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{isCreator ? "Your Subscribers" : "Your Subscriptions"}</CardTitle>
            <CardDescription>
              {isCreator ? "People who subscribe to your content" : "Creators you're subscribed to"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : isCreator ? (
              subscribers.length === 0 ? (
                <p className="text-muted-foreground">You don't have any subscribers yet.</p>
              ) : (
                <div className="space-y-4">
                  {subscribers.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {sub.subscriber.avatar_url ? (
                            <AvatarImage
                              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${sub.subscriber.avatar_url}`}
                              alt={sub.subscriber.username}
                              className="object-cover"
                            />
                          ) : null}
                          <AvatarFallback>{sub.subscriber.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{sub.subscriber.username}</p>
                          <p className="text-sm text-muted-foreground">
                            Subscribed since {new Date(sub.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : subscriptions.length === 0 ? (
              <p className="text-muted-foreground">You're not subscribed to any creators yet.</p>
            ) : (
              <div className="space-y-4">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {sub.creator.avatar_url ? (
                          <AvatarImage
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${sub.creator.avatar_url}`}
                            alt={sub.creator.username}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback>{sub.creator.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{sub.creator.username}</p>
                        <p className="text-sm text-muted-foreground">
                          Subscribed since {new Date(sub.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/creator/${sub.creator.username}`}>View Profile</a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Apple Gifts Tab (Creators only) */}
      {isCreator && (
        <TabsContent value="apples" className="max-w-4xl mx-auto">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Apple Gifts</CardTitle>
                <CardDescription>Manage the apple gifts you've received from fans</CardDescription>
              </CardHeader>
              <CardContent>
                {!appleFeatureAvailable ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Feature Not Available</AlertTitle>
                    <AlertDescription>
                      The Apple Gifts feature is not available yet. Please run the database migration to enable this
                      feature.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Total Apples</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <Apple className="h-5 w-5 text-red-500 mr-2" />
                            <span className="text-2xl font-bold">{totalApples}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Worth ${totalAppleAmount}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Available to Redeem</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <Apple className="h-5 w-5 text-red-500 mr-2" />
                            <span className="text-2xl font-bold">{redeemableApples}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Minimum 100 apples required to redeem</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Redeem Apples</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="100"
                              max={redeemableApples}
                              value={appleRedemptionAmount || ""}
                              onChange={(e) => setAppleRedemptionAmount(Number.parseInt(e.target.value) || 0)}
                              placeholder="Enter amount"
                              disabled={redeemableApples < 100}
                            />
                            <Button
                              onClick={handleRedeemApples}
                              disabled={
                                redeemingApples ||
                                appleRedemptionAmount < 100 ||
                                appleRedemptionAmount > redeemableApples
                              }
                              size="sm"
                            >
                              {redeemingApples ? "Processing..." : "Redeem"}
                            </Button>
                          </div>
                          {appleRedemptionAmount > 0 && (
                            <p className="text-xs mt-2">Value: ${(appleRedemptionAmount * 1.44).toFixed(2)}</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-4">Recent Gifts</h3>
                      {appleGifts.length === 0 ? (
                        <p className="text-muted-foreground">You haven't received any apple gifts yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {appleGifts.slice(0, 5).map((gift, index) => (
                            <div key={index} className="flex items-center justify-between border-b pb-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  {gift.sender.avatar_url ? (
                                    <AvatarImage
                                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${gift.sender.avatar_url}`}
                                      alt={gift.sender.username}
                                    />
                                  ) : null}
                                  <AvatarFallback>{gift.sender.username.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{gift.sender.username}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(gift.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Apple className="h-4 w-4 text-red-500 mr-1" />
                                <span className="font-medium">{gift.amount}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  (${Number(gift.total_amount).toFixed(2)})
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
              {appleFeatureAvailable && appleGifts.length > 5 && (
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Gifts
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </TabsContent>
      )}

      {/* Analytics Tab */}
      <TabsContent value="analytics" className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              {isCreator ? "View insights about your content and subscribers" : "View insights about your activity"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isCreator ? "Total Subscribers" : "Total Subscriptions"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isCreator ? subscribers.length : subscriptions.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{isCreator ? "Total Posts" : "Posts Viewed"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{posts.length}</div>
                </CardContent>
              </Card>
              {isCreator ? (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Apple Gifts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Apple className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-2xl font-bold">{appleFeatureAvailable ? totalApples : 0}</span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Spent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$0.00</div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

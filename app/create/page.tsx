"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UploadCloud } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Skeleton } from "@/components/ui/skeleton"

export default function CreatePage() {
  const { toast } = useToast()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [postTitle, setPostTitle] = useState("")
  const [postContent, setPostContent] = useState("")
  const [postFile, setPostFile] = useState<File | null>(null)
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null)
  const [isPreview, setIsPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true)
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
          setProfile(data)
          
          // Check if user is a creator, if not redirect to dashboard
          if (data?.account_type !== "creator") {
            toast({ 
              title: "Access Denied", 
              description: "Only creators can access the create page.", 
              variant: "destructive" 
            })
            router.push("/dashboard")
            return
          }
        } else {
          // No user logged in, redirect to login
          router.push("/login")
          return
        }
      } catch (error) {
        console.error("Error loading user:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
        setProfile(data)
        
        if (data?.account_type !== "creator") {
          toast({ 
            title: "Access Denied", 
            description: "Only creators can access the create page.", 
            variant: "destructive" 
          })
          router.push("/dashboard")
        }
      } else {
        setProfile(null)
        router.push("/login")
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, router, toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPostFile(e.target.files[0])
      setMediaPreviewUrl(URL.createObjectURL(e.target.files[0]))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postTitle.trim()) {
      toast({ title: "Error", description: "Please enter a title for your post", variant: "destructive" })
      return
    }
    if (!postFile) {
      toast({ title: "Error", description: "Media is required. Please upload an image or video.", variant: "destructive" })
      return
    }
    setSubmitting(true)
    try {
      // 1. Upload file to Supabase Storage
      const fileExt = postFile.name.split(".").pop()
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from("content").upload(fileName, postFile)
      if (uploadError) throw uploadError

      // 2. Insert post into posts table
      const { error: postError } = await supabase.from("posts").insert({
        title: postTitle,
        content: postContent,
        creator_id: user?.id,
        file_url: fileName,
        is_preview: isPreview,
      })
      if (postError) throw postError

      toast({ title: "Success", description: "Your post has been created!" })
      setPostTitle("")
      setPostContent("")
      setPostFile(null)
      setMediaPreviewUrl(null)
      setIsPreview(false)
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create post", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  // Show loading state while checking user permissions
  if (loading) {
    return (
      <div className="container py-10 max-w-xl mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-32 w-full" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Don't render the form if user is not a creator (they will be redirected)
  if (!user || profile?.account_type !== "creator") {
    return null
  }

  return (
    <div className="container py-10 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Content</h1>
      <Card>
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
          <CardDescription>Share exclusive content with your subscribers. Media (image or video) is required for all posts.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating post..." : "Create Post"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 
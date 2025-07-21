"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Spinner } from "@/components/ui/skeleton"

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [post, setPost] = useState<any>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null)
  const [postFile, setPostFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)
      const postId = params.id as string
      // Get current user
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login?redirect=/profile")
        return
      }
      // Fetch post
      const { data: postData } = await supabase.from("posts").select("*").eq("id", postId).single()
      if (!postData) {
        toast({ title: "Not found", description: "Post not found.", variant: "destructive" })
        router.push("/profile")
        return
      }
      // Only allow creator to edit
      if (postData.creator_id !== session.user.id) {
        toast({ title: "Forbidden", description: "You can only edit your own posts.", variant: "destructive" })
        router.push("/profile")
        return
      }
      setPost(postData)
      setTitle(postData.title || "")
      setContent(postData.content || "")
      setMediaPreviewUrl(postData.file_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content/${postData.file_url}` : null)
      setLoading(false)
    }
    fetchPost()
    // eslint-disable-next-line
  }, [params.id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPostFile(e.target.files[0])
      setMediaPreviewUrl(URL.createObjectURL(e.target.files[0]))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      let fileUrl = post.file_url
      // If new file, upload
      if (postFile) {
        const fileExt = postFile.name.split(".").pop()
        const fileName = `${post.creator_id}/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from("content").upload(fileName, postFile)
        if (uploadError) throw uploadError
        // Optionally, delete old file
        if (post.file_url) {
          await supabase.storage.from("content").remove([post.file_url])
        }
        fileUrl = fileName
      }
      // Update post
      const { error: updateError } = await supabase.from("posts").update({
        title,
        content,
        file_url: fileUrl,
      }).eq("id", post.id)
      if (updateError) throw updateError
      toast({ title: "Success", description: "Post updated!" })
      setTimeout(() => router.push("/profile"), 1200)
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update post", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

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

  if (!post) return null

  return (
    <div className="container py-10 max-w-xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Link href="/profile" className="text-muted-foreground hover:text-primary transition">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <CardTitle>Edit Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} required minLength={1} maxLength={100} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Content</label>
              <Textarea value={content} onChange={e => setContent(e.target.value)} rows={4} maxLength={1000} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Media</label>
              <Input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleFileChange} />
              {mediaPreviewUrl && (
                <div className="mt-2">
                  {postFile ? (
                    postFile.type.startsWith("image") ? (
                      <img src={mediaPreviewUrl} alt="Preview" className="max-h-48 rounded-md border" />
                    ) : postFile.type.startsWith("video") ? (
                      <video src={mediaPreviewUrl} controls className="max-h-48 rounded-md border" />
                    ) : null
                  ) : post.file_url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                    <img src={mediaPreviewUrl} alt="Current" className="max-h-48 rounded-md border" />
                  ) : post.file_url.match(/\.(mp4|webm|mov)$/i) ? (
                    <video src={mediaPreviewUrl} controls className="max-h-48 rounded-md border" />
                  ) : null}
                </div>
              )}
            </div>
            <Button type="submit" disabled={submitting}>{submitting ? (<span className="flex items-center gap-2"><Spinner size={18} /> Saving...</span>) : "Save Changes"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 
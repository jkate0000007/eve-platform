"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"

export function DebugStorage() {
  const [bucket, setBucket] = useState("content")
  const [path, setPath] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleCheckStorage = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // List files in the bucket
      const { data, error: listError } = await supabase.storage.from(bucket).list(path || undefined)

      if (listError) {
        throw listError
      }

      // Get URL for the path if specified
      let url = null
      if (path) {
        if (isPublic) {
          url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
        } else {
          const { data: urlData, error: urlError } = await supabase.storage.from(bucket).createSignedUrl(path, 60)
          if (urlError) {
            console.warn("Error creating signed URL:", urlError)
          } else {
            url = urlData.signedUrl
          }
        }
      }

      setResult({
        files: data,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        publicUrl: isPublic
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
          : null,
        signedUrl: !isPublic && url ? url : null,
        url: url,
      })
    } catch (err: any) {
      console.error("Storage error:", err)
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Debugger</CardTitle>
        <CardDescription>Check storage buckets and files</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bucket">Bucket</Label>
          <Input
            id="bucket"
            value={bucket}
            onChange={(e) => setBucket(e.target.value)}
            placeholder="e.g., content, avatars"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="path">Path (optional)</Label>
          <Input
            id="path"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="e.g., user-id/filename.jpg or leave empty to list root"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="isPublic" checked={isPublic} onCheckedChange={(checked) => setIsPublic(checked === true)} />
          <Label htmlFor="isPublic">Is Public Bucket</Label>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="p-3 bg-muted rounded-md">
            <p className="font-medium">Result</p>
            <div className="mt-2 space-y-2">
              <p className="text-sm">Supabase URL: {result.supabaseUrl}</p>
              {result.publicUrl && <p className="text-sm">Public URL: {result.publicUrl}</p>}
              {result.signedUrl && <p className="text-sm">Signed URL: {result.signedUrl}</p>}

              {result.url && (
                <div className="mt-4">
                  <p className="font-medium">File Preview:</p>
                  {path.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                    <img
                      src={result.url || "/placeholder.svg"}
                      alt="File preview"
                      className="mt-2 max-h-48 rounded-md"
                      onError={() => console.error("Image failed to load")}
                    />
                  ) : path.match(/\.(mp4|webm|mov)$/i) ? (
                    <video
                      src={result.url}
                      controls
                      className="mt-2 max-h-48 w-full rounded-md"
                      onError={() => console.error("Video failed to load")}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">Preview not available for this file type</p>
                  )}
                </div>
              )}

              <p className="font-medium mt-4">Files:</p>
              {result.files.length === 0 ? (
                <p className="text-sm text-muted-foreground">No files found</p>
              ) : (
                <ul className="text-sm space-y-1">
                  {result.files.map((file: any, index: number) => (
                    <li key={index}>
                      {file.name} {file.id ? `(${file.id})` : ""}
                      {file.metadata && ` - ${JSON.stringify(file.metadata)}`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleCheckStorage} disabled={loading}>
          {loading ? "Checking..." : "Check Storage"}
        </Button>
      </CardFooter>
    </Card>
  )
}

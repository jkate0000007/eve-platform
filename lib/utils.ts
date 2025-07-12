import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { createClient } from "@/lib/supabase/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getStorageUrl(bucket: string, path: string | null, isPublic = true): Promise<string> {
  if (!path) return ""

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    console.error("NEXT_PUBLIC_SUPABASE_URL is not defined")
    return ""
  }

  // For public buckets, we can use the public URL
  if (isPublic) {
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
  }

  // For private buckets, we need to generate a signed URL
  try {
    const supabase = createClient()
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60) // 1 hour expiry

    if (error) {
      console.error("Error creating signed URL:", error)
      return ""
    }

    return data.signedUrl
  } catch (error) {
    console.error("Error generating signed URL:", error)
    return ""
  }
}

// Synchronous version for public buckets only
export function getPublicStorageUrl(bucket: string, path: string | null): string {
  if (!path) return ""

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    console.error("NEXT_PUBLIC_SUPABASE_URL is not defined")
    return ""
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}

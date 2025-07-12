"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleLike(postId: string) {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      success: false,
      error: "You must be logged in to like a post",
    }
  }

  const userId = session.user.id

  // Check if the user has already liked the post
  const { data: existingLike } = await supabase
    .from("likes")
    .select("*")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .maybeSingle()

  try {
    if (existingLike) {
      // Unlike the post
      const { error } = await supabase.from("likes").delete().eq("user_id", userId).eq("post_id", postId)

      if (error) throw error

      revalidatePath("/")
      revalidatePath("/dashboard")
      revalidatePath("/creator/[username]", "page")
      revalidatePath("/explore")

      return {
        success: true,
        liked: false,
      }
    } else {
      // Like the post
      const { error } = await supabase.from("likes").insert({
        user_id: userId,
        post_id: postId,
      })

      if (error) throw error

      revalidatePath("/")
      revalidatePath("/dashboard")
      revalidatePath("/creator/[username]", "page")
      revalidatePath("/explore")

      return {
        success: true,
        liked: true,
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to toggle like",
    }
  }
}

export async function getLikeCount(postId: string) {
  const supabase = createClient()

  try {
    const { count, error } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId)

    if (error) throw error

    return {
      success: true,
      count: count || 0,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to get like count",
      count: 0,
    }
  }
}

export async function checkIfUserLiked(postId: string, userId?: string) {
  if (!userId) return { success: true, liked: false }

  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("likes")
      .select("*")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .maybeSingle()

    if (error) throw error

    return {
      success: true,
      liked: !!data,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to check if user liked post",
      liked: false,
    }
  }
}

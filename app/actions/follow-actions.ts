import { createClient } from "@/lib/supabase/client"

export async function followUser(userId: string, followedId: string) {
  const supabase = createClient()
  const { error } = await supabase.from("followers").insert({ user_id: userId, followed_id: followedId })
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function unfollowUser(userId: string, followedId: string) {
  const supabase = createClient()
  const { error } = await supabase.from("followers").delete().eq("user_id", userId).eq("followed_id", followedId)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function isFollowing(userId: string, followedId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("followers").select("id").eq("user_id", userId).eq("followed_id", followedId).maybeSingle()
  if (error) return { success: false, error: error.message, following: false }
  return { success: true, following: !!data }
}

export async function getFollowerCount(followedId: string) {
  const supabase = createClient()
  const { count, error } = await supabase.from("followers").select("*", { count: "exact", head: true }).eq("followed_id", followedId)
  if (error) return { success: false, error: error.message, count: 0 }
  return { success: true, count: count || 0 }
}

export async function getFollowingCount(userId: string) {
  const supabase = createClient()
  const { count, error } = await supabase.from("followers").select("*", { count: "exact", head: true }).eq("user_id", userId)
  if (error) return { success: false, error: error.message, count: 0 }
  return { success: true, count: count || 0 }
}

export async function getFollowers(followedId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("followers").select("user_id, profiles: user_id(username, avatar_url)").eq("followed_id", followedId)
  if (error) return { success: false, error: error.message, followers: [] }
  return { success: true, followers: data || [] }
}

export async function getFollowing(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("followers").select("followed_id, profiles: followed_id(username, avatar_url)").eq("user_id", userId)
  if (error) return { success: false, error: error.message, following: [] }
  return { success: true, following: data || [] }
} 
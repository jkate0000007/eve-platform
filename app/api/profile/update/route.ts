import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import { profileUpdateSchema } from "@/lib/schemas/profile"

export async function POST(request: Request) {
  const formData = await request.formData()
  const username = formData.get("username") as string
  const bio = formData.get("bio") as string
  const avatar = formData.get("avatar") as File | null

  // Zod validation
  const result = profileUpdateSchema.safeParse({ username, bio })
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies: () => cookies() })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect("/login?redirect=/profile/edit")
  }

  let avatar_url = undefined
  if (avatar && avatar.size > 0) {
    const fileExt = avatar.name.split(".").pop()
    const fileName = `${session.user.id}/avatar-${uuidv4()}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, avatar, { upsert: true })
    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 })
    }
    avatar_url = fileName
  }

  // Update profile
  const updates: any = {
    username,
    bio,
    updated_at: new Date().toISOString(),
  }
  if (avatar_url) updates.avatar_url = avatar_url

  const { error } = await supabase.from("profiles").update(updates).eq("id", session.user.id)
  if (error) {
    // Handle unique constraint violation for username
    if (error.message.includes("duplicate key value")) {
      return NextResponse.json({ error: "Username is already taken." }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Redirect to profile page
  return NextResponse.redirect(new URL("/profile", request.url))
} 
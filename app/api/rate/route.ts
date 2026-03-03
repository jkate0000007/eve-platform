import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"  // your server supabase client

export async function POST(req: Request) {
  const supabase = createClient()
  const { creatorId, rating } = await req.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  if (rating < 1 || rating > 10)
    return NextResponse.json({ error: "Rating must be 1-10" }, { status: 400 })

  // UPSERT (insert or update)
  const { data, error } = await supabase
    .from("ratings")
    .upsert({
      user_id: user.id,
      creator_id: creatorId,
      rating,
      updated_at: new Date()
    }, { onConflict: "user_id,creator_id" })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, data })
}

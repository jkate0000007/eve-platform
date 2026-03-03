import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { creatorId, traits } = await req.json()
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const payload = {
    rater_id: user.id,
    creator_id: creatorId,

    caring: traits.includes("caring"),
    pretty: traits.includes("pretty"),
    funny: traits.includes("funny"),
    kind: traits.includes("kind"),
    face_card: traits.includes("face_card"),
    romantic: traits.includes("romantic"),
    cute: traits.includes("cute"),
    body: traits.includes("body"),
  }

  await supabase.from("rating_traits").upsert(payload)

  return NextResponse.json({ success: true })
}

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/lib/database.types"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/dashboard"

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
    await supabase.auth.exchangeCodeForSession(code)
    
    // Check if user has account type set
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", session.user.id)
        .single()
      
      // If no account type is set, redirect to account type selection
      if (!profile?.account_type) {
        return NextResponse.redirect(new URL("/account-type", requestUrl.origin))
      }
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}

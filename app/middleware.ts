import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path is not public, redirect to login
  if (!session && !isPublicPath(req.nextUrl.pathname)) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in, check if they have an account type set
  if (session) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_type")
      .eq("id", session.user.id)
      .single()

    // If user doesn't have account type set and not on account-type page, redirect
    if (!profile?.account_type && req.nextUrl.pathname !== "/account-type") {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/account-type"
      return NextResponse.redirect(redirectUrl)
    }

    // If user has account type set and is on account-type page, redirect to dashboard
    if (profile?.account_type && req.nextUrl.pathname === "/account-type") {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/dashboard"
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

function isPublicPath(pathname: string): boolean {
  const publicPaths = [
    "/",
    "/login",
    "/signup",
    "/auth/callback",
    "/explore",
    "/creator",
    "/post",
    "/shorts",
  ]
  
  return publicPaths.some((path) => pathname.startsWith(path))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

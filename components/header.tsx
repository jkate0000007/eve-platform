"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import type { User } from "@supabase/supabase-js"
import { Menu, PlayCircle } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dancing_Script } from "next/font/google"
const dancingScript = Dancing_Script({ subsets: ["latin"], weight: ["700"] })

export default function Header({ brandFontClass }: { brandFontClass?: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true)
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()

          setProfile(data)
        }
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setProfile(data)
      } else {
        setProfile(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex  lg:px-48 px-4 h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="/"
                  className={`text-lg font-bold ${brandFontClass || ""} ${isActive("/") ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
                  style={{ fontWeight: 700 }}
                >
                  Home
                </Link>
                <Link
                  href="/explore"
                  className={`text-lg font-bold ${brandFontClass || ""} ${isActive("/explore") ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
                  style={{ fontWeight: 700 }}
                >
                  Explore
                </Link>
                <Link
                  href="/leaderboard"
                  className={`text-lg font-bold ${brandFontClass || ""} ${isActive("/shorts") ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary flex items-center gap-1`}
                  style={{ fontWeight: 700 }}
                >
                  
                  Leaderboard
                </Link>
                {user && (
                  <Link
                    href="/dashboard"
                    className={`text-lg font-bold ${brandFontClass || ""} ${isActive("/dashboard") ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
                    style={{ fontWeight: 700 }}
                  >
                    Dashboard
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center space-x-2">
            <Image src="https://nbskmrqi6whncsmx.public.blob.vercel-storage.com/eve/logo/eve_logo-OY5VELPss6IsxAAlzbuo616ZlHMb4r.png"
           alt="logo" width={24} height={24} priority className="w-6 h-6" />
            {/* <span
              className={`hidden md:block font-semibold ${brandFontClass || ""}`}
              style={{
                fontSize: "clamp(1.2rem, 4vw, 1.6rem)",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              E V E
            </span> */}



          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-24">
        
          <Link
            href="/"
            className={`text-lg font-bold ${brandFontClass || ""} ${isActive("/") ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
            style={{ fontWeight: 700 }}
          >
            Home
          </Link>
          <Link
            href="/explore"
            className={`text-lg font-bold ${brandFontClass || ""} ${isActive("/explore") ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
            style={{ fontWeight: 700 }}
          >
            Explore
          </Link>
          <Link
            href="/leaderboard"
            className={`text-lg font-bold ${brandFontClass || ""} ${isActive("/shorts") ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary flex items-center gap-1`}
            style={{ fontWeight: 700 }}
          >
           
           Leaderboard
          </Link>
          {user && (
            <Link
              href="/profile"
              className={`text-lg font-bold ${brandFontClass || ""} ${isActive("/profile") ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
              style={{ fontWeight: 700 }}
            >
              Profile
            </Link>

            
            
          )}


        </nav>

        <div className="flex items-center gap-4">
          {loading ? (
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={profile?.avatar_url
                          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username || user.email?.split("@")[0] || "User")}&background=random&size=64`}
                        alt={profile?.username || ""}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">{profile?.username || user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.account_type === "creator" ? "Creator" : "Fan"}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          {!loading && !user && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
        </div>
      </div>
    </header>
  )
}

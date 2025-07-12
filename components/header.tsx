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
import type { User } from "@supabase/supabase-js"
import { Menu, PlayCircle } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dancing_Script } from "next/font/google"
const dancingScript = Dancing_Script({ subsets: ["latin"], weight: ["700"] })

export default function Header() {
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex px-4 h-16 items-center justify-between">
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
                  className={`text-lg font-bold ${dancingScript.className} ${isActive("/") ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
                  style={{ fontWeight: 700 }}
                >
                  Home
                </Link>
                <Link
                  href="/explore"
                  className={`text-lg font-bold ${dancingScript.className} ${isActive("/explore") ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
                  style={{ fontWeight: 700 }}
                >
                  Explore
                </Link>
                <Link
                  href="/shorts"
                  className={`text-lg font-bold ${dancingScript.className} ${isActive("/shorts") ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary flex items-center gap-1`}
                  style={{ fontWeight: 700 }}
                >
                  
                  Shorts
                </Link>
                {user && (
                  <Link
                    href="/dashboard"
                    className={`text-lg font-bold ${dancingScript.className} ${isActive("/dashboard") ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
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
           alt="logo" width={37} height={40} priority className="w-10 h-10" />
            <span
              className={`text-3xl font-bold ${dancingScript.className}`}
              style={{
                textShadow: "0 1px 4px rgba(0,0,0,0.12), 0 1.5px 8px rgba(0,0,0,0.10)",
                fontWeight: 700,
              }}
            >
              Eve
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-lg font-bold ${dancingScript.className} ${isActive("/") ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
            style={{ fontWeight: 700 }}
          >
            Home
          </Link>
          <Link
            href="/explore"
            className={`text-lg font-bold ${dancingScript.className} ${isActive("/explore") ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
            style={{ fontWeight: 700 }}
          >
            Explore
          </Link>
          <Link
            href="/shorts"
            className={`text-lg font-bold ${dancingScript.className} ${isActive("/shorts") ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary flex items-center gap-1`}
            style={{ fontWeight: 700 }}
          >
           
            Shorts
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className={`text-lg font-bold ${dancingScript.className} ${isActive("/dashboard") ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
              style={{ fontWeight: 700 }}
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {!loading &&
            (user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {profile?.avatar_url ? (
                        <AvatarImage
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`}
                          alt={profile?.username || ""}
                          className="object-cover "
                        />
                      ) : null}
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
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            ))}
        </div>
      </div>
    </header>
  )
}

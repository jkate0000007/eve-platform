"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  HomeIcon as HomeOutline,
  HomeIcon as HomeSolid,
  MagnifyingGlassIcon as SearchOutline,
  MagnifyingGlassIcon as SearchSolid,
  UserIcon as UserOutline,
  UserIcon as UserSolid,
  PlusCircleIcon as PlusOutline,
  PlusCircleIcon as PlusSolid,
  PlayCircleIcon as PlayOutline,
  PlayCircleIcon as PlaySolid,
} from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export default function BottomNav() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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

  const baseNavItems = [
    {
      href: "/",
      label: "Home",
      outline: HomeOutline,
      solid: HomeSolid,
    },
    {
      href: "/explore",
      label: "Explore",
      outline: SearchOutline,
      solid: SearchSolid,
    },
    {
      href: "/shorts",
      label: "Shorts",
      outline: PlayOutline,
      solid: PlaySolid,
    },
  ]

  const createNavItem = {
    href: "/create",
    label: "Create",
    outline: PlusOutline,
    solid: PlusSolid,
  }

  const userNavItems = [
    {
      href: "/profile",
      label: "Profile",
      outline: UserOutline,
      solid: UserSolid,
    },
  ]

  // Create navigation items with create button centered for creators
  const navItems = profile?.account_type === "creator" 
    ? [
        ...baseNavItems.slice(0, 2), // Home, Explore
        createNavItem, // Create (centered)
        ...baseNavItems.slice(2), // Shorts
        ...userNavItems, // Me
      ]
    : [
        ...baseNavItems,
        ...userNavItems,
      ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = isActive ? item.solid : item.outline
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full py-2 px-1 rounded-lg transition-colors",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary hover:bg-muted/50"
              )}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
} 
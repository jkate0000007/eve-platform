"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Plus, User, Heart, PlayCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
    {
      href: "/explore",
      label: "Explore",
      icon: Search,
    },
    {
      href: "/shorts",
      label: "Shorts",
      icon: PlayCircle,
    },
    {
      href: "/create",
      label: "Create",
      icon: Plus,
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: User,
    },
    {
      href: "/likes",
      label: "Likes",
      icon: Heart,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
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
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
} 
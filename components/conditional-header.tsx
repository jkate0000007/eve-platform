"use client"

import { usePathname } from "next/navigation"
import Header from "./header"

export function ConditionalHeader() {
  const pathname = usePathname()
  
  // Hide header on home page for full-screen TikTok experience
  if (pathname === "/") {
    return null
  }
  
  return <Header />
} 
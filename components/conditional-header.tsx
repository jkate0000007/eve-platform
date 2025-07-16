"use client"

import { usePathname } from "next/navigation"
import Header from "@/components/header"

export default function ConditionalHeader() {
  const pathname = usePathname()
  
  // Hide header on shorts page
  if (pathname === "/shorts") {
    return null
  }
  
  return <Header />
} 
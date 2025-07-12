import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/header"
import BottomNav from "@/components/bottom-nav"
import { SupabaseProvider } from "@/components/supabase-provider"
import { Dancing_Script } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })
const dancingScript = Dancing_Script({ subsets: ["latin"], weight: ["700"] })

export const metadata: Metadata = {
  title: "Eve - Connect with Creators",
  description: "Subscribe to your favorite content creators",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <SupabaseProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Header />
            <main className="px-4 min-h-[calc(100vh-4rem)] pb-20 md:pb-0">{children}</main>
            <BottomNav />
            <Toaster />
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}

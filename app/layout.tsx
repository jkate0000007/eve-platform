import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import ConditionalHeader from "@/components/conditional-header"
import BottomNav from "@/components/bottom-nav"
import { SupabaseProvider } from "@/components/supabase-provider"
import { Dancing_Script } from "next/font/google"
import { Spinner } from "@/components/ui/skeleton"
import { RouteChangeSpinner } from "@/components/route-change-spinner"
import { GlobalLoadingProvider } from "@/components/global-loading-context"
import { ErrorBoundary } from "@/components/error-boundary"
import { Sora } from "next/font/google"




const inter = Inter({ subsets: ["latin"] })
const dancingScript = Dancing_Script({ subsets: ["latin"], weight: ["700"] })
const sora = Sora({ subsets: ["latin"], weight: ["600", "700"] })

export const metadata: Metadata = {
  title: "Eve - Connect with Creators",
  icons: {
    icon: "/favicon.png",
  },
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
        <GlobalLoadingProvider>
          <RouteChangeSpinner />
          <SupabaseProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <ConditionalHeader brandFontClass={sora.className} />
              <ErrorBoundary>
                <main className="px-4 min-h-[calc(100vh-4rem)] pb-20 md:pb-0">{children}</main>
              </ErrorBoundary>
              <BottomNav />
              <Toaster />
            </ThemeProvider>
          </SupabaseProvider>
        </GlobalLoadingProvider>
      </body>
    </html>
  )
}

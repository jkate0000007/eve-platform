"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Users, Crown, Heart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AccountTypePage() {
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    checkUserProfile()
  }, [])

  const checkUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push("/login")
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (profile) {
      setUserProfile(profile)
      // If account type is already set, redirect to dashboard
      if (profile.account_type) {
        router.push("/dashboard")
      }
    }
  }

  const handleAccountTypeSelection = async (accountType: "fan" | "creator") => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login")
        return
      }

      const { error } = await supabase
        .from("profiles")
        .update({ account_type: accountType })
        .eq("id", session.user.id)

      if (error) throw error

      toast({
        title: "Account type set!",
        description: `Welcome as a ${accountType}!`,
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set account type",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!userProfile) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Eve!</CardTitle>
          <CardDescription>
            Choose how you'd like to use the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Fan Option */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Heart className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Fan</h3>
                    <p className="text-muted-foreground text-sm">
                      Subscribe to creators, enjoy exclusive content, and support your favorite creators
                    </p>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Subscribe to creators</li>
                    <li>• Access exclusive content</li>
                    <li>• Send apple gifts</li>
                    <li>• Follow creators</li>
                  </ul>
                  <Button 
                    onClick={() => handleAccountTypeSelection("fan")}
                    disabled={loading}
                    className="w-full"
                    variant="outline"
                  >
                    {loading ? "Setting up..." : "Join as Fan"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Creator Option */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Crown className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Creator</h3>
                    <p className="text-muted-foreground text-sm">
                      Create content, build your audience, and monetize your work
                    </p>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Create and share content</li>
                    <li>• Build your audience</li>
                    <li>• Earn from subscriptions</li>
                    <li>• Receive apple gifts</li>
                  </ul>
                  <Button 
                    onClick={() => handleAccountTypeSelection("creator")}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Setting up..." : "Join as Creator"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Don't worry, you can change this later in your settings!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DebugStorage } from "@/components/debug-storage"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SettingsPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirect=/settings")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Only allow access to debug tools for creators
  const isCreator = profile?.account_type === "creator"

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {isCreator && <TabsTrigger value="developer">Developer</TabsTrigger>}
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account settings and preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Account settings will be added here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Notification settings will be added here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {isCreator && (
          <TabsContent value="developer">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Developer Tools</CardTitle>
                <CardDescription>Advanced tools for creators and developers.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-6">These tools are intended for debugging and troubleshooting purposes.</p>
                <DebugStorage />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

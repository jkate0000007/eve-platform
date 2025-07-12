"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "./ui/use-toast"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { UploadCloud } from "lucide-react"
import type { Database } from "@/lib/database.types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Alert, AlertDescription } from "./ui/alert"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export function ProfileForm({ profile }: { profile: Profile }) {
  const supabase = createClient()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState(profile?.username || "")
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [subscriptionPrice, setSubscriptionPrice] = useState<number>(
    profile?.subscription_price ? Number(profile.subscription_price) : 4.99,
  )
  const [accountType, setAccountType] = useState(profile?.account_type || "fan")
  const [showAccountTypeWarning, setShowAccountTypeWarning] = useState(false)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAvatarFile(e.target.files[0])
    }
  }

  const handleAccountTypeChange = (newAccountType: string) => {
    if (newAccountType !== accountType) {
      setShowAccountTypeWarning(true)
    }
    setAccountType(newAccountType)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let newAvatarUrl = avatarUrl

      // Upload avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop()
        const fileName = `${profile.id}/avatar.${fileExt}`

        const { error: uploadError, data } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile, { upsert: true })

        if (uploadError) throw uploadError

        newAvatarUrl = fileName
      }

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          full_name: fullName,
          bio,
          avatar_url: newAvatarUrl,
          account_type: accountType,
          subscription_price: accountType === "creator" ? subscriptionPrice : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
      
      setShowAccountTypeWarning(false)
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your profile information and how others see you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              {avatarUrl ? (
                <AvatarImage
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarUrl}`}
                  alt={username}
                  className="object-cover "
                />
              ) : null}
              <AvatarFallback>{username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-4">
              <Label
                htmlFor="avatar"
                className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent/40"
              >
                <UploadCloud className="h-4 w-4" />
                <span>{avatarFile ? avatarFile.name : "Upload avatar"}</span>
              </Label>
              <Input id="avatar" type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName || ""}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio || ""}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountType">Account Type</Label>
            <Select value={accountType} onValueChange={handleAccountTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fan">Fan</SelectItem>
                <SelectItem value="creator">Creator</SelectItem>
              </SelectContent>
            </Select>
            {showAccountTypeWarning && (
              <Alert>
                <AlertDescription>
                  <strong>Account type change:</strong> Changing from {profile?.account_type} to {accountType} will affect your access to features. 
                  {profile?.account_type === "creator" && accountType === "fan" && " You'll lose access to creator features like posting content."}
                  {profile?.account_type === "fan" && accountType === "creator" && " You'll gain access to creator features like posting content and setting subscription prices."}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {accountType === "creator" && (
            <div className="space-y-2">
              <Label htmlFor="subscriptionPrice">Subscription Price ($/month)</Label>
              <Input
                id="subscriptionPrice"
                type="number"
                min="0.99"
                step="0.01"
                value={subscriptionPrice}
                onChange={(e) => setSubscriptionPrice(Number(e.target.value))}
                required
              />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

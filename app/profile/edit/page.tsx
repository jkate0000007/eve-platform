"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { profileUpdateSchema } from "@/lib/schemas/profile"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/skeleton"

const COUNTRIES = [
  { code: "NG", name: "Nigeria" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  // add more countries as needed
]

interface ProfileEditProps {
  profile?: {
    username?: string
    bio?: string | null
    avatar_url?: string | null
    country?: string
    date_of_birth?: string
  } | null
}

export default function EditProfilePage({ profile: initialProfile }: ProfileEditProps) {
  const [username, setUsername] = useState(initialProfile?.username || "")
  const [bio, setBio] = useState(initialProfile?.bio || "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialProfile?.avatar_url
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${initialProfile.avatar_url}`
      : null
  )
  const [country, setCountry] = useState(initialProfile?.country || "")
  const [dateOfBirth, setDateOfBirth] = useState(initialProfile?.date_of_birth || "")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Zod validation
    const result = profileUpdateSchema.safeParse({ username, bio })
    if (!result.success) {
      setError(result.error.errors[0].message)
      setLoading(false)
      return
    }

    // Age check (must be 18+)
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - dob.getFullYear()
      const m = today.getMonth() - dob.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--
      }
      if (age < 18) {
        setError("You must be 18 or older")
        setLoading(false)
        return
      }
    }

    // Prepare form data
    const formData = new FormData()
    formData.append("username", username.trim() || initialProfile?.username || "")
    formData.append("bio", bio)
    formData.append("country", country)
    formData.append("date_of_birth", dateOfBirth)
    if (avatarFile) formData.append("avatar", avatarFile)

    // Submit
    const res = await fetch("/api/profile/update", {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || "Something went wrong")
      toast({ title: "Error", description: data.error || "Something went wrong", variant: "destructive" })
      setLoading(false)
      return
    }

    toast({ title: "Profile updated!", description: "Your changes have been saved." })
    window.location.href = "/profile"
  }

  return (
    <div className="container py-10 max-w-xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Link href="/profile" className="text-muted-foreground hover:text-primary transition">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-20 w-20 mb-2">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt={username} className="object-cover" />
                ) : null}
                <AvatarFallback>{username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Input type="file" name="avatar" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <Input name="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Leave blank to keep current" maxLength={32} />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <Input name="bio" value={bio} onChange={e => setBio(e.target.value)} maxLength={160} />
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country-select" className="block text-sm font-medium mb-1">Country</label>
              <select
                id="country-select"
                aria-label="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="">Select a country</option>
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <Input type="date" name="dob" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
            </div>

            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner size={18} /> Saving...
                </span>
              ) : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

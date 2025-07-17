"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Apple as LucideApple } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createAppleGiftCheckout } from "@/app/actions/apple-gift-actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface AppleGiftButtonProps {
  postId: string
  creatorId: string
  creatorUsername: string
  currentUserId?: string
  variant?: "default" | "profile" | "shorts"
  appleCount?: number // for shorts, show count below icon
}

export function AppleGiftButton({ 
  postId, 
  creatorId, 
  creatorUsername, 
  currentUserId,
  variant = "default",
  appleCount
}: AppleGiftButtonProps) {
  const [open, setOpen] = useState(false)
  const [appleCountState, setAppleCount] = useState(1)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [followerCount, setFollowerCount] = useState<number | null>(null)
  const [isEligible, setIsEligible] = useState<boolean | null>(null)
  const supabase = createClient()

  // Fetch follower count on mount to check eligibility
  useEffect(() => {
    async function fetchFollowers() {
      const { count } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("followed_id", creatorId)
      const countValue = count ?? 0
      setFollowerCount(countValue)
      setIsEligible(countValue >= 100)
    }
    fetchFollowers()
  }, [creatorId, supabase])

  // Don't render anything if creator is not eligible
  if (isEligible === false) {
    return null
  }

  // Show loading state while checking eligibility
  if (isEligible === null) {
    return null
  }

  const pricePerApple = 1.44
  const totalPrice = appleCountState * pricePerApple

  const handleSendGift = async () => {
    if (!currentUserId) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname))
      return
    }

    if (appleCountState < 1) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid number of apples",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await createAppleGiftCheckout(postId, creatorId, appleCountState)
      if (result.success && result.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = result.checkoutUrl
      } else {
        throw new Error(result.error || "Failed to create checkout session")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send apple gift",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Different styling for profile vs post context
  let buttonVariant = "ghost"
  let buttonSize = "sm"
  let buttonClassName = "flex items-center gap-1 text-red-500 hover:text-red-600"
  if (variant === "profile") {
    buttonVariant = "outline"
    buttonSize = "default"
    buttonClassName = "w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
  } else if (variant === "shorts") {
    buttonVariant = "ghost"
    buttonSize = "icon"
    buttonClassName = `rounded-full shadow-md transition-colors flex items-center justify-center w-14 h-14
      ${open ? "bg-red-600 text-white" : "bg-white text-red-500 hover:bg-red-100"}`
  }

  if (variant === "shorts") {
    return (
      <div className="flex flex-col items-center">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="bg-transparent border-none p-0 m-0 focus:outline-none"
              title="Send Apple Gift"
            >
              <LucideApple className={`h-8 w-8 transition-colors fill-current ${open ? "text-pink-700" : "text-white"}`} />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Send Apples to @{creatorUsername}</DialogTitle>
              <DialogDescription>
                Send apples to {creatorUsername} to show your appreciation! Each apple costs ${pricePerApple.toFixed(2)}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appleCount">Number of Apples</Label>
                <Input
                  id="appleCount"
                  type="number"
                  min="1"
                  max="100"
                  value={appleCountState}
                  onChange={(e) => setAppleCount(Math.max(1, Number.parseInt(e.target.value) || 1))}
                />
              </div>
              <div className="text-center p-4 bg-muted rounded-md">
                <div className="flex items-center justify-center gap-2 text-lg font-medium">
                  <LucideApple className="h-5 w-5 text-red-500" />
                  <span>
                    {appleCountState} Apple{appleCountState > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Total: ${totalPrice.toFixed(2)}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendGift} disabled={loading} className="bg-red-600 hover:bg-red-700">
                {loading ? "Processing..." : `Send - $${totalPrice.toFixed(2)}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <span className="text-sm font-semibold mt-1 text-white drop-shadow">{appleCount && appleCount > 0 ? appleCount : ""}</span>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={buttonVariant as any} 
          size={buttonSize as any} 
          className={buttonClassName}
        >
          {variant === "profile" && <span>Send Apple </span>}
          {variant === "default" && <span>Gift</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Apples to @{creatorUsername}</DialogTitle>
          <DialogDescription>
            {variant === "profile" 
              ? `Show your appreciation for ${creatorUsername} by sending apples! Each apple costs $${pricePerApple.toFixed(2)} and goes directly to the creator.`
              : `Send apples to ${creatorUsername} to show your appreciation! Each apple costs $${pricePerApple.toFixed(2)}.`
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appleCount">Number of Apples</Label>
            <Input
              id="appleCount"
              type="number"
              min="1"
              max="100"
              value={appleCountState}
              onChange={(e) => setAppleCount(Math.max(1, Number.parseInt(e.target.value) || 1))}
            />
          </div>
          <div className="text-center p-4 bg-muted rounded-md">
            <div className="flex items-center justify-center gap-2 text-lg font-medium">
              <LucideApple className="h-5 w-5 text-red-500" />
              <span>
                {appleCountState} Apple{appleCountState > 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Total: ${totalPrice.toFixed(2)}</p>
          </div>
          {variant === "profile" && (
            <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
              💡 <strong>Tip:</strong> Apple gifts are a great way to show support even if you're not ready to subscribe!
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendGift} disabled={loading} className="bg-red-600 hover:bg-red-700">
            {loading ? "Processing..." : `Send Gift - $${totalPrice.toFixed(2)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

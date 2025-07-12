"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Apple } from "lucide-react"
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

interface AppleGiftButtonProps {
  postId: string
  creatorId: string
  creatorUsername: string
  currentUserId?: string
  variant?: "default" | "profile" | "shorts"
}

export function AppleGiftButton({ 
  postId, 
  creatorId, 
  creatorUsername, 
  currentUserId,
  variant = "default"
}: AppleGiftButtonProps) {
  const [open, setOpen] = useState(false)
  const [appleCount, setAppleCount] = useState(1)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const pricePerApple = 1.44
  const totalPrice = appleCount * pricePerApple

  const handleSendGift = async () => {
    if (!currentUserId) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname))
      return
    }

    if (appleCount < 1) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid number of apples",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await createAppleGiftCheckout(postId, creatorId, appleCount)
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
    buttonClassName = `rounded-full shadow-md transition-colors flex flex-col items-center justify-center w-12 h-12
      ${open ? "bg-red-600 text-white" : "bg-white text-red-500 hover:bg-red-100"}`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={buttonVariant as any} 
          size={buttonSize as any} 
          className={buttonClassName}
        >
          <Apple className={variant === "shorts" ? "h-6 w-6" : "h-4 w-4"} />
          {variant === "profile" && <span>Send Apple </span>}
          {variant === "default" && <span>Gift</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Apple Gift to @{creatorUsername}</DialogTitle>
          <DialogDescription>
            {variant === "profile" 
              ? `Show your appreciation for ${creatorUsername} by sending apple gifts! Each apple costs $${pricePerApple.toFixed(2)} and goes directly to the creator.`
              : `Send apple gifts to ${creatorUsername} to show your appreciation! Each apple costs $${pricePerApple.toFixed(2)}.`
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
              value={appleCount}
              onChange={(e) => setAppleCount(Math.max(1, Number.parseInt(e.target.value) || 1))}
            />
          </div>
          <div className="text-center p-4 bg-muted rounded-md">
            <div className="flex items-center justify-center gap-2 text-lg font-medium">
              <Apple className="h-5 w-5 text-red-500" />
              <span>
                {appleCount} Apple{appleCount > 1 ? "s" : ""}
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

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createSubscriptionCheckout, cancelSubscription } from "@/app/actions/subscription-actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface SubscribeButtonProps {
  creatorId: string
  isSubscribed: boolean
  price: number
  currentUserId?: string
  subscriptionId?: string
}

export function SubscribeButton({
  creatorId,
  isSubscribed,
  price,
  currentUserId,
  subscriptionId,
}: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubscribe = async () => {
    if (!currentUserId) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname))
      return
    }

    setLoading(true)
    try {
      if (isSubscribed && subscriptionId) {
        // Cancel subscription
        const result = await cancelSubscription(subscriptionId)
        if (result.success) {
          toast({
            title: "Subscription canceled",
            description: "Your subscription has been canceled successfully",
          })
          // Refresh the page to update the UI
          window.location.reload()
        } else {
          throw new Error(result.error)
        }
      } else {
        // Create subscription checkout
        const result = await createSubscriptionCheckout(creatorId)
        if (result.success && result.checkoutUrl) {
          // Redirect to Stripe Checkout
          window.location.href = result.checkoutUrl
        } else {
          throw new Error(result.error || "Failed to create checkout session")
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process subscription",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleSubscribe} disabled={loading} className="w-full">
      {loading ? "Processing..." : isSubscribed ? "Cancel Subscription" : `Subscribe for $${price.toFixed(2)}/month`}
    </Button>
  )
}

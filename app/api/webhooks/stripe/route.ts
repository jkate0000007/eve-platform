import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createClient()

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object
        const metadata = session.metadata

        if (metadata?.type === "apple_gift") {
          // Handle apple gift payment
          await supabase.from("apple_gifts").insert({
            sender_id: metadata.sender_id,
            creator_id: metadata.creator_id,
            post_id: metadata.post_id,
            amount: Number.parseInt(metadata.apple_count),
            price_per_apple: Number.parseFloat(metadata.price_per_apple),
            total_amount: Number.parseFloat(metadata.total_amount),
            currency: "usd",
            status: "completed",
          })
        } else if (metadata?.creator_id && metadata?.subscriber_id) {
          // Handle subscription payment
          await supabase.from("subscriptions").insert({
            subscriber_id: metadata.subscriber_id,
            creator_id: metadata.creator_id,
            status: "active",
          })

          // Create transaction record
          await supabase.from("transactions").insert({
            subscriber_id: metadata.subscriber_id,
            creator_id: metadata.creator_id,
            amount: session.amount_total! / 100, // Convert from cents
            currency: session.currency || "usd",
            status: "completed",
            payment_method: "stripe",
          })
        }
        break

      case "customer.subscription.deleted":
        // Handle subscription cancellation
        const subscription = event.data.object
        // Update subscription status in database
        // You would need to store the Stripe subscription ID to match this
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

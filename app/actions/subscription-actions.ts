"use server"

import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"

export async function createSubscriptionCheckout(creatorId: string, priceId?: string) {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      success: false,
      error: "You must be logged in to subscribe",
    }
  }

  const userId = session.user.id

  try {
    // Get creator details
    const { data: creator } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", creatorId)
      .eq("account_type", "creator")
      .single()

    if (!creator) {
      return {
        success: false,
        error: "Creator not found",
      }
    }

    // Get user details
    const { data: user } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (!user) {
      return {
        success: false,
        error: "User not found",
      }
    }

    // Create or get Stripe customer
    let customerId: string
    const existingCustomers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id
    } else {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        name: user.full_name || user.username,
        metadata: {
          supabase_user_id: userId,
        },
      })
      customerId = customer.id
    }

    // Create or get Stripe price
    let stripePriceId: string
    if (priceId) {
      stripePriceId = priceId
    } else {
      // First create a product
      const product = await stripe.products.create({
        name: `Subscription to ${creator.username}`,
        description: `Monthly subscription to ${creator.username}'s exclusive content`,
        metadata: {
          creator_id: creatorId,
          creator_username: creator.username,
        },
      })

      // Then create a price for this product
      const price = await stripe.prices.create({
        unit_amount: Math.round((creator.subscription_price || 4.99) * 100), // Convert to cents
        currency: "usd",
        recurring: {
          interval: "month",
        },
        product: product.id,
        metadata: {
          creator_id: creatorId,
          creator_username: creator.username,
        },
      })
      stripePriceId = price.id
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/creator/${creator.username}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/creator/${creator.username}?canceled=true`,
      metadata: {
        creator_id: creatorId,
        subscriber_id: userId,
        creator_username: creator.username,
      },
    })

    if (!checkoutSession.url) {
      return {
        success: false,
        error: "Failed to create checkout session",
      }
    }

    return {
      success: true,
      checkoutUrl: checkoutSession.url,
    }
  } catch (error: any) {
    console.error("Subscription checkout error:", error)
    return {
      success: false,
      error: error.message || "Failed to create subscription checkout",
    }
  }
}

export async function cancelSubscription(subscriptionId: string) {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      success: false,
      error: "You must be logged in to cancel subscription",
    }
  }

  try {
    // Get subscription from database
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", subscriptionId)
      .eq("subscriber_id", session.user.id)
      .single()

    if (!subscription) {
      return {
        success: false,
        error: "Subscription not found",
      }
    }

    // Cancel in Stripe (if we have a Stripe subscription ID)
    // For now, we'll just update the status in our database
    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId)

    if (error) throw error

    return {
      success: true,
    }
  } catch (error: any) {
    console.error("Cancel subscription error:", error)
    return {
      success: false,
      error: error.message || "Failed to cancel subscription",
    }
  }
}

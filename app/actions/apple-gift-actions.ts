"use server"

import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"

export async function createAppleGiftCheckout(postId: string, creatorId: string, appleCount: number) {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      success: false,
      error: "You must be logged in to send apple gifts",
    }
  }

  const userId = session.user.id

  try {
    // Get creator and post details
    const { data: creator } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", creatorId)
      .eq("account_type", "creator")
      .single()

    const { data: post } = await supabase.from("posts").select("*").eq("id", postId).single()

    if (!creator || !post) {
      return {
        success: false,
        error: "Creator or post not found",
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

    // Apple pricing: $1.44 per apple
    const pricePerApple = 1.44
    const totalAmount = appleCount * pricePerApple

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

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${appleCount} Apple${appleCount > 1 ? "s" : ""} for ${creator.username}`,
            },
            unit_amount: Math.round(totalAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/creator/${creator.username}?apple_gift=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/creator/${creator.username}?apple_gift=canceled`,
      metadata: {
        type: "apple_gift",
        post_id: postId,
        creator_id: creatorId,
        sender_id: userId,
        apple_count: appleCount.toString(),
        price_per_apple: pricePerApple.toString(),
        total_amount: totalAmount.toString(),
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
    console.error("Apple gift checkout error:", error)
    return {
      success: false,
      error: error.message || "Failed to create apple gift checkout",
    }
  }
}

export async function getCreatorAppleGifts(creatorId: string) {
  const supabase = createClient()

  try {
    // Get all apple gifts for the creator
    const { data: gifts, error } = await supabase
      .from("apple_gifts")
      .select("*, sender:profiles!sender_id(*)")
      .eq("creator_id", creatorId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })

    if (error) throw error

    // Calculate totals
    const totalApples = gifts?.reduce((sum, gift) => sum + gift.amount, 0) || 0
    const totalAmount = gifts?.reduce((sum, gift) => sum + Number(gift.total_amount), 0) || 0
    const redeemableApples = totalApples // For now, all apples are redeemable

    return {
      success: true,
      data: {
        gifts: gifts || [],
        totalApples,
        totalAmount: totalAmount.toFixed(2),
        redeemableApples,
      },
    }
  } catch (error: any) {
    console.error("Error fetching apple gifts:", error)
    return {
      success: false,
      error: error.message || "Failed to fetch apple gifts",
      data: null,
    }
  }
}

export async function redeemApples(creatorId: string, appleCount: number) {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session || session.user.id !== creatorId) {
    return {
      success: false,
      error: "Unauthorized",
    }
  }

  try {
    // Calculate redemption amount (creators get $1.00 per apple)
    const redemptionRate = 1.0
    const amount = appleCount * redemptionRate

    // Create redemption record
    const { error } = await supabase.from("apple_redemptions").insert({
      creator_id: creatorId,
      apple_count: appleCount,
      amount,
      currency: "usd",
      status: "pending",
      payout_method: "stripe", // Default to Stripe
    })

    if (error) throw error

    return {
      success: true,
    }
  } catch (error: any) {
    console.error("Apple redemption error:", error)
    return {
      success: false,
      error: error.message || "Failed to redeem apples",
    }
  }
}

"use server"

import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

interface CheckoutSessionParams {
  priceId: string
  customerEmail: string
  metadata?: Record<string, string>
}

export async function createCheckoutSession({
  priceId,
  customerEmail,
  metadata = {},
}: CheckoutSessionParams) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      metadata: {
        ...metadata,
        source: "trainer_dashboard",
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?product=${metadata.productId}`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      subscription_data: {
        metadata: {
          ...metadata,
        },
      },
    })

    return { url: session.url, sessionId: session.id }
  } catch (error: any) {
    console.error("Stripe checkout error:", error)
    throw new Error(error.message || "Failed to create checkout session")
  }
}

export async function getCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer", "subscription"],
    })
    return session
  } catch (error: any) {
    console.error("Failed to retrieve checkout session:", error)
    throw new Error(error.message || "Failed to retrieve checkout session")
  }
}

export async function createCustomerPortalSession(customerId: string) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing`,
    })

    return { url: session.url }
  } catch (error: any) {
    console.error("Failed to create customer portal session:", error)
    throw new Error(error.message || "Failed to create customer portal session")
  }
}

// For embedded checkout
export async function startCheckoutSession(
  productId: string,
  metadata?: {
    email?: string
    password?: string
    name?: string
    plan?: string
  }
) {
  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      redirect_on_completion: "never",
      customer_email: metadata?.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productId,
              description: `GoodRunss ${productId} Plan`,
            },
            unit_amount: 2999, // $29.99 default
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        plan: metadata?.plan || productId,
        name: metadata?.name || "",
        email: metadata?.email || "",
      },
    })

    return session.client_secret
  } catch (error: any) {
    console.error("Stripe checkout error:", error)
    throw new Error(error.message || "Failed to create checkout session")
  }
}



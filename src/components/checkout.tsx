"use client"

import { useCallback, useEffect, useState } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { startCheckoutSession } from "@/app/actions/stripe"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function Checkout({ productId }: { productId: string }) {
  const [metadata, setMetadata] = useState<{
    email?: string
    password?: string
    name?: string
    plan?: string
  }>({})

  useEffect(() => {
    // Get user info from localStorage (set during signup)
    if (typeof window !== 'undefined') {
      setMetadata({
        email: localStorage.getItem("trainer_email") || undefined,
        password: localStorage.getItem("trainer_password") || undefined,
        name: localStorage.getItem("trainer_name") || undefined,
        plan: localStorage.getItem("selected_plan") || productId,
      })
    }
  }, [productId])

  const startCheckoutSessionForProduct = useCallback(async () => {
    const clientSecret = await startCheckoutSession(productId, metadata)
    if (!clientSecret) {
      throw new Error("Failed to create checkout session")
    }
    return clientSecret
  }, [productId, metadata])

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret: startCheckoutSessionForProduct }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}

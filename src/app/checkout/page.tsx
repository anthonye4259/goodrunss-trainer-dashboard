"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { products } from "@/lib/products"
import { Loader2, CreditCard, Lock, Check } from 'lucide-react'
import { createCheckoutSession } from "@/app/actions/stripe"

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get("product")
  const product = products.find((p) => p.id === productId)

  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push("/")} className="bg-primary hover:bg-primary/90 text-black">
            Go Back
          </Button>
        </Card>
      </div>
    )
  }

  const handleCheckout = async () => {
    if (!email || !name || !agreeToTerms) {
      return
    }

    setLoading(true)
    try {
      const result = await createCheckoutSession({
        priceId: product.priceId,
        customerEmail: email,
        metadata: {
          productId: product.id,
          customerName: name,
        },
      })

      if (result.url) {
        window.location.href = result.url
      } else {
        console.error("No checkout URL returned")
        setLoading(false)
      }
    } catch (error) {
      console.error("Checkout error:", error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-muted-foreground hover:text-white"
        >
          ← Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="p-6 border-2 border-border bg-card/50 backdrop-blur-sm h-fit">
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b border-border">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{product.emoji}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                </div>
              </div>

              <div className="space-y-3 py-4">
                <h4 className="font-semibold text-white mb-2">What's Included:</h4>
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${product.price}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-white pt-2">
                  <span>Total</span>
                  <span>${product.price}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Billed {product.interval === "month" ? "monthly" : "yearly"}
                </p>
              </div>
            </div>
          </Card>

          {/* Payment Form */}
          <Card className="p-6 border-2 border-border bg-card/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-6">Payment Details</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex items-start gap-2 pt-4">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                >
                  I agree to the terms of service and privacy policy
                </label>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={loading || !email || !name || !agreeToTerms}
                className="w-full bg-primary hover:bg-primary/90 text-black h-12 text-base font-semibold mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Complete Purchase
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-4">
                <Lock className="h-3 w-3" />
                <span>Secure checkout powered by Stripe</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}





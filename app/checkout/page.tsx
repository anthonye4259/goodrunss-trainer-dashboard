"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2 } from "lucide-react"
import Checkout from "@/components/checkout"

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const plan = localStorage.getItem("selected_plan")
    if (!plan) {
      router.push("/signup")
      return
    }
    setSelectedPlan(plan)
  }, [router])

  const handlePaymentSuccess = () => {
    setIsProcessing(true)
    setTimeout(() => {
      localStorage.setItem("trainer_authenticated", "true")
      router.push("/onboarding")
    }, 2000)
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const planDetails = {
    basic: { name: "Basic", price: "$29/mo", features: ["Up to 25 clients", "Basic analytics", "Email support"] },
    pro: {
      name: "Pro",
      price: "$79/mo",
      features: ["Up to 100 clients", "Advanced analytics", "Priority support", "AI insights"],
    },
    enterprise: {
      name: "Enterprise",
      price: "$149/mo",
      features: ["Unlimited clients", "Custom analytics", "24/7 support", "White-label"],
    },
  }

  const plan = planDetails[selectedPlan as keyof typeof planDetails]

  return (
    <div className="min-h-screen flex items-center justify-center bg-background grid-pattern p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>

      <div className="w-full max-w-4xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">
              Early Access • <span className="text-primary">Limited Availability</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Join now to secure your spot</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <Card className="glass border-border/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your selected plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-border/50">
                  <div>
                    <h3 className="text-xl font-bold">{plan.name} Plan</h3>
                    <p className="text-sm text-muted-foreground">Billed monthly</p>
                  </div>
                  <div className="text-2xl font-bold gradient-text">{plan.price}</div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold">Included features:</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-border/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{plan.price}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border/50">
                    <span>Due today</span>
                    <span className="gradient-text">{plan.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2">
                    Your subscription will renew automatically each month. Cancel anytime from your dashboard.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="glass border-border/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Enter your payment information</CardDescription>
            </CardHeader>
            <CardContent>
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Processing your payment...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <Checkout productId={selectedPlan} />
                  <Button
                    onClick={handlePaymentSuccess}
                    className="w-full bg-gradient-to-r from-primary via-accent to-primary text-black font-semibold h-12"
                  >
                    Complete Purchase
                  </Button>
                  <div className="space-y-2 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-semibold text-center">Secure Payment</p>
                    <p className="text-xs text-center text-muted-foreground">
                      Your payment information is encrypted and secure. Cancel your subscription anytime from your
                      dashboard.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

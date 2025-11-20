"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Sparkles, CreditCard, Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Subscription {
  id: string
  planName: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  trialStart: string | null
  trialEnd: string | null
  cancelAtPeriodEnd: boolean
  canceledAt: string | null
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCanceling, setIsCanceling] = useState(false)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/subscription")
      const data = await response.json()
      if (data.success) {
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    setIsCanceling(true)
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
      })

      const data = await response.json()
      if (data.success) {
        fetchSubscription()
        alert("Subscription canceled successfully. You'll have access until the end of your trial period.")
      } else {
        alert(data.error || "Failed to cancel subscription")
      }
    } catch (error) {
      console.error("Cancel subscription error:", error)
      alert("Failed to cancel subscription. Please try again.")
    } finally {
      setIsCanceling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
            <p className="text-muted-foreground mt-2">Manage your subscription and billing</p>
          </div>

          <Card className="glass border-border/50 backdrop-blur-xl p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Subscription</h3>
            <p className="text-muted-foreground mb-6">
              You don't have an active subscription yet.
            </p>
            <Button>Start Free Trial</Button>
          </Card>
        </div>
      </div>
    )
  }

  const isTrialing = subscription.status === "trialing"
  const daysLeft = subscription.trialEnd
    ? Math.ceil(
        (new Date(subscription.trialEnd).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="text-muted-foreground mt-2">Manage your subscription and billing</p>
        </div>

        {/* Subscription Status Card */}
        <Card className="glass border-border/50 backdrop-blur-xl p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  {isTrialing ? (
                    <Clock className="h-6 w-6 text-primary" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{subscription.planName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={subscription.status === "active" || subscription.status === "trialing" ? "default" : "secondary"}
                    >
                      {subscription.status === "trialing" ? "Free Trial" : subscription.status}
                    </Badge>
                    {subscription.cancelAtPeriodEnd && (
                      <Badge variant="outline" className="border-red-500/30 text-red-400">
                        Canceling
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                {isTrialing && subscription.trialEnd && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Trial Period
                    </p>
                    <p className="font-semibold">
                      {daysLeft > 0 ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining` : "Ends today"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ends {new Date(subscription.trialEnd).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {isTrialing ? "First Charge" : "Next Billing Date"}
                  </p>
                  <p className="font-semibold">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                  {isTrialing && (
                    <p className="text-xs text-muted-foreground">
                      Card will be charged when trial ends
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Method
                  </p>
                  <p className="font-semibold">Card on file</p>
                  <p className="text-xs text-muted-foreground">Managed via Stripe</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions Card */}
        <Card className="glass border-border/50 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Manage Subscription</h3>
          <div className="space-y-4">
            {!subscription.cancelAtPeriodEnd ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>
                        {isTrialing
                          ? "Your free trial will be canceled and you won't be charged."
                          : "You'll keep access until the end of your current billing period."}
                      </p>
                      <p>
                        {isTrialing
                          ? `You'll have access until ${new Date(subscription.trialEnd!).toLocaleDateString()}`
                          : `Access until ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelSubscription} disabled={isCanceling}>
                      {isCanceling ? "Canceling..." : "Cancel Subscription"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <div className="bg-muted/50 border border-border/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Subscription Canceled</p>
                    <p className="text-sm text-muted-foreground">
                      You'll have access until{" "}
                      {isTrialing && subscription.trialEnd
                        ? new Date(subscription.trialEnd).toLocaleDateString()
                        : new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Need to update your payment method or billing details?{" "}
                <a href="#" className="text-primary hover:underline">
                  Manage via Stripe
                </a>
              </p>
            </div>
          </div>
        </Card>

        {/* Features Card */}
        <Card className="glass border-border/50 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Your Plan Includes</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Unlimited clients",
              "AI Session Plan Generator (Gia)",
              "Auto CRM Document Parser",
              "Client Lead Matching",
              "Advanced analytics & insights",
              "Priority support",
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}


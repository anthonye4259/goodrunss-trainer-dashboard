"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Check,
  CreditCard,
  Zap,
  Crown,
  Rocket,
  Sparkles,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "forever",
    icon: Sparkles,
    features: [
      "Up to 5 clients",
      "Basic booking system",
      "3 GIA queries per day",
      "Email support",
      "Basic analytics"
    ],
    limits: {
      clients: 5,
      giaQueries: 3,
      aiPersonas: 0,
      workoutPlans: 0
    }
  },
  {
    id: "starter",
    name: "Starter",
    price: 19,
    interval: "month",
    icon: Zap,
    features: [
      "Up to 20 clients",
      "Full booking system",
      "10 GIA queries per day",
      "1 AI Persona",
      "2 AI workout plans/month",
      "Priority email support",
      "Advanced analytics"
    ],
    limits: {
      clients: 20,
      giaQueries: 10,
      aiPersonas: 1,
      workoutPlans: 2
    }
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    interval: "month",
    icon: Crown,
    popular: true,
    features: [
      "Up to 100 clients",
      "Full booking system",
      "50 GIA queries per day",
      "10 AI Personas",
      "10 AI workout plans/month",
      "5% booking discount",
      "Priority support",
      "Google Calendar sync",
      "Custom branding"
    ],
    limits: {
      clients: 100,
      giaQueries: 50,
      aiPersonas: 10,
      workoutPlans: 10
    }
  },
  {
    id: "elite",
    name: "Elite",
    price: 99,
    interval: "month",
    icon: Rocket,
    features: [
      "Unlimited clients",
      "Full booking system",
      "Unlimited GIA queries",
      "Unlimited AI Personas",
      "Unlimited AI workout plans",
      "15% booking discount",
      "24/7 priority support",
      "White-label options",
      "API access",
      "Dedicated account manager"
    ],
    limits: {
      clients: null,
      giaQueries: 999999,
      aiPersonas: 999999,
      workoutPlans: 999999
    }
  }
]

export default function BillingPage() {
  const { language } = useLanguage()
  const [currentPlan, setCurrentPlan] = useState<string>("free")
  const [usage, setUsage] = useState({
    clients: 2,
    giaQueries: 1,
    aiPersonas: 0,
    workoutPlans: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  useEffect(() => {
    // Fetch current subscription status
    fetchSubscriptionStatus()
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch("/api/subscriptions/status?userId=current-user-id")
      const data = await response.json()
      
      if (data.success && data.subscription) {
        setCurrentPlan(data.plan.name)
        // Set usage from API
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
    }
  }

  const handleSubscribe = async (planId: string) => {
    if (planId === "free") {
      toast.info("You're already on the free plan")
      return
    }

    if (planId === currentPlan) {
      toast.info("This is your current plan")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/subscriptions/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "current-user-id", // Replace with actual user ID
          userEmail: "user@example.com", // Replace with actual email
          planName: planId,
          billingCycle
        })
      })

      const data = await response.json()

      if (data.success && data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl
      } else {
        toast.error(data.error || "Failed to start subscription")
      }
    } catch (error) {
      console.error("Subscription error:", error)
      toast.error("Failed to start subscription")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return

    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "current-user-id",
          cancelImmediately: false
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
      } else {
        toast.error(data.error || "Failed to cancel subscription")
      }
    } catch (error) {
      toast.error("Failed to cancel subscription")
    }
  }

  const currentPlanConfig = plans.find(p => p.id === currentPlan)

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 ml-0 md:ml-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-lg opacity-75" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg glow-primary">
                <CreditCard className="w-6 h-6 text-background" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Subscription & Billing
              </h1>
              <p className="text-muted-foreground">Manage your subscription and view usage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Plan Card */}
      {currentPlanConfig && (
        <Card className="glass-card hover-lift border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <currentPlanConfig.icon className="w-6 h-6 text-background" />
                </div>
                <div>
                  <CardTitle>Current Plan: {currentPlanConfig.name}</CardTitle>
                  <CardDescription>
                    ${currentPlanConfig.price}/{currentPlanConfig.interval}
                  </CardDescription>
                </div>
              </div>
              {currentPlan !== "free" && (
                <Button variant="outline" onClick={handleCancelSubscription}>
                  Cancel Plan
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Usage Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Clients</div>
                <div className="text-2xl font-bold">
                  {usage.clients}
                  {currentPlanConfig.limits.clients && (
                    <span className="text-sm text-muted-foreground">
                      /{currentPlanConfig.limits.clients}
                    </span>
                  )}
                </div>
                {currentPlanConfig.limits.clients && (
                  <Progress 
                    value={(usage.clients / currentPlanConfig.limits.clients) * 100} 
                    className="h-1 mt-2"
                  />
                )}
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">GIA Queries Today</div>
                <div className="text-2xl font-bold">
                  {usage.giaQueries}
                  <span className="text-sm text-muted-foreground">
                    /{currentPlanConfig.limits.giaQueries}
                  </span>
                </div>
                <Progress 
                  value={(usage.giaQueries / currentPlanConfig.limits.giaQueries) * 100} 
                  className="h-1 mt-2"
                />
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">AI Personas</div>
                <div className="text-2xl font-bold">
                  {usage.aiPersonas}
                  {currentPlanConfig.limits.aiPersonas !== 999999 && (
                    <span className="text-sm text-muted-foreground">
                      /{currentPlanConfig.limits.aiPersonas}
                    </span>
                  )}
                </div>
                {currentPlanConfig.limits.aiPersonas !== 999999 && (
                  <Progress 
                    value={(usage.aiPersonas / currentPlanConfig.limits.aiPersonas) * 100} 
                    className="h-1 mt-2"
                  />
                )}
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Workout Plans</div>
                <div className="text-2xl font-bold">
                  {usage.workoutPlans}
                  {currentPlanConfig.limits.workoutPlans !== 999999 && (
                    <span className="text-sm text-muted-foreground">
                      /{currentPlanConfig.limits.workoutPlans}
                    </span>
                  )}
                </div>
                {currentPlanConfig.limits.workoutPlans !== 999999 && (
                  <Progress 
                    value={(usage.workoutPlans / currentPlanConfig.limits.workoutPlans) * 100} 
                    className="h-1 mt-2"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant={billingCycle === "monthly" ? "default" : "outline"}
          onClick={() => setBillingCycle("monthly")}
        >
          Monthly
        </Button>
        <Button
          variant={billingCycle === "yearly" ? "default" : "outline"}
          onClick={() => setBillingCycle("yearly")}
        >
          Yearly <Badge className="ml-2">Save 20%</Badge>
        </Button>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon
          const isCurrentPlan = plan.id === currentPlan
          const displayPrice = billingCycle === "yearly" && plan.price > 0 
            ? Math.floor(plan.price * 12 * 0.8) 
            : plan.price

          return (
            <Card
              key={plan.id}
              className={cn(
                "glass-card hover-lift relative",
                plan.popular && "ring-2 ring-primary shadow-lg shadow-primary/20",
                isCurrentPlan && "border-primary/50"
              )}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-primary">
                    ${displayPrice}
                  </span>
                  <span className="text-muted-foreground">
                    /{billingCycle === "yearly" ? "year" : plan.interval}
                  </span>
                </div>
                {billingCycle === "yearly" && plan.price > 0 && (
                  <div className="text-sm text-muted-foreground">
                    ${plan.price}/month billed annually
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan || isLoading}
                  className={cn(
                    "w-full",
                    plan.popular && "bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary"
                  )}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      {plan.id === "free" ? "Downgrade" : "Upgrade"}
                      <TrendingUp className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* FAQ / Info */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Billing Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p>Cancel anytime, no long-term contracts</p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p>14-day free trial on paid plans</p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p>Secure payments processed by Stripe</p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p>Pro-rated upgrades and downgrades</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

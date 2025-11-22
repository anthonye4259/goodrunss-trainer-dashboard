'use client'

import { useState, useEffect } from 'react'
import { useSignUp, useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, AlertCircle, Loader2, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const { user, isLoaded: userLoaded } = useUser()
  const [step, setStep] = useState<"account" | "plan">("account")
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (userLoaded && user) {
      window.location.href = "/dashboard"
    }
  }, [userLoaded, user])

  const handleAccountCreation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    setError('')
    setIsLoading(true)

    try {
      // Create Clerk account
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || businessName,
      })

      // If email verification is disabled, account is created immediately
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        // Move to plan selection step
        setStep("plan")
      } else {
        // If verification is required (shouldn't happen with current settings)
        setError("Email verification required. Please check Clerk settings.")
      }
    } catch (err: any) {
      console.error(err)
      setError(err.errors?.[0]?.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlanSelection = async (planId: string) => {
    setIsLoading(true)
    try {
      // Store business name in localStorage for later
      localStorage.setItem("trainer_business", businessName)
      localStorage.setItem("selected_plan", planId)

      // Create Stripe Checkout session with 7-day trial
      const response = await fetch("/api/create-trial-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: `${name} (${businessName})`,
          planId,
        }),
      })

      const data = await response.json()

      if (data.success && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Failed to create checkout session")
      }
    } catch (error: any) {
      console.error("Plan selection error:", error)
      setError("Failed to start trial. Please try again.")
      setIsLoading(false)
    }
  }

  // PLAN SELECTION SCREEN
  if (step === "plan") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] opacity-50"></div>

        <div className="w-full max-w-5xl relative z-10 space-y-8">
          <div className="text-center space-y-6">
            {/* GoodRunss Logo */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary rounded-2xl blur-xl opacity-50"></div>
                <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-2xl">
                  <Zap className="h-10 w-10 text-black fill-black" />
                </div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 mb-4">
                <Sparkles className="h-4 w-4 text-green-400" />
                <span className="text-sm font-bold text-green-400">7-Day Free Trial • No Charge Until Trial Ends</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                Start Your <span className="text-primary">Free Trial</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Enter your card • Cancel anytime before trial ends • Full access immediately
              </p>
            </div>
            
            <div className="inline-flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">
                  <span className="text-primary">Early Access Pricing</span> • Limited Time Offer
                </span>
              </div>
              <p className="text-xs text-muted-foreground max-w-md">
                🔒 Lock in this rate forever — prices will <span className="font-semibold text-primary">never increase</span> for early users
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive max-w-md mx-auto">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {/* 6 Month Plan */}
            <Card className="border-border/50 backdrop-blur-xl p-6 space-y-6 hover:border-primary/50 transition-colors">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">6 Months</h3>
                <p className="text-sm text-muted-foreground">Best for trying it out</p>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-bold text-primary">$75</div>
                <div className="text-sm text-muted-foreground">paid upfront • $12.50/month</div>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Unlimited clients
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  AI Session Plan Generator
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Auto CRM Document Parser
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Client Lead Matching
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Advanced analytics & insights
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Priority support
                </li>
              </ul>
              <Button 
                onClick={() => handlePlanSelection("6-month")} 
                variant="outline" 
                className="w-full h-12"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Start 7-Day Free Trial →"}
              </Button>
            </Card>

            {/* 3 Month Plan - MOST POPULAR */}
            <Card className="border-2 border-primary backdrop-blur-xl p-6 space-y-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="bg-primary text-black px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">3 Months</h3>
                <p className="text-sm text-muted-foreground">Perfect to get started</p>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-bold text-primary">$40</div>
                <div className="text-sm text-muted-foreground">paid upfront • $13.33/month</div>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Unlimited clients
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  AI Session Plan Generator
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Auto CRM Document Parser
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Client Lead Matching
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Advanced analytics & insights
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Priority support
                </li>
              </ul>
              <Button
                onClick={() => handlePlanSelection("3-month")}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Start 7-Day Free Trial →"}
              </Button>
            </Card>

            {/* 1 Month Plan */}
            <Card className="border-border/50 backdrop-blur-xl p-6 space-y-6 hover:border-primary/50 transition-colors">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">1 Month</h3>
                <p className="text-sm text-muted-foreground">Most flexible option</p>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-bold text-primary">$15</div>
                <div className="text-sm text-muted-foreground">paid monthly</div>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Unlimited clients
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  AI Session Plan Generator
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Auto CRM Document Parser
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Client Lead Matching
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Advanced analytics & insights
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Priority support
                </li>
              </ul>
              <Button 
                onClick={() => handlePlanSelection("1-month")} 
                variant="outline" 
                className="w-full h-12"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Start 7-Day Free Trial →"}
              </Button>
            </Card>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ACCOUNT CREATION SCREEN
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] opacity-50"></div>

      <Card className="w-full max-w-md relative z-10 border-border/50 backdrop-blur-xl bg-card/50 shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-lg">
              <Zap className="h-10 w-10 text-black fill-black" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Join <span className="text-primary">GoodRunss</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Start your 7-day free trial today
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleAccountCreation} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 bg-secondary/30 border-border/50 focus:border-primary focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="trainer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 bg-secondary/30 border-border/50 focus:border-primary focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={isLoading}
                className="h-11 bg-secondary/30 border-border/50 focus:border-primary focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name (Optional)</Label>
              <Input
                id="businessName"
                type="text"
                placeholder="Your Training Business"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                disabled={isLoading}
                className="h-11 bg-secondary/30 border-border/50 focus:border-primary focus:ring-primary/20"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Continue to Plans <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold hover:text-primary/80">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

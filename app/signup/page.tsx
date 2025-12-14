'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2, ArrowRight, Sparkles, Zap, Brain, Target } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Testimonials } from "@/components/testimonials"
import { TrustBadges } from "@/components/trust-badges"
import { ComparisonTable } from "@/components/comparison-table"
import { ExitIntentPopup } from "@/components/exit-intent-popup"

export default function SignupPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("3-month")
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)

  // Capture referral code from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      setReferralCode(ref)
      // Store in sessionStorage for persistence
      sessionStorage.setItem('referralCode', ref)
    } else {
      // Check sessionStorage
      const stored = sessionStorage.getItem('referralCode')
      if (stored) setReferralCode(stored)
    }
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate inputs
    if (!name || !email || !password) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      setIsLoading(false)
      return
    }

    try {
      // Create Stripe Checkout session with user data
      const response = await fetch("/api/create-trial-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          password, // Send securely to webhook via Stripe metadata
          planId: selectedPlan,
          referralCode, // Track ambassador referrals
        }),
      })

      const data = await response.json()

      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Failed to create checkout session")
      }
    } catch (error: any) {
      console.error("Signup error:", error)
      // Show the actual error message instead of generic one
      setError(error.message || "Failed to create subscription. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 fixed"></div>
      <div className="absolute top-0 left-0 w-full h-[500px] bg-primary/5 blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center space-y-6 mb-12">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link href="/" className="relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-all duration-500"></div>
              <div className="relative h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-2xl p-2 border border-white/20">
                <Image
                  src="/goodrunss-logo-green.svg"
                  alt="GoodRunss"
                  width={64}
                  height={64}
                  className="object-contain w-full h-full"
                  quality={100}
                />
              </div>
            </Link>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-4 animate-fade-in">
              <Sparkles className="h-4 w-4 text-green-500" />
              <span className="text-sm font-bold text-green-600 dark:text-green-400">Join 500+ Wellness & Sports Professionals Growing with AI</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Start Growing Your <span className="text-primary">Wellness & Sports Business</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join 500+ wellness instructors & sports coaches using AI to grow their business. Full access immediately.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* LEFT COLUMN: Plan Selection & Account */}
          <div className="lg:col-span-2 space-y-8">

            {/* Step 1: Choose Plan */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">1</div>
                <h2 className="text-xl font-bold">Choose Your Plan</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {/* 6 Month Plan */}
                <div
                  onClick={() => setSelectedPlan("6-month")}
                  className={`cursor-pointer relative p-4 rounded-xl border-2 transition-all duration-200 ${selectedPlan === "6-month"
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                    }`}
                >
                  <div className="text-center space-y-2">
                    <h3 className="font-bold">6 Months</h3>
                    <div className="text-2xl font-bold text-primary">$75</div>
                    <div className="text-xs text-muted-foreground">$12.50/mo</div>
                    <div className="text-xs font-medium text-green-500">Save 17%</div>
                  </div>
                </div>

                {/* 3 Month Plan */}
                <div
                  onClick={() => setSelectedPlan("3-month")}
                  className={`cursor-pointer relative p-4 rounded-xl border-2 transition-all duration-200 ${selectedPlan === "3-month"
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                    }`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                    MOST POPULAR
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-bold">3 Months</h3>
                    <div className="text-2xl font-bold text-primary">$40</div>
                    <div className="text-xs text-muted-foreground">$13.33/mo</div>
                    <div className="text-xs font-medium text-green-500">Save 11%</div>
                  </div>
                </div>

                {/* 1 Month Plan */}
                <div
                  onClick={() => setSelectedPlan("1-month")}
                  className={`cursor-pointer relative p-4 rounded-xl border-2 transition-all duration-200 ${selectedPlan === "1-month"
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                    }`}
                >
                  <div className="text-center space-y-2">
                    <h3 className="font-bold">Monthly</h3>
                    <div className="text-2xl font-bold text-primary">$15</div>
                    <div className="text-xs text-muted-foreground">$15.00/mo</div>
                    <div className="text-xs font-medium text-muted-foreground">Flexible</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 2: Create Account */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">2</div>
                <h2 className="text-xl font-bold">Create Account</h2>
              </div>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <form onSubmit={handleSignup} className="space-y-4">
                    {error && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          disabled={isLoading}
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isLoading}
                          className="bg-background/50"
                        />
                      </div>
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
                        className="bg-background/50"
                      />
                      <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 font-bold rounded-xl mt-4"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Setting up account...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Get Started Now <ArrowRight className="h-5 w-5" />
                        </div>
                      )}
                    </Button>

                    <p className="text-center text-xs text-muted-foreground mt-4">
                      By clicking "Get Started", you agree to our Terms of Service.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </section>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-bold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Value Props */}
          <div className="space-y-6">
            <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Everything Included
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Dashboard Preview */}
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-primary/20 shadow-lg mb-4 group">
                  <Image
                    src="/dashboard-preview.png"
                    alt="GoodRunss Dashboard Preview"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                    <p className="text-xs text-white font-medium">Actual Dashboard Preview</p>
                  </div>
                </div>

                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">GIA AI Assistant</span>
                      <span className="text-muted-foreground text-xs">Your 24/7 business copilot</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Auto CRM Parser</span>
                      <span className="text-muted-foreground text-xs">Extract client data from docs</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Smart Lead Matching</span>
                      <span className="text-muted-foreground text-xs">AI finds your ideal clients</span>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    <span>Unlimited Clients & Programs</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    <span>Stripe Payment Integration</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    <span>Priority Support</span>
                  </li>
                </ul>

                <div className="pt-4 border-t border-primary/10">
                  <TrustBadges />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comparison Table Section */}
        <div className="mt-20">
          <ComparisonTable />
        </div>

        {/* Testimonials Section */}
        <div className="mt-20 mb-12">
          <Testimonials />
        </div>
      </div>

      <ExitIntentPopup />
    </div>
  )
}

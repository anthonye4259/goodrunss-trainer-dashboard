"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Sparkles, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function SignupPage() {
  const [step, setStep] = useState<"account" | "plan">("account")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [businessName, setBusinessName] = useState("")
  const router = useRouter()

  const handleAccountCreation = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password && name && businessName) {
      setStep("plan")
    }
  }

  const handlePlanSelection = (planId: string) => {
    localStorage.setItem("trainer_email", email)
    localStorage.setItem("trainer_password", password) // Store temporarily for Clerk creation
    localStorage.setItem("trainer_name", name)
    localStorage.setItem("trainer_business", businessName)
    localStorage.setItem("selected_plan", planId)
    router.push("/checkout")
  }

  if (step === "plan") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background grid-pattern p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] opacity-50"></div>

        <div className="w-full max-w-5xl relative z-10 space-y-8">
          <div className="text-center space-y-6">
            {/* GoodRunss Logo */}
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-xl bg-white flex items-center justify-center shadow-lg p-2">
                <img 
                  src="/goodrunss-logo.svg" 
                  alt="GoodRunss Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                Choose Your <span className="gradient-text">Billing Period</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Save more when you commit longer • All plans include full access
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

          <div className="grid md:grid-cols-3 gap-6">
            {/* 6 Month Plan */}
            <Card className="glass border-border/50 backdrop-blur-xl glow-on-hover p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">6 Months</h3>
                <p className="text-sm text-muted-foreground">Best for trying it out</p>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-bold gradient-text">$75</div>
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
              <Button onClick={() => handlePlanSelection("6-month")} variant="outline" className="w-full h-12">
                Get Started
              </Button>
            </Card>

            {/* 3 Month Plan - MOST POPULAR */}
            <Card className="glass border-2 border-primary backdrop-blur-xl glow-on-hover p-6 space-y-6 relative">
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
                <div className="text-4xl font-bold gradient-text">$40</div>
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
                className="w-full h-12 bg-gradient-to-r from-primary via-accent to-primary text-black font-semibold"
              >
                Get Started
              </Button>
            </Card>

            {/* 1 Year Plan */}
            <Card className="glass border-border/50 backdrop-blur-xl glow-on-hover p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">1 Year</h3>
                <p className="text-sm text-muted-foreground">Best value — save the most</p>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-bold gradient-text">$100</div>
                <div className="text-sm text-muted-foreground">paid upfront • $8.33/month</div>
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
              <Button onClick={() => handlePlanSelection("1-year")} variant="outline" className="w-full h-12">
                Get Started
              </Button>
            </Card>
          </div>

          <div className="flex flex-wrap justify-center gap-8 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>🔒 Price locked forever for early users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>No setup fees</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background grid-pattern p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] opacity-50"></div>

      <Card className="w-full max-w-md glass border-border/50 backdrop-blur-xl relative z-10 glow-on-hover">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary rounded-2xl blur-xl opacity-50"></div>
              <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-2xl p-3">
                <Image 
                  src="/goodrunss-logo.svg" 
                  alt="GoodRunss" 
                  width={64} 
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <CardTitle className="text-4xl font-bold tracking-tight">
              Join <span className="gradient-text">GoodRunss</span>
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Get early access today
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleAccountCreation} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 bg-secondary/50 border-border/50 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm font-semibold">
                Business Name
              </Label>
              <Input
                id="businessName"
                type="text"
                placeholder="Tennis Academy, Pickleball Center, etc."
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="h-12 bg-secondary/50 border-border/50 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="trainer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-secondary/50 border-border/50 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-secondary/50 border-border/50 focus:border-primary transition-colors"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary via-accent to-primary text-black font-semibold text-base shadow-lg hover:shadow-primary/50 transition-all"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="pt-4 border-t border-border/50">
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

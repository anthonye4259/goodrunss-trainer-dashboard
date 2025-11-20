"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SignUp } from "@clerk/nextjs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, CheckCircle, Zap } from "lucide-react"

function TrialSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [showClerkSignup, setShowClerkSignup] = useState(false)

  useEffect(() => {
    // Show Clerk signup after a brief success message
    const timer = setTimeout(() => {
      setShowClerkSignup(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!showClerkSignup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background grid-pattern p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] opacity-50"></div>

        <Card className="glass border-border/50 backdrop-blur-xl p-12 max-w-md relative z-10 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative h-20 w-20 rounded-full bg-green-500/20 border-2 border-green-500/30 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-400" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Trial Activated!</h1>
            <p className="text-muted-foreground">
              Your 7-day free trial has started. Creating your account now...
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span>Full access unlocked</span>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background grid-pattern p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] opacity-50"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary rounded-2xl blur-xl opacity-50"></div>
              <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-2xl">
                <Zap className="h-10 w-10 text-black fill-black" />
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Complete Your <span className="gradient-text">Account</span>
            </h1>
            <p className="text-muted-foreground">
              Your trial is active! Create your account to access the dashboard.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-sm font-semibold text-green-400">7-Day Trial Active</span>
          </div>
        </div>

        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "glass border-border/50 backdrop-blur-xl",
            },
          }}
          afterSignUpUrl="/dashboard"
          routing="path"
          path="/trial-success"
        />
      </div>
    </div>
  )
}

export default function TrialSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <TrialSuccessContent />
    </Suspense>
  )
}


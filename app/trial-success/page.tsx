"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

function TrialSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/login")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] opacity-50"></div>

      <Card className="border-border/50 backdrop-blur-xl p-12 max-w-lg relative z-10 text-center space-y-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
            <div className="relative h-24 w-24 rounded-full bg-green-500/20 border-4 border-green-500/30 flex items-center justify-center">
              <CheckCircle className="h-16 w-16 text-green-400" />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground text-lg">
            Your 7-day free trial has started
          </p>
        </div>

        {/* Features */}
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
            <p className="text-sm text-left">Full access to all features unlocked</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 flex-shrink-0 flex items-center justify-center">
              <Image 
                src="/goodrunss-logo-black.svg" 
                alt="GoodRunss" 
                width={20}
                height={20}
                className="object-contain w-full h-full"
              />
            </div>
            <p className="text-sm text-left">Your account is being created</p>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
            <p className="text-sm text-left">You'll receive a welcome email shortly</p>
          </div>
        </div>

        {/* Trial Info */}
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            💳 <strong>No charge for 7 days</strong>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Cancel anytime before trial ends to avoid charges
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Redirecting to login in <span className="font-bold text-primary text-lg">{countdown}</span> seconds...
          </p>
          
          <Link href="/login">
            <Button className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-semibold">
              <span className="flex items-center gap-2">
                Continue to Login <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </Link>
        </div>

        {/* Session ID */}
        {sessionId && (
          <p className="text-xs text-muted-foreground pt-4 border-t border-border/50">
            Session ID: {sessionId.substring(0, 20)}...
          </p>
        )}
      </Card>
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

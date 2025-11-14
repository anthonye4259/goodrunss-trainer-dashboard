"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Loader2, Sparkles, ArrowRight } from 'lucide-react'
import { getCheckoutSession } from "@/app/actions/stripe"

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      setError(true)
      setLoading(false)
      return
    }

    // Store in const so TypeScript knows it's not null
    const id = sessionId

    async function fetchSession() {
      try {
        const data = await getCheckoutSession(id)
        setSession(data)
      } catch (err) {
        console.error("Failed to fetch session:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </Card>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't verify your payment. Please contact support.
          </p>
          <Button onClick={() => router.push("/")} className="bg-primary hover:bg-primary/90 text-black">
            Go Home
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-2 border-primary/30 bg-card/50 backdrop-blur-sm p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Welcome to GoodRunss! 🎉
          </h1>
          <p className="text-lg text-muted-foreground">
            Your payment was successful. Let's set up your account!
          </p>
        </div>

        {/* Order Details */}
        <Card className="bg-muted/30 border-border p-6 mb-8">
          <h3 className="font-semibold text-white mb-4">Order Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="text-white font-medium">{session.customer_email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="text-white font-medium">Early Access</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="text-primary font-medium">Active</span>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <div className="space-y-4 mb-8">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            What's Next:
          </h3>
          <ul className="space-y-3">
            {[
              "Complete your trainer profile and set your specialty",
              "Add your first client or import existing clients",
              "Explore GIA - your AI-powered training assistant",
              "Set up your calendar and availability",
              "Generate your first AI workout or social media post",
            ].map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">{index + 1}</span>
                </div>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center pt-6 border-t border-border">
          <Button
            onClick={() => router.push("/onboarding")}
            className="bg-primary hover:bg-primary/90 text-black h-12 px-8 text-base font-semibold"
          >
            Complete Setup <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            A confirmation email has been sent to {session.customer_email}
          </p>
        </div>
      </Card>
    </div>
  )
}



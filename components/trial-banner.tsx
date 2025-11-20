"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Clock, CreditCard } from "lucide-react"
import Link from "next/link"

interface TrialBannerProps {
  trialEnd: Date | null
  subscriptionStatus: string
}

export function TrialBanner({ trialEnd, subscriptionStatus }: TrialBannerProps) {
  const [daysLeft, setDaysLeft] = useState(0)

  useEffect(() => {
    if (!trialEnd) return

    const calculateDaysLeft = () => {
      const now = new Date()
      const end = new Date(trialEnd)
      const diff = end.getTime() - now.getTime()
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
      setDaysLeft(Math.max(0, days))
    }

    calculateDaysLeft()
    const interval = setInterval(calculateDaysLeft, 1000 * 60 * 60) // Update every hour

    return () => clearInterval(interval)
  }, [trialEnd])

  // Don't show banner if subscription is active (not in trial)
  if (subscriptionStatus !== "trialing" || !trialEnd) {
    return null
  }

  const isExpiringSoon = daysLeft <= 2

  return (
    <Card
      className={`glass border backdrop-blur-xl p-4 ${
        isExpiringSoon
          ? "bg-red-500/10 border-red-500/30"
          : "bg-primary/10 border-primary/20"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center ${
              isExpiringSoon ? "bg-red-500/20" : "bg-primary/20"
            }`}
          >
            <Clock className={`h-5 w-5 ${isExpiringSoon ? "text-red-400" : "text-primary"}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Free Trial Active</h3>
              {isExpiringSoon && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  Expires Soon
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {daysLeft === 0 ? (
                <span className="text-red-400 font-medium">Trial ends today</span>
              ) : daysLeft === 1 ? (
                <span>1 day remaining • Full access until trial ends</span>
              ) : (
                <span>{daysLeft} days remaining • Full access until trial ends</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/subscription">
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              <CreditCard className="h-4 w-4 mr-2" />
              Manage
            </Button>
          </Link>
        </div>
      </div>

      {isExpiringSoon && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            💡 <strong>No action needed:</strong> Your card will be charged automatically when the
            trial ends. Cancel anytime to avoid charges.
          </p>
        </div>
      )}
    </Card>
  )
}


"use client"

import { useState, useEffect } from "react"
import { DashboardOverview } from "@/components/dashboard-overview"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return <DashboardOverview />
}

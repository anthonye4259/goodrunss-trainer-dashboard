"use client"

import type React from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ProductTour } from "@/components/product-tour"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login")
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <ProductTour />
      <div className="flex min-h-screen bg-background">
        {/* Sidebar - hidden on mobile, visible on desktop */}
        <div className="hidden md:block w-64 shrink-0 border-r border-border/40 bg-card/30 backdrop-blur-xl fixed inset-y-0 z-50">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
          {/* Header */}
          <div className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
            <Header />
          </div>

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}

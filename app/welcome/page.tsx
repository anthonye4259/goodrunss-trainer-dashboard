"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] opacity-50"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px] opacity-50"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary rounded-3xl blur-2xl opacity-50"></div>
                <div className="relative h-24 w-24 rounded-3xl bg-white flex items-center justify-center shadow-2xl p-3">
                  <Image 
                    src="/goodrunss-logo-black.svg" 
                    alt="GoodRunss" 
                    width={72}
                    height={72}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-6xl font-bold tracking-tight">
                The AI-Powered Dashboard for <span className="gradient-text">Rec Sports & Wellness Trainers</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Manage clients, track progress, create marketing materials, and grow your training business—all in one
                place.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="h-14 px-8 bg-gradient-to-r from-primary via-accent to-primary text-black font-semibold text-lg shadow-lg hover:shadow-primary/50 transition-all"
                >
                  Get Started <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-transparent">
                  Sign In
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">Early Access • Limited Availability • Exclusive Beta</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="glass border-border/50 backdrop-blur-xl p-8 space-y-4 glow-on-hover">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Client Management</h3>
            <p className="text-muted-foreground">
              Track client progress, manage sessions, and keep all your training data organized in one place.
            </p>
          </Card>

          <Card className="glass border-border/50 backdrop-blur-xl p-8 space-y-4 glow-on-hover">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Business Analytics</h3>
            <p className="text-muted-foreground">
              Get actionable insights into revenue, client engagement, and business growth with AI-powered analytics.
            </p>
          </Card>

          <Card className="glass border-border/50 backdrop-blur-xl p-8 space-y-4 glow-on-hover">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">AI Marketing Suite</h3>
            <p className="text-muted-foreground">
              Create stunning marketing materials with GIA, your AI assistant, and post directly to social media.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

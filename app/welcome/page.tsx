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
                    src="/goodrunss-logo-green.svg"
                    alt="GoodRunss"
                    width={96}
                    height={96}
                    className="object-contain w-full h-full"
                    quality={100}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-6xl font-bold tracking-tight">
                The AI System That Runs Your Business <span className="gradient-text">for Sports Trainers & Wellness Instructors</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Less cancellations. More retention. Growing revenue. Marketing on autopilot—all through AI automation.
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

            <p className="text-sm text-muted-foreground">Early Access • Limited Availability</p>
          </div>
        </div>
      </div>

      {/* Mobile App Coming Soon Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-primary/20 p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-bold">
                📱 Coming January
              </div>
              <h2 className="text-4xl font-bold">
                Train From <span className="gradient-text">Anywhere</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                The GoodRunss mobile app is almost here. Manage your entire business from your phone—between sessions, at the gym, wherever you are.
              </p>
              <p className="text-sm text-muted-foreground">
                ✨ Founding members get early access to the app
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl"></div>
                <Image
                  src="/mobile-app-mockup.png"
                  alt="GoodRunss Mobile App"
                  width={300}
                  height={600}
                  className="relative z-10 drop-shadow-2xl"
                />
              </div>
            </div>
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
            <h3 className="text-2xl font-bold">Smart Client Retention</h3>
            <p className="text-muted-foreground">
              AI detects when clients are about to cancel and automatically re-engages them—protecting your revenue before you lose it.
            </p>
          </Card>

          <Card className="glass border-border/50 backdrop-blur-xl p-8 space-y-4 glow-on-hover">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Automated Lead Generation</h3>
            <p className="text-muted-foreground">
              AI finds new clients and contacts them for you. Your pipeline fills with qualified leads while you focus on training.
            </p>
          </Card>

          <Card className="glass border-border/50 backdrop-blur-xl p-8 space-y-4 glow-on-hover">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Marketing That Runs Itself</h3>
            <p className="text-muted-foreground">
              GIA creates and posts your content automatically. Your socials stay active without you lifting a finger.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

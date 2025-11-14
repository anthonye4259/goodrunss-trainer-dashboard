"use client"

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, ArrowRight, Sparkles, Users, Calendar, TrendingUp, MessageSquare } from 'lucide-react'

export default function WelcomePage() {
  const router = useRouter()

  const features = [
    {
      icon: Users,
      title: "Client Management",
      description: "Track progress, manage sessions, and build stronger relationships",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "AI-powered calendar with conflict detection and auto-rescheduling",
    },
    {
      icon: TrendingUp,
      title: "Business Analytics",
      description: "Revenue tracking, client retention insights, and growth metrics",
    },
    {
      icon: MessageSquare,
      title: "GIA Assistant",
      description: "Your AI-powered training assistant for content, workouts, and insights",
    },
  ]

  const benefits = [
    "Unlimited clients & sessions",
    "AI-powered content generation",
    "Integrated payment processing",
    "Custom branding & white-label options",
    "Priority support & feature requests",
    "Lifetime early access pricing",
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
            <Sparkles className="h-4 w-4" />
            Exclusive Beta
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 text-balance">
            The All-in-One Platform for
            <span className="text-primary block mt-2">Rec Sports & Wellness Trainers</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-balance">
            Manage clients, schedule sessions, track progress, and grow your business with AI-powered tools designed specifically for trainers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/signup")}
              className="bg-primary hover:bg-primary/90 text-black h-12 px-8 text-lg font-semibold"
            >
              Get Early Access <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => router.push("/demo")}
              variant="outline"
              className="h-12 px-8 text-lg"
            >
              View Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need to Scale
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built by trainers, for trainers. Every feature designed to help you spend less time on admin and more time training.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 border-2 border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-card/30 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 md:p-12 border-2 border-primary/30 bg-card/50 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Early Access Perks
              </h2>
              <p className="text-lg text-muted-foreground">
                Be one of the first trainers to experience the future of training management
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={() => router.push("/signup")}
                className="bg-primary hover:bg-primary/90 text-black h-12 px-8 text-lg font-semibold"
              >
                Claim Your Spot <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Limited spots available • Lock in lifetime pricing
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}





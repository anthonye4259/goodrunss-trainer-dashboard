"use client"

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Play } from 'lucide-react'

export default function DemoPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          onClick={() => router.push("/welcome")}
          variant="ghost"
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            See GoodRunss in Action
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Watch how trainers are using GoodRunss to manage clients, generate content with AI, and grow their business.
          </p>
        </div>

        <Card className="p-8 max-w-5xl mx-auto mb-12">
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-background rounded-lg flex items-center justify-center border-2 border-border">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="h-10 w-10 text-primary" />
              </div>
              <p className="text-muted-foreground text-lg">Demo Video Coming Soon</p>
              <p className="text-sm text-muted-foreground mt-2">
                In the meantime, sign up for early access to try it yourself!
              </p>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <Button
            onClick={() => router.push("/sign-up")}
            className="bg-primary hover:bg-primary/90 text-black h-12 px-8 text-lg font-semibold"
          >
            Get Early Access
          </Button>
        </div>
      </div>
    </div>
  )
}













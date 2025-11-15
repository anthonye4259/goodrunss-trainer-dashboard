"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ActivityIcon, Sparkles } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      if (email && password) {
        localStorage.setItem("trainer_authenticated", "true")
        localStorage.setItem("trainer_email", email)
        const onboardingCompleted = localStorage.getItem("onboarding_completed")

        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        })

        if (onboardingCompleted === "true") {
          router.push("/dashboard")
        } else {
          router.push("/onboarding")
        }
      } else {
        toast({
          title: "Error",
          description: "Please enter both email and password.",
          variant: "destructive",
        })
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background grid-pattern p-4 relative overflow-hidden">
      {/* Static gradient background - no animations to trigger ResizeObserver */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] opacity-50"></div>

      <Card className="w-full max-w-md glass border-border/50 backdrop-blur-xl relative z-10 glow-on-hover">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary rounded-2xl blur-xl opacity-50"></div>
              <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-2xl">
                <ActivityIcon className="h-10 w-10 text-black" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <CardTitle className="text-4xl font-bold tracking-tight">
              Welcome to <span className="gradient-text">GoodRunss</span>
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Your AI-powered trainer dashboard
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="trainer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-secondary/50 border-border/50 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-secondary/50 border-border/50 focus:border-primary transition-colors"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary via-accent to-primary text-black font-semibold text-base shadow-lg hover:shadow-primary/50 transition-all"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="pt-4 border-t border-border/50">
            <p className="text-center text-sm text-muted-foreground mb-4">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline font-semibold">
                Sign up
              </Link>
            </p>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-foreground/80">Demo Access</p>
              <p className="text-xs text-muted-foreground">Use any email and password to explore</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

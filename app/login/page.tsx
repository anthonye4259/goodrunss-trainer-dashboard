'use client'

import { SignIn } from '@clerk/nextjs'
import { Sparkles } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background grid-pattern p-4 relative overflow-hidden">
      {/* Static gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] opacity-50"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary rounded-2xl blur-xl opacity-50"></div>
              <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-2xl p-3">
                <Image 
                  src="/goodrunss-logo.svg" 
                  alt="GoodRunss" 
                  width={64} 
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome to <span className="gradient-text">GoodRunss</span>
            </h1>
            <p className="text-base text-muted-foreground flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Your AI-powered sports & wellness dashboard
            </p>
          </div>
        </div>

        {/* Clerk Sign In Component */}
        <div className="flex justify-center">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "glass border-border/50 backdrop-blur-xl shadow-xl",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-secondary/50 border-border/50 hover:bg-secondary",
                formButtonPrimary: "bg-gradient-to-r from-primary via-accent to-primary text-black font-semibold hover:opacity-90",
                footerActionLink: "text-primary hover:text-primary/80",
              }
            }}
            routing="path"
            path="/login"
            signUpUrl="/signup"
            redirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  )
}

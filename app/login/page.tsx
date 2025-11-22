'use client'

import { SignIn } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center">
              <Zap className="h-10 w-10 text-black fill-black" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">
            Welcome to <span className="text-primary">GoodRunss</span>
          </h1>
        </div>

        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "bg-card border-border shadow-none w-full",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              footerAction: "text-muted-foreground",
              formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
              formFieldInput: "bg-background border-input",
              footerActionLink: "text-primary hover:text-primary/90"
            }
          }}
          signUpUrl="/signup"
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  )
}

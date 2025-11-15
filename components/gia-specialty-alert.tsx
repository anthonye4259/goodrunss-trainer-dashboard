"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, X } from "lucide-react"

export function GIASpecialtyAlert() {
  const [isVisible, setIsVisible] = useState(true)
  const router = useRouter()

  if (!isVisible) return null

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/5 backdrop-blur-sm p-6 relative mb-6">
      <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={() => setIsVisible(false)}>
        <X className="h-4 w-4" />
      </Button>

      <div className="flex items-start gap-4 pr-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="h-6 w-6 text-primary" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">Set Your Specialty First</h3>
          <p className="text-muted-foreground mb-4">
            GIA needs to know your specialty to generate content that matches your sport. For example, basketball
            coaches get court drills, yoga teachers get flow sequences.
          </p>

          <div className="flex gap-3">
            <Button onClick={() => router.push("/dashboard/settings")}>Go to Settings</Button>
            <Button variant="outline" onClick={() => setIsVisible(false)}>
              I'll do this later
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

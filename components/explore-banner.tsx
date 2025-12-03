"use client"

import { useState, useEffect } from "react"
import { X, Compass, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const DISMISSED_KEY = "explore_banner_dismissed"

export function ExploreBanner() {
  const [isDismissed, setIsDismissed] = useState(true) // Start hidden to prevent flash

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (!dismissed) {
      setIsDismissed(false)
    }
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem(DISMISSED_KEY, "true")
  }

  if (isDismissed) return null

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 border border-primary/30 p-4">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5 animate-pulse" />
      
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Compass className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              You've got a lot of power here!
            </p>
            <p className="text-sm text-muted-foreground">
              This dashboard has 20+ features built for trainers. Click through the sidebar to discover AI tools, lead generation, automated marketing, and more.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-white"
          >
            Got it
          </Button>
          <Button
            size="sm"
            onClick={handleDismiss}
            className="gap-1"
          >
            Explore
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

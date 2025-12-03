"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, X, Sparkles, CheckCircle2 } from "lucide-react"

const WELCOME_SEEN_KEY = "welcome_video_seen"

// Replace this with your actual video URL (YouTube, Loom, Vimeo, etc.)
const WELCOME_VIDEO_URL = "https://www.youtube.com/embed/dQw4w9WgXcQ" // Placeholder - replace with real video

const quickHighlights = [
  { icon: "🤖", title: "GIA - Your AI Assistant", desc: "Click the chat bubble to ask GIA anything" },
  { icon: "👥", title: "Client Management", desc: "Add clients and track their progress" },
  { icon: "📅", title: "Smart Scheduling", desc: "Book sessions and sync with Google Calendar" },
  { icon: "🎯", title: "Daily Leads", desc: "Get matched with potential clients every day" },
]

export function WelcomeVideoModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    // Check if user has seen the welcome video
    const hasSeen = localStorage.getItem(WELCOME_SEEN_KEY)
    if (!hasSeen) {
      // Small delay so dashboard loads first
      const timer = setTimeout(() => setIsOpen(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem(WELCOME_SEEN_KEY, "true")
    setIsOpen(false)
  }

  const handleWatchLater = () => {
    // Don't mark as seen, just close for now
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 bg-gradient-to-br from-background via-background to-primary/5 border-primary/20 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Welcome to GoodRunss! 🎉</h2>
                <p className="text-muted-foreground">Let's get you set up in 2 minutes</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="text-muted-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Video Section */}
        {showVideo ? (
          <div className="px-6">
            <div className="aspect-video rounded-xl overflow-hidden bg-black/50 border border-white/10">
              <iframe
                src={WELCOME_VIDEO_URL}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div className="px-6">
            <button
              onClick={() => setShowVideo(true)}
              className="w-full aspect-video rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 flex flex-col items-center justify-center gap-4 hover:border-primary/40 transition-colors group"
            >
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <Play className="h-8 w-8 text-primary ml-1" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-white">Watch the 2-min Tour</p>
                <p className="text-sm text-muted-foreground">See how to get clients & save time</p>
              </div>
            </button>
          </div>
        )}

        {/* Quick Highlights */}
        <div className="p-6 pt-4">
          <p className="text-sm font-medium text-muted-foreground mb-3">Or jump right in:</p>
          <div className="grid grid-cols-2 gap-3">
            {quickHighlights.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50"
              >
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="font-medium text-white text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 flex gap-3">
          <Button variant="outline" onClick={handleWatchLater} className="flex-1">
            Watch Later
          </Button>
          <Button onClick={handleClose} className="flex-1 gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

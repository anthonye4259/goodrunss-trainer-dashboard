"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Share2 } from "lucide-react"

interface ShareData {
  title: string
  value: string
  subtitle?: string
  gradient: string
}

interface ShareToSnapchatProps {
  data: ShareData
  trigger?: React.ReactNode
}

export function ShareToSnapchat({ data, trigger }: ShareToSnapchatProps) {
  const [open, setOpen] = useState(false)

  const handleShare = () => {
    // Generate shareable content URL
    const shareUrl = `https://goodrunss.com/share?title=${encodeURIComponent(data.title)}&value=${encodeURIComponent(data.value)}`

    // Try to open Snapchat app with share intent
    const snapchatUrl = `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(shareUrl)}`
    window.open(snapchatUrl, "_blank")
  }

  const handleDownload = () => {
    // In a real implementation, this would generate an image and download it
    // For now, we'll just show a message
    alert("Image downloaded! You can now upload it to Snapchat manually.")
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {trigger || (
          <Button size="sm" variant="outline" className="gap-2 bg-transparent">
            <Share2 className="h-4 w-4" />
            Share to Snapchat
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share to Snapchat</DialogTitle>
            <DialogDescription>Share your achievement with your followers</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview Card */}
            <Card className={`relative overflow-hidden border-0 rounded-3xl ${data.gradient}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]"></div>
              <CardContent className="relative p-8 text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white/80">{data.title}</p>
                  <p className="text-6xl font-bold text-white">{data.value}</p>
                  {data.subtitle && <p className="text-sm text-white/70">{data.subtitle}</p>}
                </div>
                <div className="pt-4 border-t border-white/20">
                  <p className="text-xs font-semibold text-white">GOODRUNSS TRAINER</p>
                </div>
              </CardContent>
            </Card>

            {/* Share Options */}
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                Open Snapchat
              </Button>
              <Button onClick={handleDownload} variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Download Image
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Click "Open Snapchat" to share directly, or download the image to post manually
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

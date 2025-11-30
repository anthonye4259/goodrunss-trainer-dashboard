"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Share2 } from "lucide-react"
import { getTwitterShareUrl } from "@/app/actions/twitter"

interface ShareData {
  title: string
  value: string
  subtitle?: string
  gradient: string
}

interface ShareToSocialProps {
  data: ShareData
  trigger?: React.ReactNode
  platform?: "snapchat" | "twitter" | "instagram" | "all"
}

export function ShareToSocial({ data, trigger, platform = "all" }: ShareToSocialProps) {
  const [open, setOpen] = useState(false)

  const handleSnapchatShare = () => {
    const shareUrl = `https://goodrunss.com/share?title=${encodeURIComponent(data.title)}&value=${encodeURIComponent(data.value)}`
    const snapchatUrl = `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(shareUrl)}`
    window.open(snapchatUrl, "_blank")
  }

  const handleTwitterShare = async () => {
    const twitterUrl = await getTwitterShareUrl({
      title: data.title,
      value: data.value,
      subtitle: data.subtitle,
    })
    window.open(twitterUrl, "_blank", "width=550,height=420")
  }

  const handleInstagramShare = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    if (isMobile) {
      window.location.href = "instagram://library"
      setTimeout(() => {
        handleDownload()
      }, 1000)
    } else {
      alert("Image ready! Download and upload to Instagram from your phone or desktop app.")
      handleDownload()
    }
  }

  const handleDownload = () => {
    alert("Image downloaded! You can now upload it to your social media manually.")
  }

  const showSnapchat = platform === "snapchat" || platform === "all"
  const showTwitter = platform === "twitter" || platform === "all"
  const showInstagram = platform === "instagram" || platform === "all"

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {trigger || (
          <Button size="sm" variant="outline" className="gap-2 bg-transparent">
            <Share2 className="h-4 w-4" />
            Share to Social
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Achievement</DialogTitle>
            <DialogDescription>Share your stats with your followers</DialogDescription>
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
            <div className="space-y-3">
              {showTwitter && (
                <Button onClick={handleTwitterShare} className="w-full gap-2 bg-[#1DA1F2] hover:bg-[#1a8cd8]">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Share to Twitter
                </Button>
              )}

              {showInstagram && (
                <Button
                  onClick={handleInstagramShare}
                  className="w-full gap-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.073-1.689-.073-4.948 0-3.204.013-3.667.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Share to Instagram
                </Button>
              )}

              {showSnapchat && (
                <Button
                  onClick={handleSnapchatShare}
                  className="w-full gap-2 bg-[#FFFC00] hover:bg-[#e6e300] text-black"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.206 2.024c-1.013 0-2.923.494-3.99 1.825-.897 1.12-1.333 2.734-1.333 4.942 0 .557.03 1.139.09 1.727-.413.165-.866.248-1.333.248-.486 0-.944-.09-1.373-.248-.165-.06-.346-.09-.527-.09-.527 0-.99.346-1.139.857-.165.527.03 1.094.527 1.379.346.195.692.346 1.013.481.165.075.33.15.481.225-.165.346-.346.692-.557 1.013-.346.527-.692 1.013-1.094 1.454-.165.18-.248.406-.248.632 0 .346.195.662.511.827.195.105.406.165.632.165.195 0 .391-.045.572-.135.692-.346 1.333-.557 1.974-.632.195-.03.391-.045.587-.045.692 0 1.333.195 1.944.557.692.406 1.454.617 2.246.617.797 0 1.559-.211 2.251-.617.617-.362 1.258-.557 1.949-.557.195 0 .391.015.587.045.641.075 1.282.286 1.974.632.18.09.376.135.572.135.225 0 .436-.06.632-.165.316-.165.511-.481.511-.827 0-.225-.083-.451-.248-.632-.406-.441-.752-.927-1.094-1.454-.211-.321-.391-.667-.557-1.013.15-.075.316-.15.481-.225.321-.135.667-.286 1.013-.481.497-.285.692-.852.527-1.379-.15-.511-.617-.857-1.139-.857-.18 0-.362.03-.527.09-.429.158-.887.248-1.373.248-.467 0-.92-.083-1.333-.248.06-.588.09-1.17.09-1.727 0-2.208-.436-3.822-1.333-4.942-1.067-1.331-2.977-1.825-3.99-1.825z" />
                  </svg>
                  Share to Snapchat
                </Button>
              )}

              <Button onClick={handleDownload} variant="outline" className="w-full gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Download Image
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Click a platform to share directly, or download the image to post manually
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { toast } from "sonner"

interface ShareToSocialProps {
  data: {
    title: string
    value?: string | number
    description?: string
    subtitle?: string
    gradient?: string
  }
  platform?: string
}

export function ShareToSocial({ data }: ShareToSocialProps) {
  const handleShare = async () => {
    const text = `${data.title}: ${data.value || ''} ${data.description || ''}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: text,
        })
        toast.success("Shared successfully!")
      } catch (error) {
        // User cancelled or error occurred
        console.log("Share cancelled")
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(text)
        toast.success("Copied to clipboard!")
      } catch (error) {
        toast.error("Failed to copy")
      }
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="gap-2"
    >
      <Share2 className="w-4 h-4" />
      Share
    </Button>
  )
}


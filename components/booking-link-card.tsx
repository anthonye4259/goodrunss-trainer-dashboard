"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, ExternalLink, Check, Link2, Share2 } from "lucide-react"
import { useUser } from "@clerk/nextjs"

export function BookingLinkCard() {
  const { user } = useUser()
  const [copied, setCopied] = useState(false)
  const [bookingLink, setBookingLink] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTrainerId() {
      try {
        // First, try to get from API
        const res = await fetch("/api/profile")
        if (res.ok) {
          const data = await res.json()
          const id = data.profile?.id
          if (id) {
            const link = `${window.location.origin}/book/${id}`
            setBookingLink(link)
            setLoading(false)
            return
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      }

      // Fallback: use Clerk user ID
      if (user?.id) {
        const link = `${window.location.origin}/book/${user.id}`
        setBookingLink(link)
      }
      setLoading(false)
    }

    if (user) {
      fetchTrainerId()
    }
  }, [user])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bookingLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const openBookingPage = () => {
    window.open(bookingLink, "_blank")
  }

  // Show loading state briefly
  if (loading && !bookingLink) {
    return (
      <Card className="p-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
        <div className="animate-pulse">
          <div className="h-6 bg-green-200/20 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-green-200/20 rounded"></div>
        </div>
      </Card>
    )
  }

  // Always show something, even if no link yet
  const displayLink = bookingLink || `${window.location.origin}/book/your-id`

  return (
    <Card className="p-8 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-green-500/20 border-2 border-green-500/50 shadow-lg shadow-green-500/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-green-500 rounded-full">
          <Link2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Your Booking Link</h2>
          <p className="text-green-300 text-sm">Share this to accept bookings & payments</p>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border border-green-500/20">
        <div className="flex gap-2">
          <Input
            value={displayLink}
            readOnly
            className="flex-1 font-mono text-sm bg-gray-800 border-gray-700 text-white"
          />
          <Button
            onClick={copyToClipboard}
            className="bg-green-600 hover:bg-green-700 flex-shrink-0"
            size="lg"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          onClick={openBookingPage}
          variant="outline"
          className="flex-1 border-green-500/30 hover:bg-green-500/10"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Preview Booking Page
        </Button>
        <Button
          onClick={copyToClipboard}
          variant="outline"
          className="flex-1 border-green-500/30 hover:bg-green-500/10"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Link
        </Button>
      </div>

      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="text-3xl">💡</div>
          <div>
            <p className="text-green-300 font-semibold mb-1">Quick Start:</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>1. Add your services (click "Services & Pricing" in sidebar)</li>
              <li>2. Copy this link</li>
              <li>3. Post to Instagram bio, Facebook, or website</li>
              <li>4. Start accepting bookings & payments! 💰</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
}

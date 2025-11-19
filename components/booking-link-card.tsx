"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, ExternalLink, Check } from "lucide-react"
import { useUser } from "@clerk/nextjs"

export function BookingLinkCard() {
  const { user } = useUser()
  const [copied, setCopied] = useState(false)
  const [trainerId, setTrainerId] = useState<string>("")
  const [bookingLink, setBookingLink] = useState<string>("")

  useEffect(() => {
    async function fetchTrainerId() {
      try {
        const res = await fetch("/api/profile")
        if (res.ok) {
          const data = await res.json()
          const id = data.profile?.id || user?.id
          if (id) {
            setTrainerId(id)
            const link = `${window.location.origin}/book/${id}`
            setBookingLink(link)
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    }
    fetchTrainerId()
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

  if (!bookingLink) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">📎 Your Booking Link</h3>
      <p className="text-sm text-gray-600 mb-4">
        Share this link with clients so they can book and pay for sessions directly.
      </p>
      
      <div className="flex gap-2 mb-4">
        <Input
          value={bookingLink}
          readOnly
          className="flex-1 font-mono text-sm"
        />
        <Button
          onClick={copyToClipboard}
          className="bg-green-600 hover:bg-green-700"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </>
          )}
        </Button>
        <Button
          onClick={openBookingPage}
          variant="outline"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          <strong>💡 Pro Tip:</strong> Post this link on your Instagram, Facebook, or website.
          Clients can book and pay in seconds!
        </p>
      </div>
    </Card>
  )
}


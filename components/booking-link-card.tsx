"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, ExternalLink, Check, Link2, Share2, QrCode, Code2 } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { BookingQRCode } from "@/components/booking-qr-code"

export function BookingLinkCard() {
  const { user } = useUser()
  const [copied, setCopied] = useState(false)
  const [embedCopied, setEmbedCopied] = useState(false)
  const [bookingLink, setBookingLink] = useState<string>("")
  const [trainerId, setTrainerId] = useState<string>("")
  const [primaryColor, setPrimaryColor] = useState("22c55e")
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
            setTrainerId(id)
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
        setTrainerId(user.id)
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
  const trainerName = user?.fullName || user?.firstName || "Trainer"

  return (
    <Card data-tour="booking-link" className="p-8 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-green-500/20 border-2 border-green-500/50 shadow-lg shadow-green-500/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-500 rounded-full">
          <Link2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Your Booking Link</h2>
          <p className="text-green-300 text-sm">Share this to accept bookings & payments</p>
        </div>
      </div>

      <Tabs defaultValue="link" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="link" className="gap-2">
            <Link2 className="h-4 w-4" />
            Link
          </TabsTrigger>
          <TabsTrigger value="qrcode" className="gap-2">
            <QrCode className="h-4 w-4" />
            QR Code
          </TabsTrigger>
          <TabsTrigger value="embed" className="gap-2">
            <Code2 className="h-4 w-4" />
            Embed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="link" className="space-y-4">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-green-500/20">
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
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
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
        </TabsContent>

        <TabsContent value="qrcode" className="space-y-4">
          <BookingQRCode bookingUrl={displayLink} trainerName={trainerName} />

          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="text-3xl">📱</div>
              <div>
                <p className="text-green-300 font-semibold mb-1">Use Your QR Code:</p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Print on business cards & flyers</li>
                  <li>• Post at your gym or studio</li>
                  <li>• Share on social media stories</li>
                  <li>• Display at events & competitions</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="embed" className="space-y-4">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-green-500/20">
            <p className="text-green-300 font-semibold mb-3">📋 Iframe Embed Code</p>
            <p className="text-xs text-gray-400 mb-2">Paste this into your website HTML</p>
            <div className="relative">
              <textarea
                readOnly
                rows={3}
                className="w-full font-mono text-xs bg-gray-800 border-gray-700 text-white p-3 rounded-md resize-none"
                value={`<iframe src="${window.location.origin}/embed/${trainerId}?primary=${primaryColor}" style="width:100%;min-height:600px;border:none;border-radius:8px;" allow="payment" title="Book an appointment"></iframe>`}
              />
              <Button
                size="sm"
                className="absolute top-2 right-2 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  navigator.clipboard.writeText(`<iframe src="${window.location.origin}/embed/${trainerId}?primary=${primaryColor}" style="width:100%;min-height:600px;border:none;border-radius:8px;" allow="payment" title="Book an appointment"></iframe>`)
                  setEmbedCopied(true)
                  setTimeout(() => setEmbedCopied(false), 2000)
                }}
              >
                {embedCopied ? <><Check className="h-3 w-3 mr-1" /> Copied</> : <><Copy className="h-3 w-3 mr-1" /> Copy</>}
              </Button>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border border-green-500/20">
            <p className="text-green-300 font-semibold mb-3">⚡ JavaScript Embed (Recommended)</p>
            <p className="text-xs text-gray-400 mb-2">Auto-resizes and works with most website builders</p>
            <div className="relative">
              <textarea
                readOnly
                rows={3}
                className="w-full font-mono text-xs bg-gray-800 border-gray-700 text-white p-3 rounded-md resize-none"
                value={`<script src="${window.location.origin}/embed.js" data-trainer-id="${trainerId}" data-primary="${primaryColor}"></script>
<div id="goodrunss-booking"></div>`}
              />
              <Button
                size="sm"
                className="absolute top-2 right-2 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  navigator.clipboard.writeText(`<script src="${window.location.origin}/embed.js" data-trainer-id="${trainerId}" data-primary="${primaryColor}"></script>\n<div id="goodrunss-booking"></div>`)
                  setEmbedCopied(true)
                  setTimeout(() => setEmbedCopied(false), 2000)
                }}
              >
                {embedCopied ? <><Check className="h-3 w-3 mr-1" /> Copied</> : <><Copy className="h-3 w-3 mr-1" /> Copy</>}
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="text-3xl">🌐</div>
              <div>
                <p className="text-green-300 font-semibold mb-1">Works With:</p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Squarespace, Wix, WordPress</li>
                  <li>• Any website with HTML access</li>
                  <li>• Your clients see your business name</li>
                  <li>• No "Powered by" branding</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4 mt-4">
        <div className="flex gap-3">
          <div className="text-3xl">💡</div>
          <div>
            <p className="text-green-300 font-semibold mb-1">Quick Start:</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>1. Add your services (click "Services & Pricing" in sidebar)</li>
              <li>2. Share your link or QR code</li>
              <li>3. Post to Instagram bio, Facebook, or website</li>
              <li>4. Start accepting bookings & payments! 💰</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
}

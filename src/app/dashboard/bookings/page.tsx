"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, DollarSign, Link as LinkIcon, Plus, Settings } from "lucide-react"

interface Booking {
  id: string
  clientName: string
  clientEmail: string
  sessionType: string
  sessionDate: string
  sessionTime: string
  duration: number
  price: number
  status: string
  paid: boolean
}

interface BookingSettings {
  slug: string
  sessionTypes: Array<{
    name: string
    duration: number
    price: number
    description: string
  }>
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [settings, setSettings] = useState<BookingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchBookings()
    fetchSettings()
  }, [])

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/my-bookings")
      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load bookings", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/booking-settings")
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Failed to load settings")
    }
  }

  const updateSettings = async (data: Partial<BookingSettings>) => {
    try {
      const res = await fetch("/api/booking-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast({ title: "Success", description: "Settings updated!" })
        fetchSettings()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update settings", variant: "destructive" })
    }
  }

  const copyBookingLink = () => {
    if (settings?.slug) {
      const link = `${window.location.origin}/book/${settings.slug}`
      navigator.clipboard.writeText(link)
      toast({ title: "Copied!", description: "Booking link copied to clipboard" })
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Public Bookings</h1>
          <p className="text-muted-foreground">Manage your public booking link and incoming bookings</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Settings className="mr-2" size={16} />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Booking Settings</DialogTitle>
            </DialogHeader>
            {/* Settings form would go here */}
            <p className="text-sm text-muted-foreground">Configure your booking link and session types</p>
          </DialogContent>
        </Dialog>
      </div>

      {settings && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white mb-1">Your Booking Link</h3>
              <p className="text-sm text-muted-foreground">
                {window.location.origin}/book/{settings.slug}
              </p>
            </div>
            <Button onClick={copyBookingLink} variant="outline">
              <LinkIcon className="mr-2" size={16} />
              Copy Link
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {bookings.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-semibold text-white mb-2">No Bookings Yet</h3>
            <p className="text-muted-foreground mb-4">
              Share your booking link to start receiving bookings
            </p>
            {settings && (
              <Button onClick={copyBookingLink}>
                <LinkIcon className="mr-2" size={16} />
                Copy Booking Link
              </Button>
            )}
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-white">{booking.clientName}</h3>
                    <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                      {booking.status}
                    </Badge>
                    {booking.paid && (
                      <Badge variant="outline" className="border-green-500 text-green-500">
                        Paid
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{booking.clientEmail}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(booking.sessionDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {booking.sessionTime} ({booking.duration} min)
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={14} />
                      ${booking.price}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}




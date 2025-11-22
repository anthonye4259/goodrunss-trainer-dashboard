"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Save, Loader2, CheckCircle } from "lucide-react"

export const dynamic = 'force-dynamic'

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const TIMES = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
  "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"
]

interface Availability {
  [day: string]: string[]
}

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<Availability>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadAvailability()
  }, [])

  const loadAvailability = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/availability")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load availability")
      }

      // If no availability set, default to all times
      if (Object.keys(data.availability || {}).length === 0) {
        const defaultAvailability: Availability = {}
        DAYS.forEach(day => {
          defaultAvailability[day] = [...TIMES]
        })
        setAvailability(defaultAvailability)
      } else {
        setAvailability(data.availability)
      }
    } catch (err: any) {
      console.error("Load availability error:", err)
      setError(err.message || "Failed to load availability")
      
      // Fallback to default
      const defaultAvailability: Availability = {}
      DAYS.forEach(day => {
        defaultAvailability[day] = [...TIMES]
      })
      setAvailability(defaultAvailability)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTime = (day: string, time: string) => {
    setAvailability(prev => {
      const dayTimes = prev[day] || []
      const newDayTimes = dayTimes.includes(time)
        ? dayTimes.filter(t => t !== time)
        : [...dayTimes, time]
      
      return {
        ...prev,
        [day]: newDayTimes
      }
    })
  }

  const toggleAllDay = (day: string) => {
    setAvailability(prev => {
      const dayTimes = prev[day] || []
      const newDayTimes = dayTimes.length === TIMES.length ? [] : [...TIMES]
      
      return {
        ...prev,
        [day]: newDayTimes
      }
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save availability")
      }

      setSuccess("Availability saved successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      console.error("Save availability error:", err)
      setError(err.message || "Failed to save availability")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading availability...</p>
        </div>
      </div>
    )
  }

  const totalAvailableSlots = Object.values(availability).reduce(
    (sum, times) => sum + times.length, 
    0
  )

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Availability</h1>
            <p className="text-muted-foreground mt-1">
              Set your available time slots for client bookings
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Availability
              </>
            )}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Slots</p>
                <p className="text-2xl font-bold">{totalAvailableSlots}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hours/Week</p>
                <p className="text-2xl font-bold">{totalAvailableSlots}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days Active</p>
                <p className="text-2xl font-bold">
                  {Object.values(availability).filter(times => times.length > 0).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Availability Grid */}
        <div className="space-y-4">
          {DAYS.map(day => (
            <Card key={day} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{day}</h3>
                  <Badge variant={availability[day]?.length > 0 ? "default" : "outline"}>
                    {availability[day]?.length || 0} slots
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAllDay(day)}
                >
                  {availability[day]?.length === TIMES.length ? "Clear All" : "Select All"}
                </Button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                {TIMES.map(time => {
                  const isSelected = availability[day]?.includes(time)
                  return (
                    <Button
                      key={time}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTime(day, time)}
                      className={`text-xs ${
                        isSelected 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-primary/10"
                      }`}
                    >
                      {time}
                    </Button>
                  )
                })}
              </div>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="p-6 bg-muted/30">
          <h3 className="text-lg font-semibold mb-2">How it works</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Click on time slots to toggle your availability</li>
            <li>• Use "Select All" / "Clear All" to quickly manage full days</li>
            <li>• Your availability will be visible on your public booking page</li>
            <li>• Clients can only book during your available time slots</li>
            <li>• Remember to click "Save Availability" to apply changes</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

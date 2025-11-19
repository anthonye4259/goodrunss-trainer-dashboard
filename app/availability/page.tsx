"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Save } from "lucide-react"
import { useUser } from "@clerk/nextjs"

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
  const { user } = useUser()
  const [availability, setAvailability] = useState<Availability>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadAvailability()
  }, [])

  const loadAvailability = () => {
    const saved = localStorage.getItem("trainerAvailability")
    if (saved) {
      setAvailability(JSON.parse(saved))
    } else {
      // Default: all times available
      const defaultAvailability: Availability = {}
      DAYS.forEach(day => {
        defaultAvailability[day] = [...TIMES]
      })
      setAvailability(defaultAvailability)
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
    setSaving(true)
    
    // Save to localStorage
    localStorage.setItem("trainerAvailability", JSON.stringify(availability))

    // Save to API/database
    try {
      if (user?.id) {
        await fetch(`/api/public/services/${user.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            services: JSON.parse(localStorage.getItem("trainerServices") || "[]"),
            sportType: localStorage.getItem("trainerSportType"),
            availability,
          }),
        })
      }
    } catch (error) {
      console.error("Failed to save availability:", error)
    }

    setSaving(false)
    alert("Availability saved!")
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Availability Management
          </h1>
          <p className="text-gray-400 mt-1">
            Set your available times for booking
          </p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700"
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Availability"}
        </Button>
      </div>

      <Card className="p-6 bg-gray-800 border-gray-700">
        <div className="space-y-6">
          {DAYS.map(day => {
            const dayTimes = availability[day] || []
            const allSelected = dayTimes.length === TIMES.length

            return (
              <div key={day} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{day}</h3>
                  <Button
                    onClick={() => toggleAllDay(day)}
                    variant="outline"
                    size="sm"
                  >
                    {allSelected ? "Clear All" : "Select All"}
                  </Button>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {TIMES.map(time => {
                    const isSelected = dayTimes.includes(time)
                    return (
                      <button
                        key={time}
                        onClick={() => toggleTime(day, time)}
                        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-green-600 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        {time}
                      </button>
                    )
                  })}
                </div>
                <div className="text-sm text-gray-400">
                  {dayTimes.length} slots available
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <strong>💡 Tip:</strong> Click times to toggle availability. Green = available, Gray = blocked.
          Your clients will only see the times you've marked as available!
        </p>
      </div>
    </div>
  )
}


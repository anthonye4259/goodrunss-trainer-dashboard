"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Check, Clock, DollarSign, MapPin, Loader2 } from "lucide-react"

interface Trainer {
  id: string
  name: string
  email: string
  bio: string
  specialties: string[]
  hourlyRate: number
  image: string
  location: string
  sportType?: string
}

interface Service {
  id: string
  name: string
  duration: number
  price: number
  description: string
}

export default function PublicBookingPage() {
  const params = useParams()
  const trainerId = params.trainerId as string
  
  const [trainer, setTrainer] = useState<Trainer | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [availability, setAvailability] = useState<{[key: string]: string[]}>({})
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [selectedService, setSelectedService] = useState<string>()
  const [loading, setLoading] = useState(true)
  const [loadingTimes, setLoadingTimes] = useState(false)

  // Fetch trainer data on mount
  useEffect(() => {
    async function fetchTrainer() {
      try {
        const res = await fetch(`/api/public/trainer/${trainerId}`)
        if (res.ok) {
          const data = await res.json()
          setTrainer(data.trainer)
          setServices(data.services || [])
        }
      } catch (error) {
        console.error("Error fetching trainer:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTrainer()
  }, [trainerId])

  // Fetch availability on mount
  useEffect(() => {
    async function fetchAvailability() {
      try {
        const res = await fetch(`/api/public/availability/${trainerId}`)
        if (res.ok) {
          const data = await res.json()
          setAvailability(data.availability || {})
        }
      } catch (error) {
        console.error("Error fetching availability:", error)
      }
    }
    fetchAvailability()
  }, [trainerId])

  // Update available times when date changes
  useEffect(() => {
    if (selectedDate) {
      setLoadingTimes(true)
      setSelectedTime(undefined)
      
      // Get day of week (Sunday = 0, Monday = 1, etc.)
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      const dayName = dayNames[selectedDate.getDay()]
      
      // Get times for this day
      const timesForDay = availability[dayName] || []
      setAvailableTimes(timesForDay)
      setLoadingTimes(false)
    }
  }, [selectedDate, availability])

  const handleBooking = () => {
    if (!selectedDate || !selectedTime || !selectedService) {
      alert("Please select a service, date, and time")
      return
    }

    // Redirect to checkout
    const checkoutUrl = `/book/${trainerId}/checkout?service=${selectedService}&date=${selectedDate.toISOString()}&time=${encodeURIComponent(selectedTime)}`
    window.location.href = checkoutUrl
  }

  // Get sport-specific terminology
  const getTerminology = () => {
    const sportType = trainer?.sportType?.toLowerCase() || ''
    
    if (sportType.includes('pickleball')) {
      return { session: 'Lesson', sessions: 'Lessons', book: 'Book a Lesson' }
    } else if (sportType.includes('yoga') || sportType.includes('pilates') || sportType.includes('barre')) {
      return { session: 'Class', sessions: 'Classes', book: 'Book a Class' }
    } else if (sportType.includes('basketball') || sportType.includes('tennis') || sportType.includes('golf')) {
      return { session: 'Training Session', sessions: 'Training', book: 'Book Training' }
    } else {
      return { session: 'Session', sessions: 'Sessions', book: 'Book Session' }
    }
  }

  const terms = getTerminology()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!trainer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trainer Not Found</h1>
          <p className="text-gray-600">This booking link may be invalid.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Trainer Header */}
        <Card className="mb-8 p-8">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <img src={trainer.image || "/placeholder-avatar.png"} alt={trainer.name} />
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{trainer.name}</h1>
              <p className="text-gray-600 mb-4">{trainer.bio}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {trainer.location || "Remote"}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  ${trainer.hourlyRate}/{terms.session.toLowerCase()}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {trainer.specialties?.map((specialty, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Services */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Select a {terms.session}</h2>
            <div className="space-y-4">
              {services.length === 0 ? (
                <Card className="p-6 text-center text-gray-500">
                  <p>No {terms.sessions.toLowerCase()} available yet.</p>
                  <p className="text-sm mt-2">Contact {trainer.name} directly to book.</p>
                </Card>
              ) : (
                services.map((service) => (
                  <Card
                    key={service.id}
                    className={`p-6 cursor-pointer transition-all ${
                      selectedService === service.id
                        ? "border-green-500 border-2 bg-green-50"
                        : "hover:border-gray-400"
                    }`}
                    onClick={() => setSelectedService(service.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold">{service.name}</h3>
                      <span className="text-xl font-bold text-green-600">${service.price}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {service.duration} minutes
                    </div>
                    {selectedService === service.id && (
                      <div className="mt-3 flex items-center gap-2 text-green-600">
                        <Check className="h-5 w-5" />
                        <span className="font-medium">Selected</span>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Date & Time Selection */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Date & Time</h2>
            <Card className="p-6 mb-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md"
                disabled={(date) => date < new Date()}
              />
            </Card>

            {selectedDate && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Available Times</h3>
                {loadingTimes ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                  </div>
                ) : availableTimes.length === 0 ? (
                  <Card className="p-6 text-center text-gray-500">
                    <p>No times available on this day.</p>
                    <p className="text-sm mt-2">Please select another date.</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimes.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        className={selectedTime === time ? "bg-green-600 hover:bg-green-700" : ""}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedService && selectedDate && selectedTime && (
              <Button
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-lg py-6"
                onClick={handleBooking}
              >
                {terms.book}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

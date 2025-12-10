"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { ChevronLeft, Clock, X } from "lucide-react"

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
    businessName?: string
}

interface Service {
    id: string
    name: string
    duration: number
    price: number
    description: string
}

export default function EmbedBookingPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const trainerId = params.trainerId as string

    // Theme customization from URL params
    const primaryColor = searchParams.get("primary") || "000000"
    const accentColor = searchParams.get("accent") || "000000"

    const [trainer, setTrainer] = useState<Trainer | null>(null)
    const [services, setServices] = useState<Service[]>([])
    const [availability, setAvailability] = useState<{ [key: string]: string[] }>({})
    const [availableTimes, setAvailableTimes] = useState<string[]>([])
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [loading, setLoading] = useState(true)
    const [step, setStep] = useState<"services" | "datetime">("services")

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
            const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            const dayName = dayNames[selectedDate.getDay()]
            const timesForDay = availability[dayName] || []
            setAvailableTimes(timesForDay)
            setSelectedTime(null)
        }
    }, [selectedDate, availability])

    // Send height to parent for iframe resizing
    useEffect(() => {
        const sendHeight = () => {
            const height = document.body.scrollHeight
            window.parent.postMessage({ type: "goodrunss-embed-height", height }, "*")
        }
        sendHeight()
        const observer = new MutationObserver(sendHeight)
        observer.observe(document.body, { childList: true, subtree: true })
        return () => observer.disconnect()
    }, [])

    const handleServiceSelect = (service: Service) => {
        setSelectedService(service)
        setStep("datetime")
    }

    const handleBooking = () => {
        if (!selectedDate || !selectedTime || !selectedService) return

        const checkoutUrl = `/book/${trainerId}/checkout?service=${selectedService.id}&date=${selectedDate.toISOString()}&time=${encodeURIComponent(selectedTime)}`
        window.open(checkoutUrl, "_blank")
    }

    // Calendar helpers
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const days: (Date | null)[] = []

        // Add empty slots for days before first day of month
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null)
        }

        // Add all days in month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i))
        }

        return days
    }

    const isDateAvailable = (date: Date) => {
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const dayName = dayNames[date.getDay()]
        const times = availability[dayName] || []
        return times.length > 0 && date >= new Date(new Date().setHours(0, 0, 0, 0))
    }

    const formatMonthYear = (date: Date) => {
        return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    }

    const formatSelectedDate = (date: Date) => {
        return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    }

    // Get timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const getTimezoneAbbr = () => {
        const date = new Date()
        const options: Intl.DateTimeFormatOptions = { timeZoneName: "short" }
        const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(date)
        return parts.find(p => p.type === "timeZoneName")?.value || ""
    }

    const businessName = trainer?.businessName || trainer?.name || "Trainer"

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: `#${primaryColor}` }}></div>
            </div>
        )
    }

    if (!trainer) {
        return (
            <div className="min-h-[300px] flex items-center justify-center bg-white">
                <p className="text-gray-500">Booking not available</p>
            </div>
        )
    }

    return (
        <div className="bg-white font-sans text-gray-900" style={{ fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
            {/* Header */}
            {step === "datetime" && (
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <button
                        onClick={() => setStep("services")}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        SELECT APPOINTMENT
                    </button>
                    <h2 className="text-lg font-medium">Date & Time</h2>
                    <div className="w-24"></div>
                </div>
            )}

            {step === "services" && (
                <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-medium text-center">{businessName}</h2>
                </div>
            )}

            {/* Service Selection Step */}
            {step === "services" && (
                <div className="p-6">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-4">SELECT APPOINTMENT TYPE</p>
                    <div className="space-y-3">
                        {services.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => handleServiceSelect(service)}
                                className="w-full text-left p-4 border rounded-lg hover:border-gray-400 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-medium">{service.name}</h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {service.duration} minutes @ ${service.price.toFixed(2)}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Date & Time Selection Step */}
            {step === "datetime" && selectedService && (
                <div className="p-6">
                    {/* Selected Service Card */}
                    <div className="mb-6">
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">APPOINTMENT</p>
                        <div className="relative p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium mb-1">{selectedService.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                                {selectedService.duration} minutes @ ${selectedService.price.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-2">{selectedService.description}</p>
                            <button className="text-sm text-gray-500 hover:text-gray-700 mt-2">SHOW ALL</button>
                            <button
                                onClick={() => setStep("services")}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Calendar and Time Slots */}
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Calendar */}
                        <div className="flex-1">
                            {/* Month Navigation */}
                            <div className="flex items-center gap-4 mb-4">
                                <button
                                    className="px-3 py-1.5 bg-gray-100 rounded text-sm flex items-center gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    {formatMonthYear(currentMonth)}
                                    <ChevronLeft className="h-4 w-4 rotate-180" />
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                        className="p-1 hover:bg-gray-100 rounded"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                        className="p-1 hover:bg-gray-100 rounded"
                                    >
                                        <ChevronLeft className="h-5 w-5 rotate-180" />
                                    </button>
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            <div className="mb-4">
                                {/* Day Headers */}
                                <div className="grid grid-cols-7 mb-2">
                                    {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                                        <div key={i} className="text-center text-sm font-medium text-gray-500 py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Days */}
                                <div className="grid grid-cols-7 gap-1">
                                    {getDaysInMonth(currentMonth).map((date, i) => {
                                        if (!date) {
                                            return <div key={i} className="h-10"></div>
                                        }

                                        const isAvailable = isDateAvailable(date)
                                        const isSelected = selectedDate?.toDateString() === date.toDateString()
                                        const isToday = date.toDateString() === new Date().toDateString()

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => isAvailable && setSelectedDate(date)}
                                                disabled={!isAvailable}
                                                className={`
                          h-10 w-10 rounded-full flex items-center justify-center text-sm mx-auto transition-colors
                          ${isSelected
                                                        ? "text-white"
                                                        : isAvailable
                                                            ? "hover:bg-gray-100 text-gray-900"
                                                            : "text-gray-300 cursor-not-allowed"
                                                    }
                          ${isToday && !isSelected ? "font-bold" : ""}
                        `}
                                                style={isSelected ? { backgroundColor: `#${primaryColor}` } : {}}
                                            >
                                                {date.getDate()}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Time Slots */}
                        {selectedDate && (
                            <div className="flex-1">
                                <h3 className="font-medium mb-1">{formatSelectedDate(selectedDate)}</h3>
                                <p className="text-xs text-gray-500 uppercase mb-4">
                                    TIME ZONE: {timezone} ({getTimezoneAbbr()})
                                </p>

                                {availableTimes.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No times available on this day</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        {availableTimes.map((time) => {
                                            const isSelected = selectedTime === time
                                            return (
                                                <button
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`
                            py-3 px-4 border rounded text-sm font-medium transition-colors
                            ${isSelected
                                                            ? "text-white border-transparent"
                                                            : "hover:border-gray-400 text-gray-700"
                                                        }
                          `}
                                                    style={isSelected ? { backgroundColor: `#${primaryColor}` } : {}}
                                                >
                                                    {time}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Book Button */}
                                {selectedTime && (
                                    <button
                                        onClick={handleBooking}
                                        className="w-full mt-6 py-3 rounded text-white font-medium transition-opacity hover:opacity-90"
                                        style={{ backgroundColor: `#${primaryColor}` }}
                                    >
                                        Book Appointment
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* White-labeled Footer */}
            <div className="p-4 border-t text-center">
                <p className="text-xs text-gray-400">{businessName}</p>
            </div>
        </div>
    )
}

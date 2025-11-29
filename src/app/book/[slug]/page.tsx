"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, DollarSign, User, Users } from "lucide-react"

interface SessionType {
  name: string
  duration: number
  price: number
  description: string
}

interface TrainerInfo {
  name: string
  specialty: string
  sessionTypes: SessionType[]
}

interface TimeSlot {
  time: string
  available: boolean
}

interface GroupClass {
  id: string
  name: string
  description: string | null
  scheduledAt: string
  duration: number
  maxCapacity: number
  pricePerPerson: number
  location: string | null
  level: string
  currentBookings: number
  spotsLeft: number
  isFull: boolean
}

export default function BookingPage() {
  const params = useParams()
  const slug = params.slug as string
  const [trainerInfo, setTrainerInfo] = useState<TrainerInfo | null>(null)
  const [selectedSession, setSelectedSession] = useState<SessionType | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  
  // Group Classes state
  const [groupClasses, setGroupClasses] = useState<GroupClass[]>([])
  const [selectedClass, setSelectedClass] = useState<GroupClass | null>(null)
  const [activeTab, setActiveTab] = useState<string>("private")
  
  const { toast } = useToast()

  useEffect(() => {
    fetchTrainerInfo()
    fetchGroupClasses()
  }, [slug])

  useEffect(() => {
    if (selectedDate && selectedSession) {
      fetchAvailableSlots()
    }
  }, [selectedDate, selectedSession])

  const fetchTrainerInfo = async () => {
    try {
      const res = await fetch(`/api/book/${slug}/info`)
      if (res.ok) {
        const data = await res.json()
        setTrainerInfo(data)
      } else {
        toast({ title: "Error", description: "Trainer not found", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load trainer info", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = async () => {
    if (!selectedSession) return
    
    try {
      const res = await fetch(
        `/api/book/${slug}/slots?date=${selectedDate}&duration=${selectedSession.duration}`
      )
      if (res.ok) {
        const data = await res.json()
        setAvailableSlots(data.slots || [])
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load available times", variant: "destructive" })
    }
  }

  const fetchGroupClasses = async () => {
    try {
      const res = await fetch(`/api/book/${slug}/classes`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setGroupClasses(data.classes || [])
        }
      }
    } catch (error) {
      console.error("Failed to load group classes:", error)
    }
  }

  const handleBooking = async () => {
    if (!selectedSession || !selectedDate || !selectedTime || !clientName || !clientEmail) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" })
      return
    }

    setBooking(true)
    try {
      const res = await fetch(`/api/book/${slug}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionType: selectedSession.name,
          date: selectedDate,
          time: selectedTime,
          clientName,
          clientEmail,
          duration: selectedSession.duration,
          price: selectedSession.price,
        }),
      })

      const data = await res.json()
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        toast({ title: "Error", description: data.error || "Booking failed", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create booking", variant: "destructive" })
    } finally {
      setBooking(false)
    }
  }

  const handleClassBooking = async () => {
    if (!selectedClass || !clientName || !clientEmail) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" })
      return
    }

    setBooking(true)
    try {
      const res = await fetch(`/api/book/${slug}/book-class`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass.id,
          clientName,
          clientEmail,
          clientPhone,
        }),
      })

      const data = await res.json()
      
      if (data.waitlisted) {
        toast({ 
          title: "Added to Waitlist", 
          description: data.message,
        })
        setSelectedClass(null)
        setClientName("")
        setClientEmail("")
        setClientPhone("")
      } else if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else if (data.success) {
        toast({ 
          title: "Success!", 
          description: data.message,
        })
        setSelectedClass(null)
        setClientName("")
        setClientEmail("")
        setClientPhone("")
        fetchGroupClasses()
      } else {
        toast({ title: "Error", description: data.error || "Booking failed", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to book class", variant: "destructive" })
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!trainerInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Trainer not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="text-primary" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{trainerInfo.name}</h1>
              <p className="text-muted-foreground">{trainerInfo.specialty}</p>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Book Now</h2>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="private">Private Sessions</TabsTrigger>
              <TabsTrigger value="classes">Group Classes</TabsTrigger>
            </TabsList>

            <TabsContent value="private" className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-3 block">Select Session Type</Label>
              <div className="grid gap-3">
                {trainerInfo.sessionTypes.map((session) => (
                  <Card
                    key={session.name}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedSession?.name === session.name
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-white mb-1">{session.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{session.description}</p>
                        <div className="flex gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {session.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign size={14} />
                            ${session.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {selectedSession && (
              <>
                <div>
                  <Label htmlFor="date">Select Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                {selectedDate && availableSlots.length > 0 && (
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Available Times</Label>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className="w-full"
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTime && (
                  <>
                    <div>
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>

                    <Card className="p-4 bg-primary/5">
                      <h3 className="font-semibold text-white mb-2">Booking Summary</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Session:</span> {selectedSession.name}</p>
                        <p><span className="text-muted-foreground">Date:</span> {new Date(selectedDate).toLocaleDateString()}</p>
                        <p><span className="text-muted-foreground">Time:</span> {selectedTime}</p>
                        <p><span className="text-muted-foreground">Duration:</span> {selectedSession.duration} minutes</p>
                        <p className="text-lg font-semibold mt-2">
                          Total: ${selectedSession.price}
                        </p>
                      </div>
                    </Card>

                    <Button
                      onClick={handleBooking}
                      disabled={booking}
                      className="w-full bg-primary text-black hover:bg-primary/90"
                      size="lg"
                    >
                      {booking ? "Processing..." : "Book & Pay Now"}
                    </Button>
                  </>
                )}
              </>
            )}
            </TabsContent>

            <TabsContent value="classes" className="space-y-6">
              {groupClasses.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No group classes available at this time</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupClasses.map((cls) => {
                    const classDate = new Date(cls.scheduledAt)
                    const fillPercentage = (cls.currentBookings / cls.maxCapacity) * 100

                    return (
                      <Card
                        key={cls.id}
                        className={`p-4 cursor-pointer transition-all ${
                          selectedClass?.id === cls.id
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedClass(cls)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-white">{cls.name}</h3>
                              {cls.isFull && <Badge variant="destructive">Full</Badge>}
                              {cls.level && cls.level !== 'all_levels' && (
                                <Badge variant="outline" className="capitalize">{cls.level}</Badge>
                              )}
                            </div>
                            {cls.description && (
                              <p className="text-sm text-muted-foreground mb-2">{cls.description}</p>
                            )}
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {classDate.toLocaleDateString()} at {classDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {cls.duration} mins
                              </span>
                              <span className="flex items-center gap-1">
                                <Users size={14} />
                                {cls.currentBookings}/{cls.maxCapacity} {cls.isFull ? '(Waitlist Available)' : `(${cls.spotsLeft} spots left)`}
                              </span>
                              {cls.location && <span>📍 {cls.location}</span>}
                              <span className="flex items-center gap-1">
                                <DollarSign size={14} />
                                ${cls.pricePerPerson}
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  fillPercentage >= 100 ? 'bg-red-500' :
                                  fillPercentage >= 75 ? 'bg-yellow-500' :
                                  'bg-primary'
                                }`}
                                style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}

                  {selectedClass && (
                    <Card className="p-6 mt-6 bg-primary/5">
                      <h3 className="font-semibold text-white mb-4">Complete Booking</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="class-name">Your Name</Label>
                          <Input
                            id="class-name"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="John Doe"
                          />
                        </div>

                        <div>
                          <Label htmlFor="class-email">Email Address</Label>
                          <Input
                            id="class-email"
                            type="email"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            placeholder="john@example.com"
                          />
                        </div>

                        <div>
                          <Label htmlFor="class-phone">Phone Number (Optional)</Label>
                          <Input
                            id="class-phone"
                            type="tel"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>

                        <Card className="p-4 bg-background/50">
                          <h4 className="font-semibold text-white mb-2">Booking Summary</h4>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-muted-foreground">Class:</span> {selectedClass.name}</p>
                            <p><span className="text-muted-foreground">Date:</span> {new Date(selectedClass.scheduledAt).toLocaleDateString()}</p>
                            <p><span className="text-muted-foreground">Time:</span> {new Date(selectedClass.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <p><span className="text-muted-foreground">Duration:</span> {selectedClass.duration} minutes</p>
                            {selectedClass.location && <p><span className="text-muted-foreground">Location:</span> {selectedClass.location}</p>}
                            <p className="text-lg font-semibold mt-2">
                              {selectedClass.isFull ? 'Join Waitlist (Free)' : `Total: $${selectedClass.pricePerPerson}`}
                            </p>
                          </div>
                        </Card>

                        <Button
                          onClick={handleClassBooking}
                          disabled={booking}
                          className="w-full bg-primary text-black hover:bg-primary/90"
                          size="lg"
                        >
                          {booking ? "Processing..." : selectedClass.isFull ? "Join Waitlist" : "Book & Pay Now"}
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

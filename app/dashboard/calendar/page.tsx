"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Plus, Clock, User, Trash2, Edit, CalendarIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { RescheduleModal } from "@/components/reschedule-modal"
import { demoSessions } from "@/lib/demo-data"

// Sessions will be loaded from your database or demo data
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [sessions, setSessions] = useState<any[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [rescheduleSession, setRescheduleSession] = useState<any | null>(null)
  const { toast } = useToast()

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/sessions')
      if (!response.ok) throw new Error('Failed to fetch sessions')
      const data = await response.json()
      
      // If no real sessions, use demo data
      if (!data.sessions || data.sessions.length === 0) {
        setSessions(demoSessions)
      } else {
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
      // Fallback to demo data on error
      setSessions(demoSessions)
    } finally {
      setIsLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const days = getDaysInMonth(currentDate)

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getSessionsForDate = (date: Date | null) => {
    if (!date) return []
    const dateStr = date.toISOString().split("T")[0]
    return sessions.filter((s) => s.date === dateStr)
  }

  const validateForm = (formData: FormData): boolean => {
    const errors: Record<string, string> = {}

    const clientName = formData.get("client") as string
    const date = formData.get("date") as string
    const time = formData.get("time") as string

    if (!clientName || clientName.trim().length < 2) {
      errors.client = "Client name is required"
    }

    if (!date) {
      errors.date = "Date is required"
    }

    if (!time) {
      errors.time = "Time is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    if (!validateForm(formData)) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.get("client") as string,
          date: formData.get("date") as string,
          time: formData.get("time") as string,
          duration: Number(formData.get("duration")),
          type: formData.get("type") as string,
          location: formData.get("location") as string,
          notes: formData.get("notes") as string,
        }),
      })

      if (!response.ok) throw new Error('Failed to schedule session')

      const data = await response.json()
      
      // Refresh the sessions list
      await fetchSessions()
      
      setIsAddDialogOpen(false)
      setFormErrors({})
      toast({
        title: "Session scheduled",
        description: `Session with ${data.session.clientName} has been scheduled.`,
      })
    } catch (error) {
      console.error('Error scheduling session:', error)
      toast({
        title: "Error scheduling session",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSession = (sessionId: string) => {
    setSessions(sessions.filter((s) => s.id !== sessionId))
    toast({
      title: "Session deleted",
      description: "The session has been removed from your calendar.",
    })
  }

  const handleReschedule = (newDate: Date, newTime: string) => {
    if (rescheduleSession) {
      setSessions(
        sessions.map((s) =>
          s.id === rescheduleSession.id ? { ...s, date: newDate.toISOString().split("T")[0], time: newTime } : s,
        ),
      )
      toast({
        title: "Session rescheduled",
        description: `Session with ${rescheduleSession.clientName} has been rescheduled.`,
      })
      setRescheduleSession(null)
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Calendar</h1>
          <p className="mt-2 text-muted-foreground">Manage your training schedule</p>
        </div>

        <div className="flex items-center gap-3">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "month" | "week" | "day")}>
            <TabsList className="bg-card">
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
          </Tabs>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Schedule Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleAddSession}>
                <DialogHeader>
                  <DialogTitle>Schedule New Session</DialogTitle>
                  <DialogDescription>Enter the session details below.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="client">Client Name</Label>
                    <Input
                      id="client"
                      name="client"
                      placeholder="Sarah Johnson"
                      className={formErrors.client ? "border-red-500" : ""}
                    />
                    {formErrors.client && <p className="text-sm text-red-500">{formErrors.client}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" className={formErrors.date ? "border-red-500" : ""} />
                    {formErrors.date && <p className="text-sm text-red-500">{formErrors.date}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" name="time" type="time" className={formErrors.time ? "border-red-500" : ""} />
                    {formErrors.time && <p className="text-sm text-red-500">{formErrors.time}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select name="duration" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                        <SelectItem value="120">120 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Session Type</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Training">Training</SelectItem>
                        <SelectItem value="Assessment">Assessment</SelectItem>
                        <SelectItem value="Consultation">Consultation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false)
                      setFormErrors({})
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Spinner className="h-4 w-4" />}
                    {isSubmitting ? "Scheduling..." : "Schedule"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass border-border/50 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              {days.map((day, index) => {
                const isToday = day && day.getTime() === today.getTime()
                const sessionsForDay = getSessionsForDate(day)
                const hasSession = sessionsForDay.length > 0

                return (
                  <button
                    key={index}
                    onClick={() => day && setSelectedDate(day)}
                    disabled={!day}
                    className={`
                      aspect-square p-2 rounded-lg text-sm transition-smooth
                      ${!day ? "invisible" : ""}
                      ${isToday ? "bg-primary text-primary-foreground font-bold" : "hover:bg-card"}
                      ${hasSession && !isToday ? "bg-primary/20 font-semibold" : ""}
                      ${selectedDate && day && selectedDate.getTime() === day.getTime() ? "ring-2 ring-primary" : ""}
                    `}
                  >
                    {day && (
                      <div className="flex flex-col items-center">
                        <span>{day.getDate()}</span>
                        {hasSession && (
                          <div className="mt-1 flex gap-0.5">
                            {sessionsForDay.slice(0, 3).map((_, i) => (
                              <div key={i} className="h-1 w-1 rounded-full bg-current" />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>
              {selectedDate ? `Sessions on ${selectedDate.toLocaleDateString()}` : "Upcoming Sessions"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(selectedDate ? getSessionsForDate(selectedDate) : sessions.slice(0, 5)).map((session: any) => (
              <div key={session.id} className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{session.clientName}</p>
                      <p className="text-xs text-muted-foreground">{session.type}</p>
                    </div>
                  </div>
                  <Badge className="bg-primary/20 text-primary">{session.status}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {session.time}
                  </span>
                  <span>{session.duration} min</span>
                </div>
                <div className="flex gap-2 pt-2 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 bg-transparent"
                    onClick={() => setRescheduleSession(session)}
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 text-destructive hover:text-destructive bg-transparent"
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {(selectedDate ? getSessionsForDate(selectedDate) : sessions).length === 0 && (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CalendarIcon />
                  </EmptyMedia>
                  <EmptyTitle>No sessions scheduled</EmptyTitle>
                  <EmptyDescription>
                    {selectedDate ? "No sessions on this date" : "Schedule your first session to get started"}
                  </EmptyDescription>
                </EmptyHeader>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Schedule Session
                </Button>
              </Empty>
            )}
          </CardContent>
        </Card>
      </div>

      {rescheduleSession && (
        <RescheduleModal
          open={!!rescheduleSession}
          onOpenChange={(open) => !open && setRescheduleSession(null)}
          session={{
            clientName: rescheduleSession.clientName,
            originalDate: rescheduleSession.date,
            originalTime: rescheduleSession.time,
          }}
          onReschedule={handleReschedule}
        />
      )}
    </div>
  )
}

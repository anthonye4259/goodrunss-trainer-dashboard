"use client"

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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, User, Loader2, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns"

type Session = {
  id: string
  title: string
  description?: string
  type: string
  duration: number
  scheduledAt: string
  location?: string
  status: string
  notes?: string
  clients?: {
    id: string
    name: string
    email: string
  }
}

export default function CalendarPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [newSession, setNewSession] = useState({
    clientId: "",
    title: "",
    type: "PERSONAL_TRAINING",
    duration: "60",
    scheduledAt: "",
    location: "",
    notes: "",
  })

  useEffect(() => {
    loadData()
  }, [currentMonth])

  const loadData = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Load sessions for current month
      const start = startOfMonth(currentMonth)
      const end = endOfMonth(currentMonth)
      
      const sessionsRes = await fetch(
        `/api/sessions?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      )
      const sessionsData = await sessionsRes.json()

      if (!sessionsRes.ok) {
        throw new Error(sessionsData.error || "Failed to load sessions")
      }

      setSessions(sessionsData.sessions || [])

      // Load clients
      const clientsRes = await fetch("/api/clients")
      const clientsData = await clientsRes.json()
      
      if (clientsRes.ok) {
        setClients(clientsData.clients || [])
      }
    } catch (err: any) {
      console.error("Load error:", err)
      setError(err.message || "Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSession = async () => {
    if (!newSession.clientId || !newSession.title || !newSession.scheduledAt) {
      setError("Please fill in all required fields")
      return
    }

    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: newSession.clientId,
          title: newSession.title,
          type: newSession.type,
          duration: parseInt(newSession.duration),
          scheduledAt: newSession.scheduledAt,
          location: newSession.location,
          notes: newSession.notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create session")
      }

      setSuccess("Session scheduled successfully!")
      setTimeout(() => setSuccess(""), 3000)
      setIsAddDialogOpen(false)
      setNewSession({ 
        clientId: "", 
        title: "", 
        type: "PERSONAL_TRAINING", 
        duration: "60", 
        scheduledAt: "", 
        location: "", 
        notes: "" 
      })
      
      // Reload sessions
      loadData()
    } catch (err: any) {
      console.error("Create session error:", err)
      setError(err.message || "Failed to create session")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update session")
      }

      setSuccess(`Session ${status.toLowerCase()} successfully!`)
      setTimeout(() => setSuccess(""), 3000)
      setSelectedSession(null)
      
      // Reload sessions
      loadData()
    } catch (err: any) {
      console.error("Update session error:", err)
      setError(err.message || "Failed to update session")
    }
  }

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const sessionsForSelectedDate = sessions.filter((session) =>
    isSameDay(new Date(session.scheduledAt), selectedDate)
  )

  const getSessionsForDay = (day: Date) => {
    return sessions.filter((session) => isSameDay(new Date(session.scheduledAt), day))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
      case "CONFIRMED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30"
      case "IN_PROGRESS":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
      case "COMPLETED":
        return "bg-green-500/10 text-green-400 border-green-500/30"
      case "CANCELLED":
      case "NO_SHOW":
        return "bg-red-500/10 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-muted-foreground mt-1">Manage your training sessions</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Schedule Session
          </Button>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {format(currentMonth, "MMMM yyyy")}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                {daysInMonth.map((day, idx) => {
                  const daySessions = getSessionsForDay(day)
                  const isSelected = isSameDay(day, selectedDate)
                  const isToday = isSameDay(day, new Date())
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "aspect-square p-2 rounded-lg text-sm transition-colors relative",
                        isSelected && "bg-primary text-primary-foreground",
                        !isSelected && isToday && "bg-primary/10 text-primary",
                        !isSelected && !isToday && "hover:bg-muted"
                      )}
                    >
                      <div>{format(day, "d")}</div>
                      {daySessions.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {daySessions.slice(0, 3).map((_, i) => (
                            <div key={i} className="h-1 w-1 rounded-full bg-current" />
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Day Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {format(selectedDate, "MMMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessionsForSelectedDate.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No sessions scheduled
                </p>
              ) : (
                <div className="space-y-3">
                  {sessionsForSelectedDate.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium">{session.title}</p>
                        <Badge className={cn("text-xs", getStatusColor(session.status))}>
                          {session.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{session.clients?.name || "No client"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(new Date(session.scheduledAt), "h:mm a")} • {session.duration} min
                          </span>
                        </div>
                        {session.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{session.location}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add Session Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Session</DialogTitle>
              <DialogDescription>Create a new training session with a client</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="client">Client *</Label>
                <Select value={newSession.clientId} onValueChange={(val) => setNewSession({ ...newSession, clientId: val })}>
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Session Title *</Label>
                <Input
                  id="title"
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  placeholder="e.g., Morning Training Session"
                  disabled={isSaving}
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newSession.type} onValueChange={(val) => setNewSession({ ...newSession, type: val })}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERSONAL_TRAINING">Personal Training</SelectItem>
                    <SelectItem value="GROUP_FITNESS">Group Fitness</SelectItem>
                    <SelectItem value="NUTRITION_COACHING">Nutrition Coaching</SelectItem>
                    <SelectItem value="ONLINE_COACHING">Online Coaching</SelectItem>
                    <SelectItem value="ASSESSMENT">Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newSession.duration}
                    onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <Label htmlFor="scheduledAt">Date & Time *</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={newSession.scheduledAt}
                    onChange={(e) => setNewSession({ ...newSession, scheduledAt: e.target.value })}
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newSession.location}
                  onChange={(e) => setNewSession({ ...newSession, location: e.target.value })}
                  placeholder="e.g., Main Gym"
                  disabled={isSaving}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newSession.notes}
                  onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                  placeholder="Any special notes or instructions..."
                  rows={3}
                  disabled={isSaving}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleAddSession} disabled={isSaving}>
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scheduling...
                  </div>
                ) : (
                  "Schedule Session"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Session Details Dialog */}
        <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedSession?.title}</DialogTitle>
              <DialogDescription>
                {selectedSession?.clients?.name} • {format(new Date(selectedSession?.scheduledAt || new Date()), "PPp")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Status</Label>
                <Badge className={cn("mt-1", getStatusColor(selectedSession?.status || ""))}>
                  {selectedSession?.status}
                </Badge>
              </div>
              <div>
                <Label>Duration</Label>
                <p className="text-sm">{selectedSession?.duration} minutes</p>
              </div>
              {selectedSession?.location && (
                <div>
                  <Label>Location</Label>
                  <p className="text-sm">{selectedSession.location}</p>
                </div>
              )}
              {selectedSession?.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm text-muted-foreground">{selectedSession.notes}</p>
                </div>
              )}
            </div>
            <DialogFooter className="flex gap-2">
              {selectedSession?.status === "SCHEDULED" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedSession.id, "CANCELLED")}
                  >
                    Cancel Session
                  </Button>
                  <Button onClick={() => handleUpdateStatus(selectedSession.id, "COMPLETED")}>
                    Mark Complete
                  </Button>
                </>
              )}
              {selectedSession?.status === "CONFIRMED" && (
                <Button onClick={() => handleUpdateStatus(selectedSession.id, "COMPLETED")}>
                  Mark Complete
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

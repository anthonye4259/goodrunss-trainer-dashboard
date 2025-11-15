"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, User } from "lucide-react"
import { cn } from "@/lib/utils"

type Session = {
  id: string
  client: string
  time: string
  duration: string
  sport: string
  location: string
  status: "upcoming" | "completed" | "cancelled"
  notes?: string
}

const initialSessions: Session[] = [
  {
    id: "1",
    client: "Sarah Johnson",
    time: "9:00 AM",
    duration: "60 min",
    sport: "Basketball",
    location: "Court A",
    status: "upcoming",
  },
  {
    id: "2",
    client: "Mike Chen",
    time: "11:30 AM",
    duration: "45 min",
    sport: "Tennis",
    location: "Court B",
    status: "upcoming",
  },
  {
    id: "3",
    client: "Emma Davis",
    time: "2:00 PM",
    duration: "90 min",
    sport: "Running",
    location: "Track",
    status: "upcoming",
  },
]

export default function CalendarPage() {
  const [sessions, setSessions] = useState<Session[]>(initialSessions)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [newSession, setNewSession] = useState({
    client: "",
    time: "",
    duration: "60",
    sport: "",
    location: "",
    notes: "",
  })

  const handleAddSession = () => {
    const session: Session = {
      id: Date.now().toString(),
      client: newSession.client,
      time: newSession.time,
      duration: `${newSession.duration} min`,
      sport: newSession.sport,
      location: newSession.location,
      status: "upcoming",
      notes: newSession.notes,
    }
    setSessions([...sessions, session])
    setIsAddDialogOpen(false)
    setNewSession({ client: "", time: "", duration: "60", sport: "", location: "", notes: "" })
  }

  const handleCancelSession = (id: string) => {
    setSessions(sessions.map((s) => (s.id === id ? { ...s, status: "cancelled" as const } : s)))
    setSelectedSession(null)
  }

  const handleCompleteSession = (id: string) => {
    setSessions(sessions.map((s) => (s.id === id ? { ...s, status: "completed" as const } : s)))
    setSelectedSession(null)
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-balance">Training Calendar</h1>
          <p className="mt-2 text-muted-foreground">Manage your sessions and availability</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Schedule Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule New Session</DialogTitle>
              <DialogDescription>Add a new training session to your calendar</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="client">Client Name</Label>
                <Input
                  id="client"
                  value={newSession.client}
                  onChange={(e) => setNewSession({ ...newSession, client: e.target.value })}
                  placeholder="Enter client name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newSession.time}
                    onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Select
                    value={newSession.duration}
                    onValueChange={(v) => setNewSession({ ...newSession, duration: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                      <SelectItem value="90">90 min</SelectItem>
                      <SelectItem value="120">120 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sport">Sport/Activity</Label>
                <Input
                  id="sport"
                  value={newSession.sport}
                  onChange={(e) => setNewSession({ ...newSession, sport: e.target.value })}
                  placeholder="e.g., Basketball, Tennis, Running"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newSession.location}
                  onChange={(e) => setNewSession({ ...newSession, location: e.target.value })}
                  placeholder="e.g., Court A, Track"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={newSession.notes}
                  onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                  placeholder="Add any additional notes"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSession} disabled={!newSession.client || !newSession.time || !newSession.sport}>
                Schedule Session
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar Navigation */}
      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Sessions List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Today's Sessions</h2>
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className={cn(
                "glass border-border/50 cursor-pointer transition-smooth hover:border-primary/50",
                session.status === "cancelled" && "opacity-50",
              )}
              onClick={() => setSelectedSession(session)}
            >
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/20">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold">{session.client}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.time} ({session.duration})
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {session.location}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-primary">{session.sport}</p>
                  </div>
                </div>
                <Badge
                  variant={
                    session.status === "upcoming"
                      ? "default"
                      : session.status === "completed"
                        ? "secondary"
                        : "destructive"
                  }
                  className="text-sm"
                >
                  {session.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Session Details Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>Manage this training session</DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Client</Label>
                <p className="text-lg font-semibold">{selectedSession.client}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Time</Label>
                  <p className="font-medium">{selectedSession.time}</p>
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <p className="font-medium">{selectedSession.duration}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sport/Activity</Label>
                <p className="font-medium">{selectedSession.sport}</p>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <p className="font-medium">{selectedSession.location}</p>
              </div>
              {selectedSession.notes && (
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <p className="text-sm text-muted-foreground">{selectedSession.notes}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Status</Label>
                <Badge
                  variant={
                    selectedSession.status === "upcoming"
                      ? "default"
                      : selectedSession.status === "completed"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {selectedSession.status}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            {selectedSession?.status === "upcoming" && (
              <>
                <Button variant="outline" onClick={() => handleCancelSession(selectedSession.id)}>
                  Cancel Session
                </Button>
                <Button onClick={() => handleCompleteSession(selectedSession.id)}>Mark Complete</Button>
              </>
            )}
            {selectedSession?.status !== "upcoming" && (
              <Button variant="outline" onClick={() => setSelectedSession(null)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

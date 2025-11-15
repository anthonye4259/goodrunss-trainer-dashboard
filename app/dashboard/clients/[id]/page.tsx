"use client"

import type React from "react"

import { use, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Clock,
  MessageSquare,
  Plus,
  CheckCircle2,
  ImageIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock client data
const mockClient = {
  id: "1",
  name: "Sarah Johnson",
  email: "sarah.j@email.com",
  phone: "+1 (555) 123-4567",
  sport: "Basketball",
  status: "active",
  joinedDate: "2023-06-15",
  totalSessions: 24,
  completedSessions: 22,
  upcomingSessions: 2,
  totalRevenue: 3600,
  sessions: [
    {
      id: "1",
      date: "2024-01-15",
      time: "09:00",
      duration: 60,
      type: "Training",
      status: "upcoming",
      notes: "Focus on shooting drills",
    },
    {
      id: "2",
      date: "2024-01-12",
      time: "09:00",
      duration: 60,
      type: "Training",
      status: "completed",
      notes: "Great progress on defense",
    },
    {
      id: "3",
      date: "2024-01-10",
      time: "09:00",
      duration: 60,
      type: "Assessment",
      status: "completed",
      notes: "Baseline fitness test completed",
    },
  ],
  notes: [
    {
      id: "1",
      date: "2024-01-12",
      content: "Client showed significant improvement in defensive positioning. Continue with current training plan.",
      author: "Coach Alex",
    },
    {
      id: "2",
      date: "2024-01-05",
      content: "Discussed goals for the month. Focus areas: shooting accuracy and stamina.",
      author: "Coach Alex",
    },
  ],
}

const mockProgressData = [
  { date: "2024-01-01", weight: 185, bodyFat: 18 },
  { date: "2024-01-08", weight: 183, bodyFat: 17.5 },
  { date: "2024-01-15", weight: 181, bodyFat: 17 },
  { date: "2024-01-22", weight: 180, bodyFat: 16.5 },
]

const mockMeasurements = [
  { date: "2024-01-01", chest: 42, waist: 34, hips: 40, arms: 15, thighs: 24 },
  { date: "2024-01-15", chest: 42.5, waist: 33, hips: 39.5, arms: 15.5, thighs: 24.5 },
]

const mockGoals = [
  { id: "1", title: "Lose 10 lbs", target: "175 lbs", current: "180 lbs", progress: 50, deadline: "2024-03-01" },
  { id: "2", title: "Run 5K under 25 min", target: "25:00", current: "27:30", progress: 70, deadline: "2024-02-15" },
  {
    id: "3",
    title: "Bench Press 225 lbs",
    target: "225 lbs",
    current: "205 lbs",
    progress: 91,
    deadline: "2024-04-01",
  },
]

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [client] = useState(mockClient)
  const [newNote, setNewNote] = useState("")
  const [notes, setNotes] = useState(mockClient.notes)
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false)
  const [isMeasurementDialogOpen, setIsMeasurementDialogOpen] = useState(false)
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false)
  const [progressData, setProgressData] = useState(mockProgressData)
  const [measurements, setMeasurements] = useState(mockMeasurements)
  const [goals, setGoals] = useState(mockGoals)

  const handleAddNote = () => {
    if (!newNote.trim()) return

    const note = {
      id: String(notes.length + 1),
      date: new Date().toISOString().split("T")[0],
      content: newNote,
      author: "Coach Alex",
    }

    setNotes([note, ...notes])
    setNewNote("")
    toast({
      title: "Note added",
      description: "Your note has been saved successfully.",
    })
  }

  const handleScheduleSession = () => {
    router.push("/dashboard/calendar")
  }

  const handleSendMessage = () => {
    toast({
      title: "Message sent",
      description: `Message sent to ${client.name}`,
    })
  }

  const handleAddProgress = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Progress Updated",
      description: "Weight and body fat percentage recorded.",
    })
    setIsProgressDialogOpen(false)
  }

  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Measurements Updated",
      description: "Body measurements have been recorded.",
    })
    setIsMeasurementDialogOpen(false)
  }

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Goal Added",
      description: "New goal has been added for this client.",
    })
    setIsGoalDialogOpen(false)
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/clients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{client.name}</h1>
            <p className="mt-2 text-muted-foreground">
              Client since {new Date(client.joinedDate).toLocaleDateString()}
            </p>
          </div>
          <Badge
            variant={client.status === "active" ? "default" : "secondary"}
            className={client.status === "active" ? "bg-primary/20 text-primary" : ""}
          >
            {client.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent" onClick={handleSendMessage}>
            <MessageSquare className="h-4 w-4" />
            Message
          </Button>
          <Button
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleScheduleSession}
          >
            <Calendar className="h-4 w-4" />
            Schedule Session
          </Button>
        </div>
      </div>

      {/* Contact Info */}
      <Card className="glass border-border/50">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{client.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{client.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sport</p>
                <p className="font-medium">{client.sport}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{client.totalSessions}</div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{client.completedSessions}</div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{client.upcomingSessions}</div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${client.totalRevenue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="bg-card">
          <TabsTrigger value="sessions">Session Timeline</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          {client.sessions.map((session) => (
            <Card key={session.id} className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${session.status === "completed" ? "bg-primary/20" : "bg-muted"}`}
                    >
                      {session.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{session.type}</h3>
                        <Badge
                          variant={session.status === "completed" ? "default" : "secondary"}
                          className={session.status === "completed" ? "bg-primary/20 text-primary" : ""}
                        >
                          {session.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {new Date(session.date).toLocaleDateString()} at {session.time} • {session.duration} minutes
                      </p>
                      {session.notes && <p className="mt-2 text-sm">{session.notes}</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Weight & Body Fat</CardTitle>
                <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Entry
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Progress</DialogTitle>
                      <DialogDescription>Add weight and body fat measurements</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddProgress} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (lbs)</Label>
                        <Input id="weight" type="number" step="0.1" placeholder="180" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bodyFat">Body Fat %</Label>
                        <Input id="bodyFat" type="number" step="0.1" placeholder="16.5" />
                      </div>
                      <Button type="submit" className="w-full">
                        Save Progress
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    weight: {
                      label: "Weight (lbs)",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[250px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Body Measurements</CardTitle>
                <Dialog open={isMeasurementDialogOpen} onOpenChange={setIsMeasurementDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Entry
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Measurements</DialogTitle>
                      <DialogDescription>Add body measurements in inches</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddMeasurement} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="mDate">Date</Label>
                        <Input id="mDate" type="date" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="chest">Chest (in)</Label>
                          <Input id="chest" type="number" step="0.1" placeholder="42" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="waist">Waist (in)</Label>
                          <Input id="waist" type="number" step="0.1" placeholder="34" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hips">Hips (in)</Label>
                          <Input id="hips" type="number" step="0.1" placeholder="40" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="arms">Arms (in)</Label>
                          <Input id="arms" type="number" step="0.1" placeholder="15" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="thighs">Thighs (in)</Label>
                          <Input id="thighs" type="number" step="0.1" placeholder="24" />
                        </div>
                      </div>
                      <Button type="submit" className="w-full">
                        Save Measurements
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {measurements.map((m, i) => (
                    <div key={i} className="p-4 rounded-lg bg-secondary/50">
                      <div className="text-sm text-muted-foreground mb-3">{m.date}</div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Chest</div>
                          <div className="font-semibold">{m.chest}"</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Waist</div>
                          <div className="font-semibold">{m.waist}"</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Hips</div>
                          <div className="font-semibold">{m.hips}"</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Arms</div>
                          <div className="font-semibold">{m.arms}"</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Thighs</div>
                          <div className="font-semibold">{m.thighs}"</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-foreground">Progress Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg bg-secondary/50 flex items-center justify-center cursor-pointer hover:bg-secondary transition-colors"
                  >
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                ))}
                <Button variant="outline" className="aspect-square bg-transparent">
                  <Plus className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Goal</DialogTitle>
                  <DialogDescription>Set a new goal for this client</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddGoal} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="goalTitle">Goal Title</Label>
                    <Input id="goalTitle" placeholder="Lose 10 lbs" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current">Current</Label>
                    <Input id="current" placeholder="180 lbs" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target">Target</Label>
                    <Input id="target" placeholder="175 lbs" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input id="deadline" type="date" required />
                  </div>
                  <Button type="submit" className="w-full">
                    Add Goal
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {goals.map((goal) => (
            <Card key={goal.id} className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Deadline: {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="bg-primary/20 text-primary">{goal.progress}%</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current: {goal.current}</span>
                    <span className="text-muted-foreground">Target: {goal.target}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add New Note
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your notes about this client..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={4}
              />
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddNote}>
                Save Note
              </Button>
            </CardContent>
          </Card>

          {notes.map((note) => (
            <Card key={note.id} className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{note.author}</p>
                      <p className="text-sm text-muted-foreground">{new Date(note.date).toLocaleDateString()}</p>
                    </div>
                    <p className="mt-2 text-sm">{note.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Bell, Mail, MessageSquare, Clock, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

const mockReminders = [
  {
    id: "1",
    name: "Session Reminder - 24h Before",
    type: "email",
    trigger: "24h before session",
    message: "Hi {client_name}, this is a reminder about your training session tomorrow at {session_time}.",
    active: true,
    sentCount: 156,
  },
  {
    id: "2",
    name: "Session Reminder - 1h Before",
    type: "sms",
    trigger: "1h before session",
    message: "Your training session with Coach Alex starts in 1 hour at {session_time}. See you soon!",
    active: true,
    sentCount: 142,
  },
  {
    id: "3",
    name: "Payment Due Reminder",
    type: "email",
    trigger: "Payment overdue",
    message: "Hi {client_name}, your payment of ${amount} is now overdue. Please settle at your earliest convenience.",
    active: true,
    sentCount: 23,
  },
  {
    id: "4",
    name: "Weekly Check-in",
    type: "email",
    trigger: "Every Monday 9am",
    message:
      "Hi {client_name}, how was your training last week? Let me know if you need any adjustments to your program.",
    active: false,
    sentCount: 89,
  },
]

export default function RemindersPage() {
  const [reminders, setReminders] = useState(mockReminders)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Reminder Created",
      description: "New automated reminder has been created.",
    })
    setIsCreateDialogOpen(false)
  }

  const handleToggleReminder = (id: string) => {
    setReminders(reminders.map((r) => (r.id === id ? { ...r, active: !r.active } : r)))
    toast({
      title: "Reminder Updated",
      description: "Reminder status has been changed.",
    })
  }

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id))
    toast({
      title: "Reminder Deleted",
      description: "Reminder has been removed.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Automated Reminders</h1>
          <p className="text-muted-foreground mt-1">Set up automatic notifications for your clients</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Automated Reminder</DialogTitle>
              <DialogDescription>Set up a new automatic notification</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateReminder} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reminderName">Reminder Name</Label>
                <Input id="reminderName" placeholder="Session Reminder - 24h Before" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Notification Type</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="both">Email & SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trigger">Trigger</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 hours before session</SelectItem>
                      <SelectItem value="12h">12 hours before session</SelectItem>
                      <SelectItem value="1h">1 hour before session</SelectItem>
                      <SelectItem value="payment">Payment overdue</SelectItem>
                      <SelectItem value="weekly">Weekly (Monday 9am)</SelectItem>
                      <SelectItem value="monthly">Monthly (1st of month)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message Template</Label>
                <Textarea id="message" placeholder="Hi {client_name}, this is a reminder about..." rows={4} required />
                <p className="text-xs text-muted-foreground">
                  Available variables: {"{client_name}"}, {"{session_time}"}, {"{session_date}"}, {"{amount}"}
                </p>
              </div>
              <Button type="submit" className="w-full">
                Create Reminder
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{reminders.filter((r) => r.active).length}</div>
            <p className="text-xs text-primary mt-1">Currently running</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {reminders.reduce((sum, r) => sum + r.sentCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">47</div>
            <p className="text-xs text-primary mt-1">+12 from last week</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-foreground">Your Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <Card key={reminder.id} className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          reminder.active ? "bg-primary/20" : "bg-muted"
                        }`}
                      >
                        {reminder.type === "email" ? (
                          <Mail className={`w-5 h-5 ${reminder.active ? "text-primary" : "text-muted-foreground"}`} />
                        ) : reminder.type === "sms" ? (
                          <MessageSquare
                            className={`w-5 h-5 ${reminder.active ? "text-primary" : "text-muted-foreground"}`}
                          />
                        ) : (
                          <Bell className={`w-5 h-5 ${reminder.active ? "text-primary" : "text-muted-foreground"}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{reminder.name}</h3>
                          <Badge className={reminder.active ? "bg-primary/20 text-primary" : "bg-muted"}>
                            {reminder.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Clock className="w-4 h-4" />
                          <span>{reminder.trigger}</span>
                        </div>
                        <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                          {reminder.message}
                        </p>
                        <div className="mt-3 text-xs text-muted-foreground">Sent {reminder.sentCount} times</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={reminder.active} onCheckedChange={() => handleToggleReminder(reminder.id)} />
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteReminder(reminder.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

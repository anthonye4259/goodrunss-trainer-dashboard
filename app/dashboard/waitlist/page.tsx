"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, Check, X, Users, Bell, ArrowUp, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WaitlistEntry {
  id: string
  clientName: string
  email: string
  phone: string
  requestedDate: string
  requestedTime: string
  priority: "high" | "medium" | "low"
  status: "waiting" | "notified" | "scheduled" | "expired"
  addedDate: string
  notes: string
}

export default function WaitlistPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [entries, setEntries] = useState<WaitlistEntry[]>([
    {
      id: "1",
      clientName: "Sarah Johnson",
      email: "sarah@email.com",
      phone: "(555) 123-4567",
      requestedDate: "2025-01-15",
      requestedTime: "10:00 AM",
      priority: "high",
      status: "waiting",
      addedDate: "2025-01-10",
      notes: "Prefers morning sessions",
    },
    {
      id: "2",
      clientName: "Mike Chen",
      email: "mike@email.com",
      phone: "(555) 234-5678",
      requestedDate: "2025-01-16",
      requestedTime: "2:00 PM",
      priority: "medium",
      status: "notified",
      addedDate: "2025-01-11",
      notes: "",
    },
  ])

  const handleNotify = async (id: string) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setEntries(entries.map((e) => (e.id === id ? { ...e, status: "notified" as const } : e)))
    toast({ title: "Client notified via email and SMS" })
    setLoading(false)
  }

  const handleSchedule = async (id: string) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setEntries(entries.map((e) => (e.id === id ? { ...e, status: "scheduled" as const } : e)))
    toast({ title: "Client scheduled successfully" })
    setLoading(false)
  }

  const handleRemove = async (id: string) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setEntries(entries.filter((e) => e.id !== id))
    toast({ title: "Removed from waitlist" })
    setLoading(false)
  }

  const waitingCount = entries.filter((e) => e.status === "waiting").length
  const notifiedCount = entries.filter((e) => e.status === "notified").length

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Waitlist Management</h1>
          <p className="text-muted-foreground mt-1">Manage client requests and notify when spots open up</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Waiting</p>
                <p className="text-2xl font-bold text-white">{waitingCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Notified</p>
                <p className="text-2xl font-bold text-white">{notifiedCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold text-white">{entries.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="border-2 border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Waitlist Queue</h2>
            <Button className="bg-primary hover:bg-primary/90 text-black">
              <Bell className="mr-2 h-4 w-4" /> Notify All
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Requested Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-white">{entry.clientName}</p>
                      <p className="text-xs text-muted-foreground">Added {entry.addedDate}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="text-muted-foreground">{entry.email}</p>
                      <p className="text-muted-foreground">{entry.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{entry.requestedDate}</p>
                      <p className="text-sm text-muted-foreground">{entry.requestedTime}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        entry.priority === "high"
                          ? "destructive"
                          : entry.priority === "medium"
                            ? "default"
                            : "secondary"
                      }
                      className="capitalize"
                    >
                      {entry.priority === "high" && <ArrowUp className="mr-1 h-3 w-3" />}
                      {entry.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        entry.status === "scheduled" ? "default" : entry.status === "notified" ? "secondary" : "outline"
                      }
                      className="capitalize"
                    >
                      {entry.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {entry.notes || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {entry.status === "waiting" && (
                        <Button size="sm" variant="outline" onClick={() => handleNotify(entry.id)} disabled={loading}>
                          <Mail className="h-4 w-4 mr-1" /> Notify
                        </Button>
                      )}
                      {entry.status === "notified" && (
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-black"
                          onClick={() => handleSchedule(entry.id)}
                          disabled={loading}
                        >
                          <Check className="h-4 w-4 mr-1" /> Schedule
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleRemove(entry.id)} disabled={loading}>
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}

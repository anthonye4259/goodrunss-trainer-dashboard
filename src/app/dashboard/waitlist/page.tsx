"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Users, Plus, Mail, Phone, Clock, ArrowUp } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function WaitlistPage() {
  const { toast } = useToast()
  const [waitlist, setWaitlist] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Form state
  const [clientEmail, setClientEmail] = useState("")
  const [reason, setReason] = useState("")
  const [priority, setPriority] = useState("medium")

  // Fetch waitlist on mount
  useEffect(() => {
    async function fetchWaitlist() {
      try {
        const response = await fetch('/api/waitlist')
        const data = await response.json()
        
        if (data.success && data.entries) {
          setWaitlist(data.entries)
        }
      } catch (error) {
        console.error("Failed to fetch waitlist:", error)
        toast({
          title: "Error",
          description: "Failed to load waitlist",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchWaitlist()
  }, [])

  const resetForm = () => {
    setClientEmail("")
    setReason("")
    setPriority("medium")
  }

  const handleAdd = async () => {
    if (!clientEmail || !reason) {
      toast({
        title: "Error",
        description: "Email and reason are required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // For now, we'll need a session_id - in real use, you'd select a session
      // This is a simplified version
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_email: clientEmail,
          reason,
          priority,
        }),
      })

      const data = await response.json()

      if (data.success && data.entry) {
        setWaitlist([...waitlist, data.entry])
        toast({
          title: "Success",
          description: `Added to waitlist`,
        })
        setIsDialogOpen(false)
        resetForm()
      } else {
        throw new Error(data.error || "Failed to add to waitlist")
      }
    } catch (error: any) {
      console.error("Waitlist add error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add to waitlist",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setLoading(true)

    try {
      const response = await fetch(`/api/waitlist?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        setWaitlist(
          waitlist.map((entry) =>
            entry.id === id ? { ...entry, status: newStatus } : entry
          )
        )
        toast({
          title: "Success",
          description: `Status updated to ${newStatus}`,
        })
      } else {
        throw new Error(data.error || "Failed to update status")
      }
    } catch (error: any) {
      console.error("Status update error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const priorityColors = {
    high: "text-red-500 bg-red-500/10 border-red-500/20",
    medium: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    low: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  }

  const statusColors = {
    waiting: "text-gray-500 bg-gray-500/10 border-gray-500/20",
    notified: "text-primary bg-primary/10 border-primary/20",
    claimed: "text-green-500 bg-green-500/10 border-green-500/20",
    expired: "text-red-500 bg-red-500/10 border-red-500/20",
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading waitlist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Waitlist Management</h1>
          <p className="text-muted-foreground mt-1">Manage your client queue and notifications</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-black">
              <Plus className="mr-2 h-4 w-4" />
              Add to Waitlist
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add to Waitlist</DialogTitle>
              <DialogDescription>Add a new client to your waitlist queue</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="email">Client Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="reason">Reason *</Label>
                <Input
                  id="reason"
                  placeholder="e.g., Full schedule, interested in new time slot"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  resetForm()
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={loading} className="flex-1 bg-primary hover:bg-primary/90 text-black">
                {loading ? "Adding..." : "Add to Waitlist"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Waiting</p>
              <p className="text-2xl font-bold text-white">
                {waitlist.filter((e) => e.status === "waiting").length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Notified</p>
              <p className="text-2xl font-bold text-white">
                {waitlist.filter((e) => e.status === "notified").length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <ArrowUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Claimed</p>
              <p className="text-2xl font-bold text-white">
                {waitlist.filter((e) => e.status === "claimed").length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Waitlist Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Waitlist Queue</h2>
        {waitlist.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No clients on waitlist yet</p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              variant="outline"
              className="mt-4"
            >
              Add First Client
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {waitlist.map((entry) => (
              <Card key={entry.id} className="p-4 bg-muted/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">Position #{entry.position || 'N/A'}</h3>
                      <Badge className={statusColors[entry.status as keyof typeof statusColors] || statusColors.waiting}>
                        {entry.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {entry.reason}
                      </p>
                      <p className="text-xs">
                        Added {new Date(entry.added_at || entry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {entry.status === "waiting" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(entry.id, "notified")}
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-black"
                      >
                        Notify
                      </Button>
                    )}
                    {entry.status === "notified" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(entry.id, "claimed")}
                        disabled={loading}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        Mark Claimed
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

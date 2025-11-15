"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Mail, Phone, Calendar, TrendingUp, Filter, Users } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"

const mockClients = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (555) 123-4567",
    sport: "Basketball",
    status: "active",
    sessions: 24,
    nextSession: "2024-01-15 09:00",
    joinedDate: "2023-06-15",
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike.chen@email.com",
    phone: "+1 (555) 234-5678",
    sport: "Tennis",
    status: "active",
    sessions: 18,
    nextSession: "2024-01-15 11:30",
    joinedDate: "2023-08-22",
  },
  {
    id: "3",
    name: "Emma Davis",
    email: "emma.d@email.com",
    phone: "+1 (555) 345-6789",
    sport: "Running",
    status: "active",
    sessions: 31,
    nextSession: "2024-01-15 14:00",
    joinedDate: "2023-04-10",
  },
  {
    id: "4",
    name: "James Wilson",
    email: "j.wilson@email.com",
    phone: "+1 (555) 456-7890",
    sport: "Soccer",
    status: "inactive",
    sessions: 12,
    nextSession: null,
    joinedDate: "2023-09-05",
  },
]

export default function ClientsPage() {
  const [clients, setClients] = useState(mockClients)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || client.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const validateForm = (formData: FormData): boolean => {
    const errors: Record<string, string> = {}

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string

    if (!name || name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters"
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!phone || !/^\+?[\d\s()-]{10,}$/.test(phone)) {
      errors.phone = "Please enter a valid phone number"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    if (!validateForm(formData)) {
      return
    }

    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newClient = {
      id: String(clients.length + 1),
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      sport: formData.get("sport") as string,
      status: "active" as const,
      sessions: 0,
      nextSession: null,
      joinedDate: new Date().toISOString().split("T")[0],
    }

    setClients([...clients, newClient])
    setIsAddDialogOpen(false)
    setIsSubmitting(false)
    setFormErrors({})
    toast({
      title: "Client added successfully",
      description: `${newClient.name} has been added to your client list.`,
    })
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Clients</h1>
          <p className="mt-2 text-muted-foreground">Manage your training clients</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleAddClient}>
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>Enter the details of your new client below.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    className={formErrors.email ? "border-red-500" : ""}
                  />
                  {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className={formErrors.phone ? "border-red-500" : ""}
                  />
                  {formErrors.phone && <p className="text-sm text-red-500">{formErrors.phone}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sport">Sport/Activity</Label>
                  <Select name="sport" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basketball">Basketball</SelectItem>
                      <SelectItem value="Tennis">Tennis</SelectItem>
                      <SelectItem value="Running">Running</SelectItem>
                      <SelectItem value="Soccer">Soccer</SelectItem>
                      <SelectItem value="Swimming">Swimming</SelectItem>
                      <SelectItem value="Cycling">Cycling</SelectItem>
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
                  {isSubmitting ? "Adding..." : "Add Client"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search clients by name or email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {clients.filter((c) => c.status === "active").length} active
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clients.reduce((sum, c) => sum + c.sessions, 0)}</div>
            <p className="text-xs text-primary mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clients.filter((c) => c.nextSession).length}</div>
            <p className="text-xs text-muted-foreground mt-1">scheduled today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="glass border-border/50 transition-smooth hover:border-primary/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary">
                    {client.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{client.name}</h3>
                      <Badge
                        variant={client.status === "active" ? "default" : "secondary"}
                        className={client.status === "active" ? "bg-primary/20 text-primary" : ""}
                      >
                        {client.status}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {client.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Sport</p>
                    <p className="font-semibold">{client.sport}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Sessions</p>
                    <p className="font-semibold">{client.sessions}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/clients/${client.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    <Link href="/dashboard/calendar">
                      <Button size="sm" className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90">
                        <Calendar className="h-3 w-3" />
                        Schedule
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clients.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>No clients yet</EmptyTitle>
            <EmptyDescription>
              Get started by adding your first client to begin tracking their progress.
            </EmptyDescription>
          </EmptyHeader>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Your First Client
          </Button>
        </Empty>
      ) : filteredClients.length === 0 ? (
        <Card className="glass border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">No clients found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

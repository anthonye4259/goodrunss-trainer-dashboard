"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Mail, Phone, Calendar, TrendingUp, MessageSquare } from "lucide-react"

type Client = {
  id: string
  name: string
  email: string
  phone: string
  sport: string
  sessions: number
  lastSession: string
  status: "active" | "inactive"
  notes?: string
}

const initialClients: Client[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 123-4567",
    sport: "Basketball",
    sessions: 24,
    lastSession: "2 days ago",
    status: "active",
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike.chen@email.com",
    phone: "(555) 234-5678",
    sport: "Tennis",
    sessions: 18,
    lastSession: "1 week ago",
    status: "active",
  },
  {
    id: "3",
    name: "Emma Davis",
    email: "emma.d@email.com",
    phone: "(555) 345-6789",
    sport: "Running",
    sessions: 32,
    lastSession: "Yesterday",
    status: "active",
  },
  {
    id: "4",
    name: "James Wilson",
    email: "j.wilson@email.com",
    phone: "(555) 456-7890",
    sport: "Soccer",
    sessions: 12,
    lastSession: "3 weeks ago",
    status: "inactive",
  },
]

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    sport: "",
    notes: "",
  })

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.sport.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddClient = () => {
    const client: Client = {
      id: Date.now().toString(),
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone,
      sport: newClient.sport,
      sessions: 0,
      lastSession: "Never",
      status: "active",
      notes: newClient.notes,
    }
    setClients([...clients, client])
    setIsAddDialogOpen(false)
    setNewClient({ name: "", email: "", phone: "", sport: "", notes: "" })
  }

  const handleSendMessage = (client: Client) => {
    alert(`Opening message to ${client.name}...`)
  }

  const handleScheduleSession = (client: Client) => {
    alert(`Scheduling session with ${client.name}...`)
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-balance">Client Management</h1>
          <p className="mt-2 text-muted-foreground">Manage your training clients and their progress</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>Add a new client to your training roster</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Enter client name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="client@email.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sport">Primary Sport</Label>
                <Input
                  id="sport"
                  value={newClient.sport}
                  onChange={(e) => setNewClient({ ...newClient, sport: e.target.value })}
                  placeholder="e.g., Basketball, Tennis, Running"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={newClient.notes}
                  onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                  placeholder="Add any notes about the client"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddClient} disabled={!newClient.name || !newClient.email || !newClient.sport}>
                Add Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="glass border-border/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search clients by name, email, or sport..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Clients</p>
              <p className="text-3xl font-bold text-primary">{clients.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active Clients</p>
              <p className="text-3xl font-bold">{clients.filter((c) => c.status === "active").length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-3xl font-bold">{clients.reduce((sum, c) => sum + c.sessions, 0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Avg Sessions</p>
              <p className="text-3xl font-bold">
                {Math.round(clients.reduce((sum, c) => sum + c.sessions, 0) / clients.length)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <div className="grid gap-4">
        {filteredClients.map((client) => (
          <Card
            key={client.id}
            className="glass border-border/50 cursor-pointer transition-smooth hover:border-primary/50"
            onClick={() => setSelectedClient(client)}
          >
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`/placeholder_64px.png?height=64&width=64`} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                    {client.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">{client.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {client.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {client.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium text-primary">{client.sport}</span>
                    <span className="text-muted-foreground">{client.sessions} sessions</span>
                    <span className="text-muted-foreground">Last: {client.lastSession}</span>
                  </div>
                </div>
              </div>
              <Badge variant={client.status === "active" ? "default" : "secondary"}>{client.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client Details Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>View and manage client information</DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={`/ceholder-svg-height-80.jpg?height=80&width=80`} />
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                    {selectedClient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold">{selectedClient.name}</h3>
                  <Badge variant={selectedClient.status === "active" ? "default" : "secondary"}>
                    {selectedClient.status}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedClient.email}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedClient.phone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Primary Sport</Label>
                    <p className="font-medium text-primary">{selectedClient.sport}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Total Sessions</Label>
                    <p className="font-medium">{selectedClient.sessions}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Last Session</Label>
                  <p className="font-medium">{selectedClient.lastSession}</p>
                </div>
                {selectedClient.notes && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Notes</Label>
                    <p className="text-sm">{selectedClient.notes}</p>
                  </div>
                )}
              </div>

              <div className="grid gap-3">
                <Button className="w-full justify-start gap-2" onClick={() => handleScheduleSession(selectedClient)}>
                  <Calendar className="h-4 w-4" />
                  Schedule Session
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 bg-transparent"
                  onClick={() => handleSendMessage(selectedClient)}
                >
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <TrendingUp className="h-4 w-4" />
                  View Progress
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedClient(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, CheckCircle, Clock, Search, TrendingUp } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Mock conflicts data
const mockConflicts = [
  {
    id: "1",
    type: "Double Booking",
    severity: "high",
    date: "2024-01-15",
    time: "10:00",
    clients: ["Sarah Johnson", "Mike Chen"],
    status: "pending",
    autoResolved: false,
  },
  {
    id: "2",
    type: "Back-to-back Sessions",
    severity: "medium",
    date: "2024-01-16",
    time: "14:00",
    clients: ["Emma Davis"],
    status: "resolved",
    autoResolved: true,
  },
  {
    id: "3",
    type: "Travel Time Conflict",
    severity: "low",
    date: "2024-01-17",
    time: "09:00",
    clients: ["James Wilson", "Lisa Brown"],
    status: "pending",
    autoResolved: false,
  },
]

const mockSuggestions = [
  {
    id: "1",
    dateTime: "2024-01-15 at 11:30 AM",
    confidence: 92,
    pros: ["No other bookings", "Client's preferred time window", "Adequate travel time"],
    cons: ["Slightly later than original request"],
  },
  {
    id: "2",
    dateTime: "2024-01-15 at 2:00 PM",
    confidence: 88,
    pros: ["Client available", "Good time spacing"],
    cons: ["Outside preferred morning slot", "Lower energy time"],
  },
  {
    id: "3",
    dateTime: "2024-01-16 at 9:00 AM",
    confidence: 85,
    pros: ["Next day alternative", "Fresh start morning"],
    cons: ["Requires rescheduling", "One day delay"],
  },
]

export default function ConflictsPage() {
  const [conflicts, setConflicts] = useState(mockConflicts)
  const [selectedConflict, setSelectedConflict] = useState<(typeof mockConflicts)[0] | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const stats = {
    totalConflicts: conflicts.length,
    autoResolved: conflicts.filter((c) => c.autoResolved).length,
    timeSaved: 4.5, // hours
    pending: conflicts.filter((c) => c.status === "pending").length,
  }

  const filteredConflicts = conflicts.filter((conflict) => {
    const matchesStatus = filterStatus === "all" || conflict.status === filterStatus
    const matchesSearch =
      conflict.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conflict.clients.some((client) => client.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/20 text-red-500 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
      case "low":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30"
      default:
        return ""
    }
  }

  const handleAcceptSuggestion = (suggestionId: string) => {
    if (selectedConflict) {
      setConflicts(
        conflicts.map((c) =>
          c.id === selectedConflict.id ? { ...c, status: "resolved" as const, autoResolved: true } : c,
        ),
      )
      setSelectedConflict(null)
    }
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Scheduling Conflicts</h1>
        <p className="mt-2 text-muted-foreground">Manage and resolve scheduling conflicts with AI assistance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Conflicts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalConflicts}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.pending} pending resolution</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Auto-Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.autoResolved}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((stats.autoResolved / stats.totalConflicts) * 100)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.timeSaved}h</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">94%</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="glass border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conflicts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conflicts</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conflicts Table */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Conflict History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Clients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConflicts.map((conflict) => (
                <TableRow key={conflict.id}>
                  <TableCell className="font-medium">{conflict.type}</TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(conflict.severity)}>{conflict.severity}</Badge>
                  </TableCell>
                  <TableCell>
                    {conflict.date} at {conflict.time}
                  </TableCell>
                  <TableCell>{conflict.clients.join(", ")}</TableCell>
                  <TableCell>
                    <Badge variant={conflict.status === "resolved" ? "secondary" : "default"}>
                      {conflict.status}
                      {conflict.autoResolved && " (Auto)"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedConflict(conflict)}
                      disabled={conflict.status === "resolved"}
                    >
                      {conflict.status === "resolved" ? "Resolved" : "Resolve"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Conflict Detail Modal */}
      <Dialog open={!!selectedConflict} onOpenChange={() => setSelectedConflict(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Resolve Conflict: {selectedConflict?.type}</DialogTitle>
          </DialogHeader>

          {selectedConflict && (
            <div className="space-y-6">
              {/* Problem Description */}
              <div className="rounded-lg border border-border/50 bg-card/50 p-4">
                <h3 className="font-semibold mb-2">Problem Description</h3>
                <p className="text-sm text-muted-foreground">
                  You have a {selectedConflict.type.toLowerCase()} on {selectedConflict.date} at {selectedConflict.time}{" "}
                  involving {selectedConflict.clients.join(" and ")}.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge className={getSeverityColor(selectedConflict.severity)}>{selectedConflict.severity}</Badge>
                  <span className="text-xs text-muted-foreground">Severity Level</span>
                </div>
              </div>

              {/* AI Suggestions */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="text-primary">AI</span> Suggested Solutions
                </h3>
                <div className="space-y-3">
                  {mockSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{suggestion.dateTime}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${suggestion.confidence}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground">{suggestion.confidence}% match</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => handleAcceptSuggestion(suggestion.id)}
                        >
                          Accept
                        </Button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold text-primary mb-2">Pros</p>
                          <ul className="space-y-1">
                            {suggestion.pros.map((pro, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-yellow-500 mb-2">Cons</p>
                          <ul className="space-y-1">
                            {suggestion.cons.map((con, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 shrink-0" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
                <Button variant="outline" onClick={() => setSelectedConflict(null)}>
                  Decline All
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

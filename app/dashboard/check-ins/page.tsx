"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { CheckCircle2, Clock, Plus, Send, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"

interface CheckIn {
  id: string
  clientName: string
  date: string
  status: "pending" | "completed" | "no-response"
  template: string
  response?: string
  sentiment: "positive" | "neutral" | "negative" | null
}

const templates = [
  "How are you feeling after our last session? Any soreness or concerns?",
  "How's your energy level this week? Ready for our next session?",
  "Any progress on your goals since we last met?",
  "How's your nutrition and hydration been this week?",
  "Any questions or adjustments needed for your program?",
]

export default function CheckInsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0])
  const [checkIns, setCheckIns] = useState<CheckIn[]>([
    {
      id: "1",
      clientName: "Sarah Johnson",
      date: "2025-01-12",
      status: "completed",
      template: templates[0],
      response: "Feeling great! A bit sore in my quads but nothing serious.",
      sentiment: "positive",
    },
    {
      id: "2",
      clientName: "Mike Chen",
      date: "2025-01-12",
      status: "pending",
      template: templates[1],
      sentiment: null,
    },
  ])

  const handleSendCheckIn = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    toast({ title: "Check-in sent to all active clients" })
    setLoading(false)
    setOpen(false)
  }

  const pendingCount = checkIns.filter((c) => c.status === "pending").length
  const completedCount = checkIns.filter((c) => c.status === "completed").length
  const responseRate = checkIns.length > 0 ? Math.round((completedCount / checkIns.length) * 100) : 0

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Automated Check-ins</h1>
            <p className="text-muted-foreground mt-1">Stay connected with clients between sessions</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-black">
                <Plus className="mr-2 h-4 w-4" /> Send Check-in
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Check-in</DialogTitle>
                <DialogDescription>Choose a template and send to all active clients</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Select Template</Label>
                  <div className="space-y-2 mt-2">
                    {templates.map((template, i) => (
                      <Card
                        key={i}
                        className={`p-3 cursor-pointer transition-all ${
                          selectedTemplate === template
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <p className="text-sm text-white">{template}</p>
                      </Card>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="custom">Or write custom message</Label>
                  <Textarea
                    id="custom"
                    placeholder="Type your custom check-in message..."
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSendCheckIn}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-black"
                >
                  {loading ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Send to All
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Responses</p>
                <p className="text-2xl font-bold text-white">{pendingCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-white">{completedCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold text-white">{responseRate}%</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="border-2 border-border">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-white">Recent Check-ins</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Response</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checkIns.map((checkIn) => (
                <TableRow key={checkIn.id}>
                  <TableCell className="font-semibold text-white">{checkIn.clientName}</TableCell>
                  <TableCell>{checkIn.date}</TableCell>
                  <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                    {checkIn.template}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        checkIn.status === "completed"
                          ? "default"
                          : checkIn.status === "pending"
                            ? "secondary"
                            : "outline"
                      }
                      className="capitalize"
                    >
                      {checkIn.status === "completed" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                      {checkIn.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                      {checkIn.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {checkIn.sentiment && (
                      <Badge
                        variant={
                          checkIn.sentiment === "positive"
                            ? "default"
                            : checkIn.sentiment === "neutral"
                              ? "secondary"
                              : "destructive"
                        }
                        className="capitalize"
                      >
                        {checkIn.sentiment}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[250px]">
                    {checkIn.response ? (
                      <p className="text-sm text-muted-foreground truncate">{checkIn.response}</p>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
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

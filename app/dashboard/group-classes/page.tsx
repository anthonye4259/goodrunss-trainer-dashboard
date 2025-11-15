"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Users, Clock, Calendar, Edit, Trash2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"

interface GroupClass {
  id: string
  name: string
  instructor: string
  date: string
  time: string
  duration: number
  capacity: number
  enrolled: number
  status: "open" | "full" | "cancelled"
  type: string
}

export default function GroupClassesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [classes, setClasses] = useState<GroupClass[]>([
    {
      id: "1",
      name: "Morning Yoga Flow",
      instructor: "Sarah Johnson",
      date: "2025-01-15",
      time: "07:00 AM",
      duration: 60,
      capacity: 15,
      enrolled: 12,
      status: "open",
      type: "Yoga",
    },
    {
      id: "2",
      name: "HIIT Bootcamp",
      instructor: "Mike Chen",
      date: "2025-01-15",
      time: "06:00 PM",
      duration: 45,
      capacity: 20,
      enrolled: 20,
      status: "full",
      type: "HIIT",
    },
  ])

  const [name, setName] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState("")
  const [capacity, setCapacity] = useState("")
  const [type, setType] = useState("")

  const handleCreate = async () => {
    if (!name || !date || !time || !capacity) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newClass: GroupClass = {
      id: Date.now().toString(),
      name,
      instructor: "You",
      date,
      time,
      duration: Number.parseInt(duration) || 60,
      capacity: Number.parseInt(capacity),
      enrolled: 0,
      status: "open",
      type,
    }

    setClasses([newClass, ...classes])
    toast({ title: "Class created successfully" })
    setLoading(false)
    setOpen(false)
    setName("")
    setDate("")
    setTime("")
    setDuration("")
    setCapacity("")
    setType("")
  }

  const totalCapacity = classes.reduce((sum, c) => sum + c.capacity, 0)
  const totalEnrolled = classes.reduce((sum, c) => sum + c.enrolled, 0)
  const utilizationRate = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Group Class Management</h1>
            <p className="text-muted-foreground mt-1">Schedule and manage group training sessions</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-black">
                <Plus className="mr-2 h-4 w-4" /> Create Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Group Class</DialogTitle>
                <DialogDescription>Schedule a new group training session</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="name">Class Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Morning Yoga Flow"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Class Type *</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yoga">Yoga</SelectItem>
                      <SelectItem value="Pilates">Pilates</SelectItem>
                      <SelectItem value="HIIT">HIIT</SelectItem>
                      <SelectItem value="Strength">Strength Training</SelectItem>
                      <SelectItem value="Cardio">Cardio</SelectItem>
                      <SelectItem value="Dance">Dance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="time">Time *</Label>
                    <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="60"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity *</Label>
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="15"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={loading} className="bg-primary hover:bg-primary/90 text-black">
                  {loading ? <Spinner className="h-4 w-4" /> : "Create Class"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold text-white">{classes.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Enrolled</p>
                <p className="text-2xl font-bold text-white">
                  {totalEnrolled}/{totalCapacity}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utilization Rate</p>
                <p className="text-2xl font-bold text-white">{utilizationRate}%</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="border-2 border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-white">{classItem.name}</p>
                      <p className="text-sm text-muted-foreground">{classItem.instructor}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{classItem.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{classItem.date}</p>
                      <p className="text-sm text-muted-foreground">{classItem.time}</p>
                    </div>
                  </TableCell>
                  <TableCell>{classItem.duration} min</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-white">
                          {classItem.enrolled}/{classItem.capacity}
                        </span>
                      </div>
                      {classItem.enrolled >= classItem.capacity && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        classItem.status === "full"
                          ? "destructive"
                          : classItem.status === "open"
                            ? "default"
                            : "secondary"
                      }
                      className="capitalize"
                    >
                      {classItem.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4 text-red-500" />
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

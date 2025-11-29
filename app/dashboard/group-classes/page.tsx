"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, Users, Clock, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GroupClass {
  id: string
  title: string
  scheduledAt: string
  duration: number
  capacity: number
  enrolled: number
  status: string
}

export default function GroupClassesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<GroupClass[]>([])
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    duration: "60",
    capacity: "20"
  })

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/group-classes')
      
      if (!response.ok) {
        throw new Error('Failed to fetch group classes')
      }
      
      const data = await response.json()
      setClasses(data.classes || [])
    } catch (err: any) {
      console.error('Fetch classes error:', err)
      setError(err.message || 'Failed to load group classes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.date || !formData.time || !formData.capacity) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const scheduledAt = new Date(`${formData.date}T${formData.time}`)
      
      const response = await fetch('/api/group-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          scheduledAt: scheduledAt.toISOString(),
          duration: parseInt(formData.duration),
          capacity: parseInt(formData.capacity)
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create class')
      }

      const data = await response.json()
      
      toast({ 
        title: "✅ Class created successfully",
        description: `${formData.name} has been scheduled`
      })
      
      await fetchClasses()
      setOpen(false)
      setFormData({
        name: "",
        date: "",
        time: "",
        duration: "60",
        capacity: "20"
      })
    } catch (err: any) {
      console.error('Create class error:', err)
      toast({
        title: "Error",
        description: err.message || "Failed to create class",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const totalCapacity = classes.reduce((sum, c) => sum + (c.capacity || 0), 0)
  const totalEnrolled = classes.reduce((sum, c) => sum + (c.enrolled || 0), 0)
  const utilizationRate = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Group Class Management</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage group training sessions</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Group Class Management</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage group training sessions</p>
        </div>
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Failed to load group classes</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
            <Button onClick={fetchClasses} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Group Class Management</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage group training sessions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Group Class</DialogTitle>
              <DialogDescription>Schedule a new group training session</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Class Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Morning HIIT Class"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Max Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Class'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active group sessions</p>
          </CardContent>
        </Card>
        
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Enrolled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalEnrolled}</div>
            <p className="text-xs text-muted-foreground mt-1">Out of {totalCapacity} capacity</p>
          </CardContent>
        </Card>
        
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Utilization Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{utilizationRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Average class fill rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Classes List */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Scheduled Classes</CardTitle>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold">No group classes scheduled</p>
              <p className="text-sm text-muted-foreground mt-2">Create your first group class to get started</p>
              <Button onClick={() => setOpen(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Class
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {classes.map((cls) => (
                <div key={cls.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div className="flex-1">
                    <h3 className="font-semibold">{cls.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(cls.scheduledAt).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {cls.enrolled || 0} / {cls.capacity}
                      </span>
                    </div>
                  </div>
                  <Badge variant={cls.enrolled >= cls.capacity ? "destructive" : "secondary"}>
                    {cls.enrolled >= cls.capacity ? "Full" : "Open"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

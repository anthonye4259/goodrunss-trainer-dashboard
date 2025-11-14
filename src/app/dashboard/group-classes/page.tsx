"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, Plus, Calendar, Clock, Trash2, Edit } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function GroupClassesPage() {
  const { toast } = useToast()
  const [classes, setClasses] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startTime, setStartTime] = useState("")
  const [duration, setDuration] = useState("")
  const [capacity, setCapacity] = useState("")
  const [location, setLocation] = useState("")
  const [price, setPrice] = useState("")

  // Fetch classes on mount
  useEffect(() => {
    async function fetchClasses() {
      try {
        const response = await fetch('/api/group-classes')
        const data = await response.json()
        
        if (data.success && data.classes) {
          setClasses(data.classes)
        }
      } catch (error) {
        console.error("Failed to fetch group classes:", error)
        toast({
          title: "Error",
          description: "Failed to load group classes",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchClasses()
  }, [])

  const resetForm = () => {
    setName("")
    setDescription("")
    setStartTime("")
    setDuration("")
    setCapacity("")
    setLocation("")
    setPrice("")
    setEditingClass(null)
  }

  const handleOpenDialog = (cls?: any) => {
    if (cls) {
      setEditingClass(cls)
      setName(cls.name)
      setDescription(cls.description || "")
      setStartTime(new Date(cls.start_time).toISOString().slice(0, 16))
      setDuration(cls.duration?.toString() || "")
      setCapacity(cls.max_capacity?.toString() || "")
      setLocation(cls.location || "")
      setPrice(cls.price_per_person?.toString() || "")
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!name || !startTime || !duration || !capacity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const payload = {
        name,
        description,
        start_time: new Date(startTime).toISOString(),
        duration: parseInt(duration),
        max_capacity: parseInt(capacity),
        location: location || null,
        price_per_person: parseFloat(price) || 0,
      }

      if (editingClass) {
        // Update existing class
        const response = await fetch(`/api/group-classes?id=${editingClass.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await response.json()

        if (data.success && data.class) {
          setClasses(
            classes.map((cls) =>
              cls.id === editingClass.id ? data.class : cls
            )
          )
          toast({
            title: "Success",
            description: "Group class updated successfully",
          })
        } else {
          throw new Error(data.error || "Failed to update class")
        }
      } else {
        // Create new class
        const response = await fetch('/api/group-classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await response.json()

        if (data.success && data.class) {
          setClasses([...classes, data.class])
          toast({
            title: "Success",
            description: "Group class created successfully",
          })
        } else {
          throw new Error(data.error || "Failed to create class")
        }
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error: any) {
      console.error("Class save error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save class",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)

    try {
      const response = await fetch(`/api/group-classes?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setClasses(classes.filter((cls) => cls.id !== id))
        toast({
          title: "Success",
          description: "Group class deleted successfully",
        })
      } else {
        throw new Error(data.error || "Failed to delete class")
      }
    } catch (error: any) {
      console.error("Class delete error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete class",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const totalEnrolled = classes.reduce((sum, cls) => sum + (cls.current_attendees || 0), 0)
  const totalCapacity = classes.reduce((sum, cls) => sum + (cls.max_capacity || 0), 0)

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading group classes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Group Classes</h1>
          <p className="text-muted-foreground mt-1">Manage your group training sessions and classes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90 text-black">
              <Plus className="mr-2 h-4 w-4" />
              Create Class
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingClass ? "Edit Class" : "Create New Group Class"}</DialogTitle>
              <DialogDescription>
                {editingClass ? "Update class details" : "Schedule a new group training session"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label htmlFor="name">Class Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Morning Yoga Flow"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what the class covers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Date & Time *</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (mins) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="60"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity">Max Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="20"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="25"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Studio A, Main Gym"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1"
                />
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
              <Button onClick={handleSave} disabled={loading} className="flex-1 bg-primary hover:bg-primary/90 text-black">
                {loading ? "Saving..." : editingClass ? "Update" : "Create"}
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
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Enrolled</p>
              <p className="text-2xl font-bold text-white">{totalEnrolled}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Capacity</p>
              <p className="text-2xl font-bold text-white">{totalEnrolled} / {totalCapacity}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Classes List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Upcoming Classes</h2>
        {classes.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No group classes scheduled yet</p>
            <Button
              onClick={() => handleOpenDialog()}
              variant="outline"
              className="mt-4"
            >
              Schedule First Class
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((cls) => {
              const startDate = new Date(cls.start_time)
              const isFull = cls.current_attendees >= cls.max_capacity
              const fillPercentage = (cls.current_attendees / cls.max_capacity) * 100

              return (
                <Card key={cls.id} className="p-4 bg-muted/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white">{cls.name}</h3>
                        {isFull && (
                          <Badge variant="destructive">Full</Badge>
                        )}
                        <Badge variant="outline">{cls.status || 'scheduled'}</Badge>
                      </div>
                      {cls.description && (
                        <p className="text-sm text-muted-foreground mb-2">{cls.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {startDate.toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({cls.duration} mins)
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {cls.current_attendees || 0} / {cls.max_capacity}
                        </span>
                        {cls.location && <span>📍 {cls.location}</span>}
                        {cls.price_per_person > 0 && <span>💰 ${cls.price_per_person}</span>}
                      </div>
                      <div className="mt-3 w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            fillPercentage >= 100 ? 'bg-red-500' :
                            fillPercentage >= 75 ? 'bg-yellow-500' :
                            'bg-primary'
                          }`}
                          style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(cls)}
                        className="text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cls.id)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

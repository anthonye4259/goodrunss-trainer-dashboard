"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit2, Trash2, DollarSign, Clock, Loader2, CheckCircle } from "lucide-react"

export const dynamic = 'force-dynamic'

interface Service {
  id?: string
  name: string
  description: string
  price: number
  duration: number // in minutes
  isActive?: boolean
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "60",
  })

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch("/api/trainer-services")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load services")
      }

      setServices(data.services || [])
    } catch (err: any) {
      console.error("Load services error:", err)
      setError(err.message || "Failed to load services")
    } finally {
      setIsLoading(false)
    }
  }

  const saveServices = async (updatedServices: Service[]) => {
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/trainer-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services: updatedServices }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save services")
      }

      setServices(data.services || [])
      setSuccess("Services saved successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      console.error("Save services error:", err)
      setError(err.message || "Failed to save services")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = () => {
    if (!formData.name || !formData.price) {
      setError("Please fill in all required fields")
      return
    }

    const newService: Service = {
      id: editingId || undefined,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      isActive: true,
    }

    if (editingId) {
      // Update existing
      const updated = services.map((s) => 
        s.id === editingId ? newService : s
      )
      saveServices(updated)
    } else {
      // Add new
      saveServices([...services, newService])
    }

    // Reset form
    setFormData({ name: "", description: "", price: "", duration: "60" })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleEdit = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
    })
    setEditingId(service.id || null)
    setIsAdding(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      const updated = services.filter((s) => s.id !== id)
      saveServices(updated)
    }
  }

  const handleCancel = () => {
    setFormData({ name: "", description: "", price: "", duration: "60" })
    setIsAdding(false)
    setEditingId(null)
    setError("")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Services</h1>
            <p className="text-muted-foreground mt-1">
              Manage the services you offer to clients
            </p>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {isAdding && (
          <Card className="p-6 border-primary/20">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Service" : "Add New Service"}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Personal Training Session"
                  disabled={isSaving}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe what's included in this service..."
                  rows={3}
                  disabled={isSaving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (USD) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="50.00"
                      className="pl-9"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="duration"
                      type="number"
                      min="15"
                      step="15"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      placeholder="60"
                      className="pl-9"
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    editingId ? "Update Service" : "Add Service"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Services List */}
        {services.length === 0 && !isAdding ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">No services yet</h3>
              <p className="text-muted-foreground">
                Add your first service to start accepting bookings from clients
              </p>
              <Button onClick={() => setIsAdding(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Service
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {services.map((service) => (
              <Card key={service.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{service.name}</h3>
                    {service.description && (
                      <p className="text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">${service.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{service.duration} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                      disabled={isSaving}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id!)}
                      disabled={isSaving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

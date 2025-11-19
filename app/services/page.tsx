"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit2, Trash2, DollarSign, Clock } from "lucide-react"
import { useUser } from "@clerk/nextjs"

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number // in minutes
  isActive: boolean
}

export default function ServicesPage() {
  const { user } = useUser()
  const [services, setServices] = useState<Service[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "60",
  })

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = () => {
    // Load from localStorage for now
    const saved = localStorage.getItem("trainerServices")
    if (saved) {
      setServices(JSON.parse(saved))
    }
  }

  const saveServices = (updatedServices: Service[]) => {
    localStorage.setItem("trainerServices", JSON.stringify(updatedServices))
    setServices(updatedServices)
  }

  const handleSave = () => {
    if (!formData.name || !formData.price) {
      alert("Please fill in all required fields")
      return
    }

    const newService: Service = {
      id: editingId || crypto.randomUUID(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      isActive: true,
    }

    if (editingId) {
      // Update existing
      const updated = services.map((s) => (s.id === editingId ? newService : s))
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
    setEditingId(service.id)
    setIsAdding(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      saveServices(services.filter((s) => s.id !== id))
    }
  }

  const handleCancel = () => {
    setFormData({ name: "", description: "", price: "", duration: "60" })
    setIsAdding(false)
    setEditingId(null)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Services & Pricing</h1>
          <p className="text-gray-400 mt-1">
            Manage your services that appear on your booking link
          </p>
        </div>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            {editingId ? "Edit Service" : "Add New Service"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-white">
                Service Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Personal Training Session"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="price" className="text-white">
                Price (USD) *
              </Label>
              <div className="relative mt-1.5">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="100"
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="duration" className="text-white">
                Duration (minutes)
              </Label>
              <div className="relative mt-1.5">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="60"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description" className="text-white">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of what's included..."
                rows={3}
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              {editingId ? "Update Service" : "Add Service"}
            </Button>
            <Button onClick={handleCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Services List */}
      <div className="grid gap-4">
        {services.length === 0 ? (
          <Card className="p-12 text-center bg-gray-800 border-gray-700">
            <p className="text-gray-400 mb-4">No services added yet</p>
            <Button
              onClick={() => setIsAdding(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Service
            </Button>
          </Card>
        ) : (
          services.map((service) => (
            <Card key={service.id} className="p-6 bg-gray-800 border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-gray-400 mt-1">{service.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 text-green-400 font-semibold">
                      <DollarSign className="h-4 w-4" />
                      {service.price.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="h-4 w-4" />
                      {service.duration} min
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(service)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(service.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}


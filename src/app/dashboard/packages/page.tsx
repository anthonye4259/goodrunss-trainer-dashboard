"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Package, Plus, Edit, Trash2, TrendingUp, DollarSign, Users } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function PackagesPage() {
  const { toast } = useToast()
  const [packages, setPackages] = useState<any[]>([])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [sessions, setSessions] = useState("")
  const [type, setType] = useState("package")

  // Fetch packages on mount
  useEffect(() => {
    async function fetchPackages() {
      try {
        const response = await fetch('/api/packages')
        const data = await response.json()
        
        if (data.success && data.packages) {
          setPackages(data.packages)
        }
      } catch (error) {
        console.error("Failed to fetch packages:", error)
        toast({
          title: "Error",
          description: "Failed to load packages",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchPackages()
  }, [])

  const resetForm = () => {
    setName("")
    setDescription("")
    setPrice("")
    setSessions("")
    setType("package")
    setEditingPackage(null)
  }

  const handleOpenDialog = (pkg?: any) => {
    if (pkg) {
      setEditingPackage(pkg)
      setName(pkg.name)
      setDescription(pkg.description)
      setPrice(pkg.price.toString())
      setSessions(pkg.sessions.toString())
      setType(pkg.type)
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!name || !price || !sessions) {
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
        price: parseFloat(price),
        sessions: parseInt(sessions),
        validity_days: 90,
        is_recurring: type === "membership",
        recurring_interval: type === "membership" ? "monthly" : null,
        is_active: true,
      }

      if (editingPackage) {
        // Update existing package
        const response = await fetch(`/api/packages?id=${editingPackage.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await response.json()

        if (data.success && data.package) {
          setPackages(
            packages.map((pkg) =>
              pkg.id === editingPackage.id ? data.package : pkg
            )
          )
          toast({
            title: "Success",
            description: "Package updated successfully",
          })
        } else {
          throw new Error(data.error || "Failed to update package")
        }
      } else {
        // Create new package
        const response = await fetch('/api/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await response.json()

        if (data.success && data.package) {
          setPackages([...packages, data.package])
          toast({
            title: "Success",
            description: "Package created successfully",
          })
        } else {
          throw new Error(data.error || "Failed to create package")
        }
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error: any) {
      console.error("Package save error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save package",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)

    try {
      const response = await fetch(`/api/packages?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setPackages(packages.filter((pkg) => pkg.id !== id))
        toast({
          title: "Success",
          description: "Package deleted successfully",
        })
      } else {
        throw new Error(data.error || "Failed to delete package")
      }
    } catch (error: any) {
      console.error("Package delete error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete package",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = packages.reduce((sum, pkg) => sum + (pkg.price * (pkg.soldCount || 0)), 0)
  const totalSold = packages.reduce((sum, pkg) => sum + (pkg.soldCount || 0), 0)

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading packages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Packages & Memberships</h1>
          <p className="text-muted-foreground mt-1">Manage your training packages and membership offerings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90 text-black">
              <Plus className="mr-2 h-4 w-4" />
              Create Package
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingPackage ? "Edit Package" : "Create New Package"}</DialogTitle>
              <DialogDescription>
                {editingPackage ? "Update package details" : "Create a new training package or membership"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Package Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Basic Training Package"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what's included..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="200"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="sessions">Sessions *</Label>
                  <Input
                    id="sessions"
                    type="number"
                    placeholder="4"
                    value={sessions}
                    onChange={(e) => setSessions(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="package">Package</SelectItem>
                    <SelectItem value="membership">Membership</SelectItem>
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
              <Button onClick={handleSave} disabled={loading} className="flex-1 bg-primary hover:bg-primary/90 text-black">
                {loading ? "Saving..." : editingPackage ? "Update" : "Create"}
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
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Packages</p>
              <p className="text-2xl font-bold text-white">{packages.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sold</p>
              <p className="text-2xl font-bold text-white">{totalSold}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Packages List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">All Packages</h2>
        <div className="space-y-4">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="p-4 bg-muted/30">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{pkg.name}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {pkg.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{pkg.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        <span className="text-white font-semibold">${pkg.price}</span> / {pkg.sessions} sessions
                      </span>
                      <span className="text-muted-foreground">
                        <span className="text-white font-semibold">{pkg.soldCount}</span> sold
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(pkg)}
                    className="text-primary hover:text-primary hover:bg-primary/10"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(pkg.id)}
                    className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  )
}


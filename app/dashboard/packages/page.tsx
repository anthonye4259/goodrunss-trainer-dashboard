"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, DollarSign, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"

interface PackageItem {
  id: string
  name: string
  description: string
  type: "session-pack" | "membership" | "class-pass"
  price: number
  sessions: number
  duration: string
  status: "active" | "inactive"
  soldCount: number
}

export default function PackagesPage() {
  const { toast } = useToast()
  const [packages, setPackages] = useState<PackageItem[]>([
    {
      id: "1",
      name: "10 Session Pack",
      description: "10 personal training sessions valid for 3 months",
      type: "session-pack",
      price: 500,
      sessions: 10,
      duration: "3 months",
      status: "active",
      soldCount: 15,
    },
    {
      id: "2",
      name: "Monthly Membership",
      description: "Unlimited sessions with weekly check-ins",
      type: "membership",
      price: 199,
      sessions: 999,
      duration: "1 month",
      status: "active",
      soldCount: 32,
    },
  ])

  const [open, setOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null)
  const [loading, setLoading] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"session-pack" | "membership" | "class-pass">("session-pack")
  const [price, setPrice] = useState("")
  const [sessions, setSessions] = useState("")
  const [duration, setDuration] = useState("")

  const resetForm = () => {
    setName("")
    setDescription("")
    setType("session-pack")
    setPrice("")
    setSessions("")
    setDuration("")
    setEditingPackage(null)
  }

  const handleEdit = (pkg: PackageItem) => {
    setEditingPackage(pkg)
    setName(pkg.name)
    setDescription(pkg.description)
    setType(pkg.type)
    setPrice(pkg.price.toString())
    setSessions(pkg.sessions.toString())
    setDuration(pkg.duration)
    setOpen(true)
  }

  const handleSubmit = async () => {
    if (!name || !price || !sessions || !duration) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (editingPackage) {
      setPackages(
        packages.map((p) =>
          p.id === editingPackage.id
            ? {
                ...p,
                name,
                description,
                type,
                price: Number.parseFloat(price),
                sessions: Number.parseInt(sessions),
                duration,
              }
            : p,
        ),
      )
      toast({ title: "Package updated successfully" })
    } else {
      const newPackage: PackageItem = {
        id: Date.now().toString(),
        name,
        description,
        type,
        price: Number.parseFloat(price),
        sessions: Number.parseInt(sessions),
        duration,
        status: "active",
        soldCount: 0,
      }
      setPackages([...packages, newPackage])
      toast({ title: "Package created successfully" })
    }

    setLoading(false)
    setOpen(false)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setPackages(packages.filter((p) => p.id !== id))
    toast({ title: "Package deleted successfully" })
    setLoading(false)
  }

  const totalRevenue = packages.reduce((sum, pkg) => sum + pkg.price * pkg.soldCount, 0)
  const totalSold = packages.reduce((sum, pkg) => sum + pkg.soldCount, 0)

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Packages & Memberships</h1>
            <p className="text-muted-foreground mt-1">Manage your training packages and membership offerings</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-primary hover:bg-primary/90 text-black">
                <Plus className="mr-2 h-4 w-4" /> Create Package
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingPackage ? "Edit Package" : "Create New Package"}</DialogTitle>
                <DialogDescription>
                  {editingPackage ? "Update package details" : "Add a new package to your offerings"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="name">Package Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., 10 Session Pack"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what's included..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <Select value={type} onValueChange={(v: any) => setType(v)}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="session-pack">Session Pack</SelectItem>
                        <SelectItem value="membership">Membership</SelectItem>
                        <SelectItem value="class-pass">Class Pass</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="199"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sessions">Sessions *</Label>
                    <Input
                      id="sessions"
                      type="number"
                      placeholder="10"
                      value={sessions}
                      onChange={(e) => setSessions(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration *</Label>
                    <Input
                      id="duration"
                      placeholder="3 months"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading} className="bg-primary hover:bg-primary/90 text-black">
                  {loading ? <Spinner className="h-4 w-4" /> : editingPackage ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                {/* Placeholder for Package icon */}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Packages</p>
                <p className="text-2xl font-bold text-white">{packages.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sold</p>
                <p className="text-2xl font-bold text-white">{totalSold}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="border-2 border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Sold</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-white">{pkg.name}</p>
                      <p className="text-sm text-muted-foreground">{pkg.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {pkg.type.replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-white">${pkg.price}</TableCell>
                  <TableCell>{pkg.sessions === 999 ? "Unlimited" : pkg.sessions}</TableCell>
                  <TableCell>{pkg.duration}</TableCell>
                  <TableCell>{pkg.soldCount}</TableCell>
                  <TableCell>
                    <Badge variant={pkg.status === "active" ? "default" : "secondary"}>{pkg.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(pkg)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(pkg.id)} disabled={loading}>
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

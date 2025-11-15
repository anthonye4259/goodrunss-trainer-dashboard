"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

const mockPrograms = [
  {
    id: 1,
    name: "Strength Foundation",
    description: "12-week progressive strength training program for beginners",
    duration: "12 weeks",
    sessions: 36,
    price: 899,
    clients: 8,
  },
  {
    id: 2,
    name: "HIIT Transformation",
    description: "8-week high-intensity interval training for fat loss",
    duration: "8 weeks",
    sessions: 24,
    price: 599,
    clients: 12,
  },
  {
    id: 3,
    name: "Yoga & Wellness",
    description: "6-week mindfulness and flexibility program",
    duration: "6 weeks",
    sessions: 18,
    price: 449,
    clients: 15,
  },
  {
    id: 4,
    name: "Marathon Prep",
    description: "16-week endurance training for marathon runners",
    duration: "16 weeks",
    sessions: 48,
    price: 1199,
    clients: 5,
  },
]

export default function ProgramsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Program Created",
      description: "Your new training program has been created successfully.",
    })
    setIsAddDialogOpen(false)
  }

  const handleDeleteProgram = (id: number) => {
    toast({
      title: "Program Deleted",
      description: "The training program has been removed.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Training Programs</h1>
          <p className="text-primary mt-1">Create and manage your training packages</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create Program
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-primary">Create New Program</DialogTitle>
              <DialogDescription className="text-primary">
                Design a new training program for your clients
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProgram} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-primary">
                  Program Name
                </Label>
                <Input id="name" placeholder="e.g., Strength Foundation" required className="text-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-primary">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the program goals and approach"
                  required
                  className="text-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-primary">
                    Duration
                  </Label>
                  <Input id="duration" placeholder="e.g., 12 weeks" required className="text-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessions" className="text-primary">
                    Total Sessions
                  </Label>
                  <Input id="sessions" type="number" placeholder="36" required className="text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-primary">
                  Price ($)
                </Label>
                <Input id="price" type="number" placeholder="899" required className="text-primary" />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Create Program
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPrograms.map((program) => (
          <Card key={program.id} className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-primary">{program.name}</CardTitle>
              <CardDescription className="text-primary">{program.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-primary">Duration:</span>
                  <span className="font-medium text-primary">{program.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary">Sessions:</span>
                  <span className="font-medium text-primary">{program.sessions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary">Price:</span>
                  <span className="font-medium text-primary">${program.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Active Clients:
                  </span>
                  <span className="font-medium text-primary">{program.clients}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-primary border-primary hover:bg-primary/10 bg-transparent"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-destructive border-destructive hover:bg-destructive/10 bg-transparent"
                  onClick={() => handleDeleteProgram(program.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

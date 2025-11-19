"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Copy, Trash2, Edit } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner" // Fixed import to use named export instead of default

// Session plans will be loaded from your database
export default function WorkoutsPage() {
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Fetch session plans on mount
  useEffect(() => {
    fetchWorkoutPlans()
  }, [])

  const fetchWorkoutPlans = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/workouts')
      if (!response.ok) throw new Error('Failed to fetch session plans')
      const data = await response.json()
      setWorkoutPlans(data.workoutPlans || [])
    } catch (error) {
      console.error('Error fetching session plans:', error)
      toast({
        title: "Error loading session plans",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPlans = workoutPlans.filter(
    (plan) =>
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plan.description && plan.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.get('clientId') || 'default-client', // You'd get this from a client selector
          name: formData.get('planName'),
          description: formData.get('description'),
          goal: formData.get('goal'),
          duration: Number(formData.get('duration')),
          difficulty: formData.get('difficulty'),
          fitnessLevel: formData.get('difficulty'), // Use same value
          availableTime: Number(formData.get('sessionDuration')) || 60,
          sessionsPerWeek: Number(formData.get('sessionsPerWeek')) || 3,
          equipment: [],
          injuries: [],
          clientGoals: {},
        }),
      })

      if (!response.ok) throw new Error('Failed to create workout plan')

      await fetchWorkoutPlans()
      
      toast({
        title: "Workout Plan Created",
        description: "New workout plan has been created successfully.",
      })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Error creating workout plan:', error)
      toast({
        title: "Error creating workout plan",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDuplicatePlan = (planId: string) => {
    toast({
      title: "Plan Duplicated",
      description: "Workout plan has been duplicated successfully.",
    })
  }

  const handleDeletePlan = (planId: string) => {
    toast({
      title: "Plan Deleted",
      description: "Workout plan has been deleted.",
    })
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Workout Plans</h1>
          <p className="mt-2 text-muted-foreground">Create and manage training programs</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Workout Plan</DialogTitle>
              <DialogDescription>Design a new training program for your clients</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="planName">Plan Name</Label>
                <Input id="planName" placeholder="Strength Building - Beginner" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe the workout plan..." rows={3} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 weeks</SelectItem>
                      <SelectItem value="4">4 weeks</SelectItem>
                      <SelectItem value="6">6 weeks</SelectItem>
                      <SelectItem value="8">8 weeks</SelectItem>
                      <SelectItem value="12">12 weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting && <Spinner className="h-4 w-4" />}
                {isSubmitting ? "Creating..." : "Create Plan"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search workout plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.map((plan: any) => (
              <Card key={plan.id} className="glass-card hover:bg-secondary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-foreground">{plan.name}</CardTitle>
                      <Badge className="mt-2 bg-primary/20 text-primary">{plan.difficulty}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Duration</div>
                      <div className="font-semibold text-foreground">{plan.duration}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Exercises</div>
                      <div className="font-semibold text-foreground">{plan.exercises}</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Assigned to </span>
                    <span className="font-semibold text-primary">{plan.assignedTo} clients</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDuplicatePlan(plan.id)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeletePlan(plan.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedPlan && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground">Workout Plan Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Week 1 - Day 1</h3>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exercise
                </Button>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Barbell Squat", sets: 4, reps: "8-10", rest: "90s" },
                  { name: "Bench Press", sets: 4, reps: "8-10", rest: "90s" },
                  { name: "Deadlift", sets: 3, reps: "6-8", rest: "120s" },
                  { name: "Pull-ups", sets: 3, reps: "Max", rest: "60s" },
                ].map((exercise, i) => (
                  <div key={i} className="p-4 rounded-lg bg-secondary/50 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{exercise.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {exercise.sets} sets × {exercise.reps} reps • {exercise.rest} rest
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

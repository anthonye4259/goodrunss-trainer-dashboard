"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Play, BookOpen } from "lucide-react"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Drills & activities will be loaded from your database
export default function ExercisesPage() {
  const [exercises, setExercises] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Fetch drills & activities on mount
  useEffect(() => {
    fetchExercises()
  }, [])

  const fetchExercises = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/exercises')
      if (!response.ok) throw new Error('Failed to fetch drills & activities')
      const data = await response.json()
      setExercises(data.exercises || [])
    } catch (error) {
      console.error('Error fetching drills & activities:', error)
      toast({
        title: "Error loading drills & activities",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exercise.muscleGroups && exercise.muscleGroups.some((mg: string) => mg.toLowerCase().includes(searchQuery.toLowerCase())))
    const matchesCategory = selectedCategory === "all" || exercise.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('exerciseName'),
          description: formData.get('description'),
          category: formData.get('category'),
          difficulty: formData.get('difficulty'),
          instructions: formData.get('instructions'),
          muscleGroups: formData.get('muscleGroups') ? (formData.get('muscleGroups') as string).split(',').map(s => s.trim()) : [],
          equipment: formData.get('equipment') ? (formData.get('equipment') as string).split(',').map(s => s.trim()) : [],
          videoUrl: formData.get('videoUrl') || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to create exercise')

      await fetchExercises()
      
      toast({
        title: "Exercise Added",
        description: "New exercise has been added to your library.",
      })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Error creating exercise:', error)
      toast({
        title: "Error creating exercise",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Exercise Library</h1>
          <p className="text-muted-foreground mt-1">Browse and manage your exercise database</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Exercise
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Exercise</DialogTitle>
              <DialogDescription>Add a new exercise to your library</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateExercise} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exerciseName">Exercise Name</Label>
                <Input id="exerciseName" placeholder="Barbell Squat" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strength">Strength</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="flexibility">Flexibility</SelectItem>
                      <SelectItem value="balance">Balance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="muscleGroup">Muscle Group</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select muscle group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chest">Chest</SelectItem>
                      <SelectItem value="back">Back</SelectItem>
                      <SelectItem value="legs">Legs</SelectItem>
                      <SelectItem value="shoulders">Shoulders</SelectItem>
                      <SelectItem value="arms">Arms</SelectItem>
                      <SelectItem value="core">Core</SelectItem>
                      <SelectItem value="fullbody">Full Body</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipment</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bodyweight">Bodyweight</SelectItem>
                      <SelectItem value="barbell">Barbell</SelectItem>
                      <SelectItem value="dumbbell">Dumbbell</SelectItem>
                      <SelectItem value="machine">Machine</SelectItem>
                      <SelectItem value="cable">Cable</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
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
              <div className="space-y-2">
                <Label htmlFor="exerciseDescription">Description</Label>
                <Textarea id="exerciseDescription" placeholder="Describe the exercise..." rows={2} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea id="instructions" placeholder="Step-by-step instructions..." rows={3} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL (optional)</Label>
                <Input id="videoUrl" type="url" placeholder="https://..." />
              </div>
              <Button type="submit" className="w-full">
                Add Exercise
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
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="Strength">Strength</TabsTrigger>
                <TabsTrigger value="Cardio">Cardio</TabsTrigger>
                <TabsTrigger value="Flexibility">Flexibility</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((exercise: any) => (
              <Card
                key={exercise.id}
                className="glass-card hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => setSelectedExercise(exercise)}
              >
                <CardHeader>
                  <div className="aspect-video bg-secondary rounded-lg mb-3 flex items-center justify-center">
                    <Play className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg text-foreground">{exercise.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-primary/20 text-primary">{exercise.category}</Badge>
                    <Badge variant="outline">{exercise.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Muscle Group:</span>
                      <span className="font-medium text-foreground">{exercise.muscleGroup}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Equipment:</span>
                      <span className="font-medium text-foreground">{exercise.equipment}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedExercise && (
        <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedExercise.name}</DialogTitle>
              <div className="flex gap-2 mt-2">
                <Badge className="bg-primary/20 text-primary">{selectedExercise.category}</Badge>
                <Badge variant="outline">{selectedExercise.difficulty}</Badge>
                <Badge variant="outline">{selectedExercise.muscleGroup}</Badge>
              </div>
            </DialogHeader>
            <div className="space-y-6">
              <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                <Play className="w-16 h-16 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Description
                  </h3>
                  <p className="text-muted-foreground">{selectedExercise.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Instructions</h3>
                  <p className="text-muted-foreground">{selectedExercise.instructions}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/50">
                  <div>
                    <div className="text-sm text-muted-foreground">Equipment</div>
                    <div className="font-semibold text-foreground">{selectedExercise.equipment}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Difficulty</div>
                    <div className="font-semibold text-foreground">{selectedExercise.difficulty}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-primary hover:bg-primary/90">Add to Workout</Button>
                <Button variant="outline">Edit Exercise</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

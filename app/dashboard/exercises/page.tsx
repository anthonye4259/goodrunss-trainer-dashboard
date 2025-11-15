"use client"

import type React from "react"

import { useState } from "react"
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

const mockExercises = [
  {
    id: "1",
    name: "Barbell Squat",
    category: "Strength",
    muscleGroup: "Legs",
    equipment: "Barbell",
    difficulty: "Intermediate",
    description: "A compound exercise that targets the quadriceps, hamstrings, and glutes.",
    instructions:
      "Stand with feet shoulder-width apart, bar on upper back. Lower by bending knees and hips. Return to start.",
    videoUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "2",
    name: "Bench Press",
    category: "Strength",
    muscleGroup: "Chest",
    equipment: "Barbell",
    difficulty: "Intermediate",
    description: "A fundamental upper body exercise targeting the chest, shoulders, and triceps.",
    instructions: "Lie on bench, grip bar slightly wider than shoulders. Lower to chest, press back up.",
    videoUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "3",
    name: "Burpees",
    category: "Cardio",
    muscleGroup: "Full Body",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    description: "A full-body exercise that combines a squat, plank, and jump.",
    instructions: "Start standing, drop to plank, do push-up, jump feet to hands, jump up with arms overhead.",
    videoUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "4",
    name: "Deadlift",
    category: "Strength",
    muscleGroup: "Back",
    equipment: "Barbell",
    difficulty: "Advanced",
    description: "A compound movement that works the entire posterior chain.",
    instructions: "Stand with feet hip-width, grip bar. Keep back straight, lift by extending hips and knees.",
    videoUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "5",
    name: "Mountain Climbers",
    category: "Cardio",
    muscleGroup: "Core",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    description: "A dynamic exercise that builds cardiovascular endurance and core strength.",
    instructions: "Start in plank position. Alternate bringing knees to chest in a running motion.",
    videoUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "6",
    name: "Pull-ups",
    category: "Strength",
    muscleGroup: "Back",
    equipment: "Pull-up Bar",
    difficulty: "Intermediate",
    description: "An upper body exercise that primarily targets the back and biceps.",
    instructions: "Hang from bar with overhand grip. Pull body up until chin is over bar. Lower with control.",
    videoUrl: "/placeholder.svg?height=200&width=300",
  },
]

export default function ExercisesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedExercise, setSelectedExercise] = useState<(typeof mockExercises)[0] | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  const filteredExercises = mockExercises.filter((exercise) => {
    const matchesSearch =
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || exercise.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Exercise Added",
      description: "New exercise has been added to your library.",
    })
    setIsCreateDialogOpen(false)
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
            {filteredExercises.map((exercise) => (
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

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Star, 
  Trash2, 
  Eye,
  Loader2,
  Sparkles
} from "lucide-react"

interface Program {
  id: string
  title: string
  description?: string
  type: string
  sportCategory?: string
  difficultyLevel?: string
  durationMinutes?: number
  content: any
  createdAt: string
  isFavorite: boolean
  timesUsed: number
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    try {
      const response = await fetch("/api/gia/programs")
      const data = await response.json()
      
      if (data.success) {
        setPrograms(data.programs)
      }
    } catch (error) {
      console.error("Failed to fetch programs:", error)
    } finally {
      setLoading(false)
    }
  }

  const typeLabels: Record<string, string> = {
    lesson_plan: "Lesson Plan",
    workout_program: "Workout Program",
    class_sequence: "Class Sequence",
    drill_progression: "Drill Progression",
  }

  const filterByType = (type?: string) => {
    if (!type) return programs
    return programs.filter(p => p.type === type)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (programs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Programs Yet</h2>
        <p className="text-muted-foreground mb-4 max-w-md">
          Ask GIA to create lesson plans, workout programs, or class sequences.
          <br />
          Then save them to your library!
        </p>
        <Button>
          <Sparkles className="h-4 w-4 mr-2" />
          Open GIA
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Program Library</h1>
        <p className="text-muted-foreground">
          Your saved lesson plans, programs, and sequences from GIA
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All ({programs.length})
          </TabsTrigger>
          <TabsTrigger value="lesson_plan">
            Lessons ({filterByType('lesson_plan').length})
          </TabsTrigger>
          <TabsTrigger value="workout_program">
            Programs ({filterByType('workout_program').length})
          </TabsTrigger>
          <TabsTrigger value="class_sequence">
            Classes ({filterByType('class_sequence').length})
          </TabsTrigger>
          <TabsTrigger value="drill_progression">
            Drills ({filterByType('drill_progression').length})
          </TabsTrigger>
        </TabsList>

        {['all', 'lesson_plan', 'workout_program', 'class_sequence', 'drill_progression'].map((type) => (
          <TabsContent key={type} value={type} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(type === 'all' ? programs : filterByType(type)).map((program) => (
                <Card key={program.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {program.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {program.description}
                        </CardDescription>
                      </div>
                      {program.isFavorite && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {typeLabels[program.type] || program.type}
                      </Badge>
                      {program.sportCategory && (
                        <Badge variant="outline">
                          {program.sportCategory}
                        </Badge>
                      )}
                      {program.difficultyLevel && (
                        <Badge variant="outline">
                          {program.difficultyLevel}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {program.durationMinutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {program.durationMinutes} min
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(program.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {program.timesUsed > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Used {program.timesUsed} {program.timesUsed === 1 ? 'time' : 'times'}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedProgram(program)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Program Detail Modal - Add later */}
      {selectedProgram && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedProgram.title}</CardTitle>
                  <CardDescription>{selectedProgram.description}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedProgram(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm">
                {selectedProgram.content.raw}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

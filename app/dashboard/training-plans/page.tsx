"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { ChevronRight, ChevronLeft, Loader2, ChevronDown, ChevronUp, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TrainingPlansPage() {
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPlan, setShowPlan] = useState(false)
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([])
  const { toast } = useToast()

  // Form data
  const [formData, setFormData] = useState({
    clientName: "",
    skillLevel: "",
    goal: "",
    duration: "",
    workoutsPerWeek: "",
    equipment: "",
    injuries: "",
    notes: "",
  })

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    // Simulate 30 second generation
    setTimeout(() => {
      setIsGenerating(false)
      setShowPlan(true)
      toast({
        title: "Training plan generated!",
        description: "Your customized training plan is ready for review.",
      })
    }, 30000) // 30 seconds
  }

  const handleApprove = () => {
    toast({
      title: "Plan approved!",
      description: "Training plan has been saved and sent to client.",
    })
    // Reset form
    setShowPlan(false)
    setStep(1)
    setFormData({
      clientName: "",
      skillLevel: "",
      goal: "",
      duration: "",
      workoutsPerWeek: "",
      equipment: "",
      injuries: "",
      notes: "",
    })
  }

  const toggleWeek = (weekIndex: number) => {
    setExpandedWeeks((prev) => (prev.includes(weekIndex) ? prev.filter((w) => w !== weekIndex) : [...prev, weekIndex]))
  }

  // Mock generated plan data
  const generatedPlan = {
    overview: {
      title: `${formData.duration}-Week ${formData.goal} Program`,
      description: `A personalized ${formData.skillLevel} level training plan with ${formData.workoutsPerWeek} workouts per week.`,
    },
    weeks: Array.from({ length: Number.parseInt(formData.duration) || 4 }, (_, weekIndex) => ({
      weekNumber: weekIndex + 1,
      focus:
        weekIndex === 0
          ? "Foundation & Form"
          : weekIndex === 1
            ? "Building Strength"
            : weekIndex === 2
              ? "Progressive Overload"
              : "Peak Performance",
      workouts: [
        {
          day: "Monday",
          title: "Upper Body Strength",
          exercises: ["Bench Press - 4x8", "Bent Over Rows - 4x10", "Shoulder Press - 3x12", "Bicep Curls - 3x12"],
        },
        {
          day: "Wednesday",
          title: "Lower Body Power",
          exercises: ["Squats - 4x8", "Romanian Deadlifts - 4x10", "Lunges - 3x12 each", "Calf Raises - 3x15"],
        },
        {
          day: "Friday",
          title: "Full Body Conditioning",
          exercises: ["Deadlifts - 3x6", "Pull-ups - 3x8", "Dips - 3x10", "Plank Holds - 3x60s"],
        },
      ],
    })),
  }

  const totalSteps = 3

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Training Plan Generator</h1>
          <p className="text-muted-foreground">Create personalized training plans powered by AI</p>
        </div>

        {!showPlan ? (
          <Card className="bg-card border-border p-6 md:p-8">
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div key={i} className="flex items-center flex-1 last:flex-initial">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        step > i + 1
                          ? "bg-primary text-primary-foreground"
                          : step === i + 1
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    {i < totalSteps - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 rounded-full transition-colors ${
                          step > i + 1 ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Client Info</span>
                <span>Program Details</span>
                <span>Additional Info</span>
              </div>
            </div>

            {/* Step 1: Client Information */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Client Information</h2>

                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    placeholder="Enter client name"
                    value={formData.clientName}
                    onChange={(e) => updateFormData("clientName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skillLevel">Current Skill Level</Label>
                  <Select value={formData.skillLevel} onValueChange={(value) => updateFormData("skillLevel", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select skill level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Primary Goal</Label>
                  <Select value={formData.goal} onValueChange={(value) => updateFormData("goal", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                      <SelectItem value="Muscle Building">Muscle Building</SelectItem>
                      <SelectItem value="Strength Training">Strength Training</SelectItem>
                      <SelectItem value="Endurance">Endurance</SelectItem>
                      <SelectItem value="General Conditioning">General Conditioning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Program Details */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Program Details</h2>

                <div className="space-y-2">
                  <Label htmlFor="duration">Program Duration (weeks)</Label>
                  <Select value={formData.duration} onValueChange={(value) => updateFormData("duration", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 weeks</SelectItem>
                      <SelectItem value="8">8 weeks</SelectItem>
                      <SelectItem value="12">12 weeks</SelectItem>
                      <SelectItem value="16">16 weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workoutsPerWeek">Workouts Per Week</Label>
                  <Select
                    value={formData.workoutsPerWeek}
                    onValueChange={(value) => updateFormData("workoutsPerWeek", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 days</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="4">4 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                      <SelectItem value="6">6 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipment">Available Equipment</Label>
                  <Select value={formData.equipment} onValueChange={(value) => updateFormData("equipment", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment access" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-gym">Full Gym Access</SelectItem>
                      <SelectItem value="home-basic">Home Gym (Basic)</SelectItem>
                      <SelectItem value="bodyweight">Bodyweight Only</SelectItem>
                      <SelectItem value="limited">Limited Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Additional Information */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Additional Information</h2>

                <div className="space-y-2">
                  <Label htmlFor="injuries">Injuries or Limitations</Label>
                  <Textarea
                    id="injuries"
                    placeholder="List any injuries, limitations, or exercises to avoid..."
                    value={formData.injuries}
                    onChange={(e) => updateFormData("injuries", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any other preferences or requirements..."
                    value={formData.notes}
                    onChange={(e) => updateFormData("notes", e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {step < totalSteps ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && (!formData.clientName || !formData.skillLevel || !formData.goal)) ||
                    (step === 2 && (!formData.duration || !formData.workoutsPerWeek || !formData.equipment))
                  }
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleGenerate} className="bg-primary hover:bg-primary/90">
                  Generate Plan
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Plan Overview */}
            <Card className="bg-card border-border p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-primary mb-2">{generatedPlan.overview.title}</h2>
                <p className="text-muted-foreground">{generatedPlan.overview.description}</p>
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Client:</span>
                  <span className="ml-2 font-medium text-white">{formData.clientName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Level:</span>
                  <span className="ml-2 font-medium text-white capitalize">{formData.skillLevel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2 font-medium text-white">{formData.duration} weeks</span>
                </div>
              </div>
            </Card>

            {/* Weekly Breakdown */}
            <div className="space-y-4">
              {generatedPlan.weeks.map((week, weekIndex) => (
                <Card key={weekIndex} className="bg-card border-border overflow-hidden">
                  <button
                    onClick={() => toggleWeek(weekIndex)}
                    className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-primary">Week {week.weekNumber}</h3>
                      <p className="text-sm text-muted-foreground">{week.focus}</p>
                    </div>
                    {expandedWeeks.includes(weekIndex) ? (
                      <ChevronUp className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-primary" />
                    )}
                  </button>

                  {expandedWeeks.includes(weekIndex) && (
                    <div className="px-6 pb-6 space-y-4 border-t border-border pt-4">
                      {week.workouts.map((workout, workoutIndex) => (
                        <div key={workoutIndex} className="bg-muted/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-white">{workout.day}</h4>
                            <span className="text-sm text-primary font-medium">{workout.title}</span>
                          </div>
                          <ul className="space-y-2">
                            {workout.exercises.map((exercise, exerciseIndex) => (
                              <li key={exerciseIndex} className="text-sm text-muted-foreground flex items-start">
                                <span className="text-primary mr-2">•</span>
                                {exercise}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPlan(false)
                  setExpandedWeeks([])
                }}
                className="flex-1"
              >
                Edit Plan
              </Button>
              <Button onClick={handleApprove} className="flex-1 bg-primary hover:bg-primary/90">
                <Check className="w-4 h-4 mr-2" />
                Approve Plan
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Loading Modal */}
      <Dialog open={isGenerating}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
            <DialogTitle className="text-xl font-semibold text-center mb-2">Generating Your Training Plan</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Our AI is creating a personalized training plan based on your inputs. This will take about 30 seconds...
            </DialogDescription>
            <div className="mt-6 w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="h-full bg-primary animate-pulse" style={{ width: "100%" }} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

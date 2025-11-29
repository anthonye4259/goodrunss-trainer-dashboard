"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronLeft, Loader2, Plus, Play, Copy, Archive, CheckCircle2, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TrainingPlan {
  id: string
  name: string
  clientId: string
  clients?: {
    name: string
    email: string
  }
  goal: string
  duration: number
  sessionsPerWeek: number
  difficulty: string
  status: string
  completedSessions: number
  totalSessions: number
  completionRate: number
  currentWeek: number
  startDate?: string
  createdAt: string
}

export default function TrainingPlansPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [plans, setPlans] = useState<TrainingPlan[]>([])
  const [clients, setClients] = useState<any[]>([])
  const { toast } = useToast()

  // Form data
  const [formData, setFormData] = useState({
    clientId: "",
    clientName: "",
    name: "",
    goal: "",
    duration: "",
    sessionsPerWeek: "",
    difficulty: "",
    equipment: "",
    injuries: "",
    notes: "",
  })

  // Fetch plans and clients on mount
  useEffect(() => {
    fetchPlans()
    fetchClients()
  }, [])

  const fetchPlans = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/training-plans')
      const data = await res.json()
      if (data.success) {
        setPlans(data.plans)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
      toast({
        title: "Error",
        description: "Failed to load training plans",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      const data = await res.json()
      if (data.clients) {
        setClients(data.clients)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Auto-populate name if client is selected
    if (field === 'clientId' && value) {
      const client = clients.find(c => c.id === value)
      if (client) {
        setFormData(prev => ({ ...prev, clientName: client.name }))
      }
    }
  }

  const handleCreatePlan = async () => {
    if (!formData.clientId || !formData.name || !formData.goal || !formData.duration || !formData.sessionsPerWeek) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch('/api/training-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.clientId,
          name: formData.name,
          goal: formData.goal,
          duration: parseInt(formData.duration),
          sessionsPerWeek: parseInt(formData.sessionsPerWeek),
          difficulty: formData.difficulty || 'intermediate',
          equipment: formData.equipment ? [formData.equipment] : [],
          injuries: formData.injuries ? [formData.injuries] : [],
          preferences: formData.notes ? { notes: formData.notes } : null,
          generatedBy: 'manual',
          fitnessLevel: formData.difficulty || 'intermediate',
          availableTime: 60,
          clientGoals: { primary: formData.goal }
        })
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: "✅ Plan created!",
          description: `Training plan "${formData.name}" has been created`
        })
        setShowCreateDialog(false)
        setStep(1)
        setFormData({
          clientId: "",
          clientName: "",
          name: "",
          goal: "",
          duration: "",
          sessionsPerWeek: "",
          difficulty: "",
          equipment: "",
          injuries: "",
          notes: "",
        })
        fetchPlans() // Reload plans
      } else {
        throw new Error(data.error || 'Failed to create plan')
      }
    } catch (error: any) {
      console.error('Error creating plan:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create training plan",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  const activatePlan = async (planId: string, planName: string) => {
    try {
      const res = await fetch(`/api/training-plans/${planId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate', startDate: new Date().toISOString() })
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: "✅ Plan activated",
          description: `"${planName}" is now active`
        })
        fetchPlans()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate plan",
        variant: "destructive"
      })
    }
  }

  const clonePlan = async (planId: string, planName: string) => {
    try {
      const res = await fetch(`/api/training-plans/${planId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clone' })
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: "✅ Plan cloned",
          description: `Created copy of "${planName}"`
        })
        fetchPlans()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clone plan",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: any = {
      draft: "bg-gray-500/20 text-gray-300",
      active: "bg-green-500/20 text-green-300",
      completed: "bg-blue-500/20 text-blue-300",
      archived: "bg-gray-500/20 text-gray-400"
    }
    return (
      <Badge className={styles[status] || styles.draft}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const totalSteps = 3

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Training Plans</h1>
            <p className="text-muted-foreground">Create and manage personalized training programs</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        </div>

        {/* Plans List */}
        {isLoading ? (
          <Card className="bg-card border-border p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Loading training plans...</p>
            </div>
          </Card>
        ) : plans.length === 0 ? (
          <Card className="bg-card border-border p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No training plans yet</h3>
              <p className="text-muted-foreground mb-6">Create your first training plan to get started</p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create First Plan
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="bg-card border-border p-6 hover:border-primary/50 transition-colors">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                    {getStatusBadge(plan.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.clients?.name || 'No client'}</p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Goal:</span>
                    <span className="text-white">{plan.goal}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="text-white">{plan.duration} weeks</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sessions/week:</span>
                    <span className="text-white">{plan.sessionsPerWeek}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress:</span>
                    <span className="text-white">{plan.completedSessions}/{plan.totalSessions} ({Math.round(plan.completionRate)}%)</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current:</span>
                    <span className="text-white">Week {plan.currentWeek}/{plan.duration}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${plan.completionRate}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {plan.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => activatePlan(plan.id, plan.name)}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Activate
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => clonePlan(plan.id, plan.name)}
                    className="flex-1"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Clone
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Plan Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Training Plan</DialogTitle>
            <DialogDescription>
              Design a personalized training program for your client
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-6">
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
                    {step > i + 1 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
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

            {/* Step 1: Client & Plan Name */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client *</Label>
                  <Select value={formData.clientId} onValueChange={(value) => updateFormData("clientId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., 8-Week Strength Building"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Primary Goal *</Label>
                  <Input
                    id="goal"
                    placeholder="e.g., Build muscle, lose fat, increase endurance"
                    value={formData.goal}
                    onChange={(e) => updateFormData("goal", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Program Details */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (weeks) *</Label>
                  <Select value={formData.duration} onValueChange={(value) => updateFormData("duration", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 weeks</SelectItem>
                      <SelectItem value="6">6 weeks</SelectItem>
                      <SelectItem value="8">8 weeks</SelectItem>
                      <SelectItem value="12">12 weeks</SelectItem>
                      <SelectItem value="16">16 weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionsPerWeek">Sessions Per Week *</Label>
                  <Select value={formData.sessionsPerWeek} onValueChange={(value) => updateFormData("sessionsPerWeek", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 days/week</SelectItem>
                      <SelectItem value="3">3 days/week</SelectItem>
                      <SelectItem value="4">4 days/week</SelectItem>
                      <SelectItem value="5">5 days/week</SelectItem>
                      <SelectItem value="6">6 days/week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => updateFormData("difficulty", value)}>
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

                <div className="space-y-2">
                  <Label htmlFor="equipment">Available Equipment</Label>
                  <Input
                    id="equipment"
                    placeholder="e.g., Dumbbells, barbell, resistance bands"
                    value={formData.equipment}
                    onChange={(e) => updateFormData("equipment", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Additional Info */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="injuries">Injuries or Limitations</Label>
                  <Textarea
                    id="injuries"
                    placeholder="List any injuries or exercises to avoid..."
                    value={formData.injuries}
                    onChange={(e) => updateFormData("injuries", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any other preferences or requirements..."
                    value={formData.notes}
                    onChange={(e) => updateFormData("notes", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)} 
                disabled={step === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {step < totalSteps ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && (!formData.clientId || !formData.name || !formData.goal)) ||
                    (step === 2 && (!formData.duration || !formData.sessionsPerWeek))
                  }
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleCreatePlan} 
                  disabled={isCreating}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Plan
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

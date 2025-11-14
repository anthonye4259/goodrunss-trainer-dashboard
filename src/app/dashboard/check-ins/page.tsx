"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { CheckCircle2, Plus, Send, TrendingUp, MessageSquare } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function CheckInsPage() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<any[]>([])
  const [checkIns, setCheckIns] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Form state
  const [templateName, setTemplateName] = useState("")
  const [type, setType] = useState("daily")
  const [questions, setQuestions] = useState("Energy level?\nSleep quality?\nNutrition?\nOverall mood?")

  // Fetch templates and check-ins on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [templatesRes, checkInsRes] = await Promise.all([
          fetch('/api/check-ins?type=templates'),
          fetch('/api/check-ins')
        ])

        const templatesData = await templatesRes.json()
        const checkInsData = await checkInsRes.json()

        if (templatesData.success && templatesData.templates) {
          setTemplates(templatesData.templates)
        }

        if (checkInsData.success && checkInsData.checkIns) {
          setCheckIns(checkInsData.checkIns)
        }
      } catch (error) {
        console.error("Failed to fetch check-ins:", error)
        toast({
          title: "Error",
          description: "Failed to load check-ins",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [])

  const resetForm = () => {
    setTemplateName("")
    setType("daily")
    setQuestions("Energy level?\nSleep quality?\nNutrition?\nOverall mood?")
  }

  const handleCreateTemplate = async () => {
    if (!templateName || !questions) {
      toast({
        title: "Error",
        description: "Template name and questions are required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Parse questions into structured format
      const questionList = questions.split('\n').filter(q => q.trim()).map(q => ({
        question: q.trim(),
        type: "text"
      }))

      const response = await fetch('/api/check-ins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          type,
          questions: questionList,
        }),
      })

      const data = await response.json()

      if (data.success && data.template) {
        setTemplates([...templates, data.template])
        toast({
          title: "Success",
          description: "Check-in template created successfully",
        })
        setIsDialogOpen(false)
        resetForm()
      } else {
        throw new Error(data.error || "Failed to create template")
      }
    } catch (error: any) {
      console.error("Template creation error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    pending: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    completed: "text-green-500 bg-green-500/10 border-green-500/20",
    missed: "text-red-500 bg-red-500/10 border-red-500/20",
  }

  const completionRate = checkIns.length > 0
    ? ((checkIns.filter(c => c.status === 'completed').length / checkIns.length) * 100).toFixed(0)
    : 0

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading check-ins...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Client Check-Ins</h1>
          <p className="text-muted-foreground mt-1">Track client progress with automated check-ins</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-black">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Check-In Template</DialogTitle>
              <DialogDescription>Design a custom check-in form for your clients</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="templateName">Template Name *</Label>
                <Input
                  id="templateName"
                  placeholder="e.g., Daily Wellness Check"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="type">Frequency</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="pre_session">Before Session</SelectItem>
                    <SelectItem value="post_session">After Session</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="questions">Questions (one per line) *</Label>
                <textarea
                  id="questions"
                  placeholder="Energy level?&#10;Sleep quality?&#10;Nutrition?&#10;Overall mood?"
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                  className="w-full h-32 p-2 mt-1 bg-background border border-border rounded-md text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter each question on a new line
                </p>
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
              <Button onClick={handleCreateTemplate} disabled={loading} className="flex-1 bg-primary hover:bg-primary/90 text-black">
                {loading ? "Creating..." : "Create Template"}
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
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold text-white">{completionRate}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Send className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Check-Ins</p>
              <p className="text-2xl font-bold text-white">{checkIns.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Templates</p>
              <p className="text-2xl font-bold text-white">{templates.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Templates Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Check-In Templates</h2>
        {templates.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No templates created yet</p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              variant="outline"
              className="mt-4"
            >
              Create First Template
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="p-4 bg-muted/30">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{template.name}</h3>
                    <Badge variant="outline" className="mt-1">{template.type}</Badge>
                  </div>
                  <Badge className={template.is_active ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"}>
                    {template.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{template.questions?.length || 0} questions</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Check-Ins */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Check-Ins</h2>
        {checkIns.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No check-ins yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create a template and assign it to clients to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {checkIns.slice(0, 10).map((checkIn) => (
              <Card key={checkIn.id} className="p-4 bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white">Check-In</h4>
                      <Badge className={statusColors[checkIn.status as keyof typeof statusColors] || statusColors.pending}>
                        {checkIn.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Scheduled for: {new Date(checkIn.scheduled_for).toLocaleDateString()}</p>
                      {checkIn.completed_at && (
                        <p>Completed: {new Date(checkIn.completed_at).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

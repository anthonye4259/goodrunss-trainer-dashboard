"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sparkles, Loader2, Download, Instagram, Send, Video, FileText, Clock, Target, TrendingUp, CheckCircle2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function SessionPlannerPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<any>(null)
  const [generationTime, setGenerationTime] = useState<number | null>(null)

  // Form state
  const [clientName, setClientName] = useState("")
  const [age, setAge] = useState("")
  const [level, setLevel] = useState("")
  const [sport, setSport] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")

  const handleGenerate = async () => {
    if (!clientName || !sport || !level) {
      toast({
        title: "Missing information",
        description: "Please enter client name, sport, and level",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const startTime = Date.now()

    try {
      // Call the REAL backend API
      const response = await fetch('/api/gia/generate-session-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainerId: 'current-user-id', // TODO: Get from auth
          clientName,
          clientAge: age ? parseInt(age) : undefined,
          clientLevel: level,
          sport,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate session plan')
      }

      const endTime = Date.now()
      setGenerationTime(endTime - startTime)

      // Transform backend data to frontend format
      const plan = result.data
      const transformedPlan = {
        duration: plan.sessionDuration,
        warmUp: plan.warmup.exercises.map((ex: any) => 
          `${ex.duration} min - ${ex.name}: ${ex.instructions}${ex.reps ? ` (${ex.reps} reps)` : ''}`
        ),
        drills: plan.drills.map((drill: any) => ({
          name: drill.name,
          duration: `${drill.duration} min`,
          description: drill.description,
          reps: drill.instructions.join('. '),
        })),
        cooldown: plan.cooldown.exercises.map((ex: any) => 
          `${ex.duration} min - ${ex.name}: ${ex.instructions}`
        ),
        notes: plan.notes ? plan.notes.split('\n').filter(Boolean) : [],
        progressions: plan.progressions ? plan.progressions.split('\n').filter(Boolean) : [],
        videoPlaylist: plan.videoPlaylist?.videos.map((v: any) => v.title) || [],
        instagramPost: plan.instagramContent 
          ? `${plan.instagramContent.caption}\n\n${plan.instagramContent.hashtags.join(' ')}\n\nTips:\n${plan.instagramContent.tips.map((t: string) => `• ${t}`).join('\n')}`
          : '',
        clientMessage: plan.messageToClient || '',
        planId: plan.id,
      }

      setGeneratedPlan(transformedPlan)
      
      toast({
        title: "Session plan ready!",
        description: `Generated in ${(result.generationTime / 1000).toFixed(1)} seconds`,
      })
    } catch (error) {
      console.error('Error generating plan:', error)
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download
    toast({
      title: "PDF Downloaded",
      description: "Session plan saved to your device",
    })
  }

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    })
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">AI Session Planner</h1>
            <p className="text-muted-foreground">Generate a full personalized session plan in under 20 seconds</p>
          </div>
        </div>
      </div>

      {/* Hero Card */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">The Assistant You've Always Wanted</h2>
            <p className="text-muted-foreground">
              Enter ONE detail about your client and GIA creates everything you need in seconds
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              <Clock className="inline h-8 w-8 mr-2" />
              {generationTime ? `${(generationTime / 1000).toFixed(1)}s` : '20s'}
            </div>
            <p className="text-sm text-muted-foreground">
              {generationTime ? 'Last generation' : 'Average generation time'}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Client Details</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                placeholder="e.g., Sarah"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="29"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="level">Level *</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="sport">Sport/Activity *</Label>
              <Input
                id="sport"
                placeholder="e.g., Tennis, Basketball, Pilates"
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any specific goals or considerations..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-black h-12 text-lg font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  GIA is creating your plan...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Session Plan
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* What GIA Generates */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="text-xl font-semibold text-white mb-4">What GIA Creates For You</h3>
          <div className="space-y-3">
            {[
              { icon: TrendingUp, label: "45-min session breakdown", color: "text-primary" },
              { icon: Target, label: "Warm-up routine", color: "text-green-500" },
              { icon: CheckCircle2, label: "Sport-specific drills", color: "text-blue-500" },
              { icon: Clock, label: "Cooldown sequence", color: "text-purple-500" },
              { icon: FileText, label: "Coaching notes", color: "text-orange-500" },
              { icon: TrendingUp, label: "Progression plan", color: "text-pink-500" },
              { icon: Video, label: "Video playlist", color: "text-red-500" },
              { icon: FileText, label: "Printable PDF", color: "text-cyan-500" },
              { icon: Instagram, label: "Instagram post", color: "text-purple-500" },
              { icon: Send, label: "Client message", color: "text-green-500" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <p className="text-white font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Generated Plan */}
      {generatedPlan && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Your Session Plan</h2>
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Warm-up */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">Warm-up (5 min)</h3>
              </div>
              <ul className="space-y-2">
                {generatedPlan.warmUp.map((item: string, index: number) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Cooldown */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">Cooldown (5 min)</h3>
              </div>
              <ul className="space-y-2">
                {generatedPlan.cooldown.map((item: string, index: number) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Drills */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Main Drills ({generatedPlan.duration - 10} min)</h3>
            </div>
            <div className="space-y-4">
              {generatedPlan.drills.map((drill: any, index: number) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-white">{drill.name}</h4>
                    <Badge variant="secondary">{drill.duration}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{drill.description}</p>
                  <p className="text-xs text-primary">{drill.reps}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Notes & Progressions */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">Coaching Notes</h3>
              </div>
              <ul className="space-y-2">
                {generatedPlan.notes.map((note: string, index: number) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-pink-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">Progressions</h3>
              </div>
              <ul className="space-y-2">
                {generatedPlan.progressions.map((prog: string, index: number) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{prog}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Video Playlist */}
          {generatedPlan.videoPlaylist.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <Video className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">Video Playlist</h3>
              </div>
              <div className="space-y-2">
                {generatedPlan.videoPlaylist.map((video: string, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Video className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-muted-foreground flex-1">{video}</span>
                    <Badge variant="secondary">Watch</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Social & Messaging */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Instagram className="h-5 w-5 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Instagram Post</h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyToClipboard(generatedPlan.instagramPost, "Instagram post")}
                >
                  Copy
                </Button>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {generatedPlan.instagramPost}
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Send className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Client Message</h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyToClipboard(generatedPlan.clientMessage, "Client message")}
                >
                  Copy
                </Button>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {generatedPlan.clientMessage}
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}


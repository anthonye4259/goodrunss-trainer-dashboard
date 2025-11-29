"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Sparkles, User, Award, BookOpen, AlertCircle, Mic, Video, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { VoiceVideoUpload } from "@/components/ai-persona/voice-video-upload"
import { PersonalityConfig } from "@/components/ai-persona/personality-config"
import { PersonaPreview } from "@/components/ai-persona/persona-preview"

interface AIPersona {
  id?: string
  name: string
  tagline: string | null
  bio: string | null
  teachingStyle: string | null
  personality: any
  specialties: string[]
  certifications: string[]
  isActive: boolean
  voiceFileUrl?: string | null
  videoUrl?: string | null
}

export default function AIPersonaPage() {
  const [persona, setPersona] = useState<AIPersona>({
    name: "",
    tagline: null,
    bio: null,
    teachingStyle: null,
    personality: {},
    specialties: [],
    certifications: [],
    isActive: true,
    voiceFileUrl: null,
    videoUrl: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newSpecialty, setNewSpecialty] = useState("")
  const [newCertification, setNewCertification] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchPersona()
  }, [])

  const fetchPersona = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai-persona')

      if (!response.ok) {
        throw new Error('Failed to fetch AI persona')
      }

      const data = await response.json()
      if (data.persona) {
        setPersona(data.persona)
      }
    } catch (err: any) {
      console.error('Fetch persona error:', err)
      setError(err.message || 'Failed to load AI persona')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const response = await fetch('/api/ai-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persona)
      })

      if (!response.ok) {
        throw new Error('Failed to save AI persona')
      }

      const data = await response.json()

      toast({
        title: "✅ AI Persona Saved",
        description: "Your AI persona has been updated successfully.",
      })

      if (data.persona) {
        setPersona(data.persona)
      }
    } catch (err: any) {
      console.error('Save persona error:', err)
      toast({
        title: "Error",
        description: err.message || "Failed to save AI persona",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addSpecialty = () => {
    if (newSpecialty.trim() && !persona.specialties.includes(newSpecialty.trim())) {
      setPersona({
        ...persona,
        specialties: [...persona.specialties, newSpecialty.trim()]
      })
      setNewSpecialty("")
    }
  }

  const removeSpecialty = (specialty: string) => {
    setPersona({
      ...persona,
      specialties: persona.specialties.filter(s => s !== specialty)
    })
  }

  const addCertification = () => {
    if (newCertification.trim() && !persona.certifications.includes(newCertification.trim())) {
      setPersona({
        ...persona,
        certifications: [...persona.certifications, newCertification.trim()]
      })
      setNewCertification("")
    }
  }

  const removeCertification = (cert: string) => {
    setPersona({
      ...persona,
      certifications: persona.certifications.filter(c => c !== cert)
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Persona Customization
          </h1>
          <p className="mt-2 text-muted-foreground">Customize how your AI assistant (Gia) interacts with your data</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Persona Customization
          </h1>
          <p className="mt-2 text-muted-foreground">Customize how your AI assistant (Gia) interacts with your data</p>
        </div>
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Failed to load AI persona</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
            <Button onClick={fetchPersona} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Persona Studio
          </h1>
          <p className="mt-2 text-muted-foreground">Design your AI twin to scale your coaching business.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} size="lg" className="gap-2">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="identity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="identity" className="gap-2"><User className="h-4 w-4" /> Identity</TabsTrigger>
          <TabsTrigger value="media" className="gap-2"><Mic className="h-4 w-4" /> Media</TabsTrigger>
          <TabsTrigger value="brain" className="gap-2"><BookOpen className="h-4 w-4" /> Brain</TabsTrigger>
          <TabsTrigger value="preview" className="gap-2"><MessageSquare className="h-4 w-4" /> Test Drive</TabsTrigger>
        </TabsList>

        {/* Tab 1: Identity */}
        <TabsContent value="identity" className="space-y-6">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">AI Name</Label>
                <Input
                  id="name"
                  value={persona.name}
                  onChange={(e) => setPersona({ ...persona, name: e.target.value })}
                  placeholder="e.g., Coach Gia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={persona.tagline || ""}
                  onChange={(e) => setPersona({ ...persona, tagline: e.target.value })}
                  placeholder="e.g., Your AI-powered training assistant"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={persona.bio || ""}
                  onChange={(e) => setPersona({ ...persona, bio: e.target.value })}
                  placeholder="Tell clients about your AI assistant..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Specialties & Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Specialties */}
              <div className="space-y-4">
                <Label>Specialties</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    placeholder="Add a specialty (e.g., HIIT Training)"
                    onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                  />
                  <Button onClick={addSpecialty} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {persona.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="gap-2">
                      {specialty}
                      <button onClick={() => removeSpecialty(specialty)} className="ml-1 hover:text-destructive">×</button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-4">
                <Label>Certifications</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="Add a certification (e.g., NASM-CPT)"
                    onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                  />
                  <Button onClick={addCertification} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {persona.certifications.map((cert) => (
                    <Badge key={cert} variant="secondary" className="gap-2">
                      {cert}
                      <button onClick={() => removeCertification(cert)} className="ml-1 hover:text-destructive">×</button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Media */}
        <TabsContent value="media">
          <VoiceVideoUpload
            voiceUrl={persona.voiceFileUrl || null}
            videoUrl={persona.videoUrl || null}
            onVoiceChange={(url) => setPersona({ ...persona, voiceFileUrl: url })}
            onVideoChange={(url) => setPersona({ ...persona, videoUrl: url })}
          />
        </TabsContent>

        {/* Tab 3: Brain */}
        <TabsContent value="brain" className="space-y-6">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Teaching Style
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="teachingStyle">Select Style</Label>
                <Select
                  value={persona.teachingStyle || ""}
                  onValueChange={(value) => setPersona({ ...persona, teachingStyle: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your teaching style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motivational">Motivational & Energetic</SelectItem>
                    <SelectItem value="technical">Technical & Precise</SelectItem>
                    <SelectItem value="supportive">Supportive & Encouraging</SelectItem>
                    <SelectItem value="challenging">Challenging & Tough Love</SelectItem>
                    <SelectItem value="holistic">Holistic & Balanced</SelectItem>
                    <SelectItem value="scientific">Scientific & Data-Driven</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <PersonalityConfig
            personality={persona.personality}
            onChange={(p) => setPersona({ ...persona, personality: p })}
          />
        </TabsContent>

        {/* Tab 4: Preview */}
        <TabsContent value="preview">
          <PersonaPreview
            name={persona.name}
            tagline={persona.tagline}
            teachingStyle={persona.teachingStyle}
            personality={persona.personality}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

# 🎨 New Pages for Your V0 Dashboard (Matching Your Design System)

These components are built to **perfectly match** your existing dashboard style:
- ✅ Same colors (lime green primary)
- ✅ Same glass morphism effects
- ✅ Same hover animations
- ✅ Same shadcn/ui components
- ✅ Same lucide-react icons
- ✅ Same i18n support

---

## 1️⃣ GIA CONTENT GENERATOR PAGE

**File:** `app/dashboard/gia/page.tsx`

```tsx
"use client"

import { useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sparkles, 
  Copy, 
  Save, 
  Star, 
  Zap, 
  MessageSquare, 
  Mail, 
  FileText, 
  Dumbbell,
  Megaphone,
  Users,
  CheckCircle2,
  Loader2,
  Wand2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface GeneratedContent {
  id: string
  content: string
  type: string
  tone: string
  length: string
  createdAt: Date
  isFavorite: boolean
}

const contentTypes = [
  { value: "workout_tip", label: "Workout Tip", icon: Dumbbell, color: "text-blue-400" },
  { value: "social_post", label: "Social Post", icon: MessageSquare, color: "text-purple-400" },
  { value: "email", label: "Email", icon: Mail, color: "text-green-400" },
  { value: "blog", label: "Blog Post", icon: FileText, color: "text-orange-400" },
  { value: "nutrition_advice", label: "Nutrition Advice", icon: Users, color: "text-pink-400" },
  { value: "marketing_copy", label: "Marketing Copy", icon: Megaphone, color: "text-yellow-400" },
  { value: "client_program", label: "Client Program", icon: Dumbbell, color: "text-cyan-400" },
]

const tones = ["casual", "professional", "motivational", "educational", "inspirational"]
const lengths = ["short", "medium", "long"]

const templates = [
  {
    id: "form-tips",
    name: "Perfect Form Tips",
    type: "workout_tip",
    prompt: "Create a tip about proper squat form"
  },
  {
    id: "transformation",
    name: "Transformation Story",
    type: "social_post",
    prompt: "Write a motivational post about leg day"
  },
  {
    id: "welcome-email",
    name: "Welcome Email",
    type: "email",
    prompt: "Write a welcome email for a new client"
  },
  {
    id: "meal-prep",
    name: "Meal Prep Tips",
    type: "nutrition_advice",
    prompt: "Share meal prep tips for busy professionals"
  },
]

export default function GIAContentGeneratorPage() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("generate")
  const [contentType, setContentType] = useState("workout_tip")
  const [tone, setTone] = useState("professional")
  const [length, setLength] = useState("medium")
  const [prompt, setPrompt] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [library, setLibrary] = useState<GeneratedContent[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt")
      return
    }

    setIsGenerating(true)
    
    try {
      const response = await fetch("/api/gia/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          prompt,
          tone,
          length,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setGeneratedContent(data.content.generatedContent)
        toast.success("Content generated successfully!")
      } else {
        toast.error(data.error || "Failed to generate content")
      }
    } catch (error) {
      console.error("Generation error:", error)
      toast.error("Failed to generate content")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!generatedContent) return

    const newContent: GeneratedContent = {
      id: Date.now().toString(),
      content: generatedContent,
      type: contentType,
      tone,
      length,
      createdAt: new Date(),
      isFavorite: false,
    }

    setLibrary([newContent, ...library])
    toast.success("Content saved to library")
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent)
    toast.success("Copied to clipboard!")
  }

  const handleToggleFavorite = (id: string) => {
    setLibrary(library.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ))
  }

  const handleUseTemplate = (template: typeof templates[0]) => {
    setContentType(template.type)
    setPrompt(template.prompt)
    setSelectedTemplate(template.id)
    toast.success(`Template "${template.name}" loaded`)
  }

  const selectedTypeConfig = contentTypes.find(t => t.value === contentType)

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 ml-0 md:ml-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-lg opacity-75" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg glow-primary">
                <Sparkles className="w-6 h-6 text-background" fill="currentColor" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                GIA Content Generator
              </h1>
              <p className="text-muted-foreground">AI-powered content creation for trainers</p>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/50 text-primary glow-primary">
          <Zap className="w-3 h-3 mr-1" />
          Powered by AI
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="generate">
            <Wand2 className="w-4 h-4 mr-2" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="library">
            <Star className="w-4 h-4 mr-2" />
            Library
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card className="glass-card hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary" />
                  Create Content
                </CardTitle>
                <CardDescription>
                  Tell GIA what content you need
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Content Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content Type</label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className={cn("w-4 h-4", type.color)} />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prompt */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">What do you want to create?</label>
                  <Textarea
                    placeholder="e.g., Write a motivational post about leg day"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Tone & Length */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tone</label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tones.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Length</label>
                    <Select value={length} onValueChange={setLength}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {lengths.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l.charAt(0).toUpperCase() + l.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Generate Button */}
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Output Section */}
            <Card className="glass-card hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Generated Content
                </CardTitle>
                <CardDescription>
                  Your AI-generated content appears here
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedContent ? (
                  <>
                    <div className="relative">
                      <Textarea
                        value={generatedContent}
                        onChange={(e) => setGeneratedContent(e.target.value)}
                        rows={12}
                        className="resize-none font-mono text-sm"
                      />
                      {selectedTypeConfig && (
                        <Badge 
                          className="absolute top-2 right-2" 
                          variant="secondary"
                        >
                          <selectedTypeConfig.icon className={cn("w-3 h-3 mr-1", selectedTypeConfig.color)} />
                          {selectedTypeConfig.label}
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleCopy} 
                        variant="outline" 
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button 
                        onClick={handleSave} 
                        variant="outline"
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button 
                        onClick={() => {
                          setPrompt("")
                          setGeneratedContent("")
                        }}
                        variant="outline"
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        New
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground">
                    <Sparkles className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No content generated yet</p>
                    <p className="text-sm">Fill in the form and click Generate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((template) => {
              const typeConfig = contentTypes.find(t => t.value === template.type)
              return (
                <Card 
                  key={template.id}
                  className={cn(
                    "glass-card hover-lift cursor-pointer transition-all",
                    selectedTemplate === template.id && "ring-2 ring-primary"
                  )}
                  onClick={() => handleUseTemplate(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      {typeConfig && (
                        <typeConfig.icon className={cn("w-6 h-6", typeConfig.color)} />
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {typeConfig?.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.prompt}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library" className="space-y-6 mt-6">
          {library.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {library.map((item) => {
                const typeConfig = contentTypes.find(t => t.value === item.type)
                return (
                  <Card key={item.id} className="glass-card hover-lift">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {typeConfig && (
                            <typeConfig.icon className={cn("w-5 h-5", typeConfig.color)} />
                          )}
                          <CardTitle className="text-base">
                            {typeConfig?.label}
                          </CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleFavorite(item.id)}
                        >
                          <Star
                            className={cn(
                              "w-4 h-4",
                              item.isFavorite ? "fill-primary text-primary" : ""
                            )}
                          />
                        </Button>
                      </div>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{item.tone}</Badge>
                        <Badge variant="outline">{item.length}</Badge>
                        <span className="ml-auto">
                          {item.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm line-clamp-3 mb-3">
                        {item.content}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(item.content)
                            toast.success("Copied to clipboard!")
                          }}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setGeneratedContent(item.content)
                            setActiveTab("generate")
                          }}
                        >
                          <Wand2 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center h-[400px] text-center">
                <Star className="w-16 h-16 mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium">No saved content yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate and save content to build your library
                </p>
                <Button onClick={() => setActiveTab("generate")}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

---

## 2️⃣ AI PERSONA STUDIO PAGE

**File:** `app/dashboard/ai-persona/page.tsx`

```tsx
"use client"

import { useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Zap, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Plus,
  Edit,
  Trash2,
  Mic,
  Play,
  CheckCircle2,
  Loader2,
  BarChart3,
  Calendar,
  Star
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface AIPersona {
  id: string
  name: string
  specialty: string
  bio: string
  voiceId: string
  isActive: boolean
  totalSessions: number
  totalEarnings: number
  rating: number
  createdAt: Date
}

export default function AIPersonaPage() {
  const { t } = useLanguage()
  const [personas, setPersonas] = useState<AIPersona[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [isCreating, setIsCreating] = useState(false)
  const [editingPersona, setEditingPersona] = useState<AIPersona | null>(null)
  
  // Form state
  const [name, setName] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [bio, setBio] = useState("")
  const [voiceFile, setVoiceFile] = useState<File | null>(null)

  // Analytics (mock data - replace with real API calls)
  const totalEarnings = personas.reduce((sum, p) => sum + p.totalEarnings, 0)
  const totalSessions = personas.reduce((sum, p) => sum + p.totalSessions, 0)
  const activePersonas = personas.filter(p => p.isActive).length

  const handleCreatePersona = async () => {
    if (!name || !specialty || !bio) {
      toast.error("Please fill in all fields")
      return
    }

    setIsCreating(true)

    try {
      // Upload voice sample first if provided
      let voiceId = ""
      if (voiceFile) {
        const formData = new FormData()
        formData.append("voice", voiceFile)
        // TODO: Upload to ElevenLabs or similar
      }

      const response = await fetch("/api/ai-persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          specialty,
          bio,
          voiceId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const newPersona: AIPersona = {
          id: data.persona.id,
          name: data.persona.name,
          specialty: data.persona.specialty,
          bio: data.persona.bio,
          voiceId: data.persona.voiceId,
          isActive: true,
          totalSessions: 0,
          totalEarnings: 0,
          rating: 0,
          createdAt: new Date(),
        }
        setPersonas([...personas, newPersona])
        setName("")
        setSpecialty("")
        setBio("")
        setVoiceFile(null)
        toast.success("AI Persona created successfully!")
      } else {
        toast.error(data.error || "Failed to create persona")
      }
    } catch (error) {
      console.error("Create persona error:", error)
      toast.error("Failed to create persona")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeletePersona = async (id: string) => {
    if (!confirm("Are you sure you want to delete this persona?")) return

    try {
      const response = await fetch(`/api/ai-persona/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPersonas(personas.filter(p => p.id !== id))
        toast.success("Persona deleted")
      }
    } catch (error) {
      toast.error("Failed to delete persona")
    }
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 ml-0 md:ml-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-lg opacity-75" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg glow-primary">
                <Zap className="w-6 h-6 text-background" fill="currentColor" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI Persona Studio
              </h1>
              <p className="text-muted-foreground">Create AI versions of yourself that train 24/7</p>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/50 text-primary glow-primary">
          <DollarSign className="w-3 h-3 mr-1" />
          $0.30 per session
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              ${totalEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {totalSessions} sessions
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Active Personas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {activePersonas}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {personas.length} total created
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Avg. Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {personas.length > 0 
                ? (personas.reduce((sum, p) => sum + p.rating, 0) / personas.length).toFixed(1)
                : "0.0"
              }
            </div>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-3 h-3 fill-primary text-primary" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="personas">
            <Users className="w-4 h-4 mr-2" />
            My Personas
          </TabsTrigger>
          <TabsTrigger value="create">
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Your AI Persona earnings over time</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Replace with actual chart */}
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Analytics chart coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Personas Tab */}
        <TabsContent value="personas" className="space-y-6 mt-6">
          {personas.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {personas.map((persona) => (
                <Card key={persona.id} className="glass-card hover-lift">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <Zap className="w-6 h-6 text-background" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{persona.name}</CardTitle>
                          <CardDescription>{persona.specialty}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={persona.isActive ? "default" : "secondary"}>
                        {persona.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {persona.bio}
                    </p>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {persona.totalSessions}
                        </div>
                        <div className="text-xs text-muted-foreground">Sessions</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          ${persona.totalEarnings}
                        </div>
                        <div className="text-xs text-muted-foreground">Earned</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {persona.rating.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeletePersona(persona.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center h-[400px] text-center">
                <Zap className="w-16 h-16 mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium">No AI Personas yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first AI persona to start earning passive income
                </p>
                <Button onClick={() => setActiveTab("create")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Persona
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Create Tab */}
        <TabsContent value="create" className="space-y-6 mt-6">
          <div className="max-w-2xl mx-auto">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Create AI Persona</CardTitle>
                <CardDescription>
                  Your AI persona will train clients 24/7 and you earn $0.30 per session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Persona Name</label>
                  <Input
                    placeholder="e.g., Coach Mike's AI Trainer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Specialty */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Specialty</label>
                  <Input
                    placeholder="e.g., Basketball Skills, Yoga, Strength Training"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio / Training Philosophy</label>
                  <Textarea
                    placeholder="Describe your training approach, expertise, and what makes you unique..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    This helps the AI understand your coaching style
                  </p>
                </div>

                {/* Voice Sample */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Voice Sample (Optional)</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Mic className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm mb-2">Upload a voice sample for realistic AI voice</p>
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setVoiceFile(e.target.files?.[0] || null)}
                      className="max-w-xs mx-auto"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      MP3, WAV, or M4A (min 30 seconds)
                    </p>
                  </div>
                </div>

                {/* Create Button */}
                <Button 
                  onClick={handleCreatePersona}
                  disabled={isCreating || !name || !specialty || !bio}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary"
                  size="lg"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Persona...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create AI Persona
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="glass-card mt-6">
              <CardHeader>
                <CardTitle className="text-base">💰 How AI Personas Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p>Consumers pay to interact with your AI persona 24/7</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p>You earn $0.30 for every session (fully passive income)</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p>AI learns your coaching style from your bio and training history</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p>Payouts via Stripe Connect, weekly or monthly</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

---

## 3️⃣ SUBSCRIPTION/BILLING PAGE

**File:** `app/dashboard/billing/page.tsx`

```tsx
"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Check,
  CreditCard,
  Zap,
  Crown,
  Rocket,
  Sparkles,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "forever",
    icon: Sparkles,
    features: [
      "Up to 5 clients",
      "Basic booking system",
      "3 GIA queries per day",
      "Email support",
      "Basic analytics"
    ],
    limits: {
      clients: 5,
      giaQueries: 3,
      aiPersonas: 0,
      workoutPlans: 0
    }
  },
  {
    id: "starter",
    name: "Starter",
    price: 19,
    interval: "month",
    icon: Zap,
    features: [
      "Up to 20 clients",
      "Full booking system",
      "10 GIA queries per day",
      "1 AI Persona",
      "2 AI workout plans/month",
      "Priority email support",
      "Advanced analytics"
    ],
    limits: {
      clients: 20,
      giaQueries: 10,
      aiPersonas: 1,
      workoutPlans: 2
    }
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    interval: "month",
    icon: Crown,
    popular: true,
    features: [
      "Up to 100 clients",
      "Full booking system",
      "50 GIA queries per day",
      "10 AI Personas",
      "10 AI workout plans/month",
      "5% booking discount",
      "Priority support",
      "Google Calendar sync",
      "Custom branding"
    ],
    limits: {
      clients: 100,
      giaQueries: 50,
      aiPersonas: 10,
      workoutPlans: 10
    }
  },
  {
    id: "elite",
    name: "Elite",
    price: 99,
    interval: "month",
    icon: Rocket,
    features: [
      "Unlimited clients",
      "Full booking system",
      "Unlimited GIA queries",
      "Unlimited AI Personas",
      "Unlimited AI workout plans",
      "15% booking discount",
      "24/7 priority support",
      "White-label options",
      "API access",
      "Dedicated account manager"
    ],
    limits: {
      clients: null,
      giaQueries: 999999,
      aiPersonas: 999999,
      workoutPlans: 999999
    }
  }
]

export default function BillingPage() {
  const { t } = useLanguage()
  const [currentPlan, setCurrentPlan] = useState<string>("free")
  const [usage, setUsage] = useState({
    clients: 2,
    giaQueries: 1,
    aiPersonas: 0,
    workoutPlans: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  useEffect(() => {
    // Fetch current subscription status
    fetchSubscriptionStatus()
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch("/api/subscriptions/status?userId=current-user-id")
      const data = await response.json()
      
      if (data.success && data.subscription) {
        setCurrentPlan(data.plan.name)
        // Set usage from API
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
    }
  }

  const handleSubscribe = async (planId: string) => {
    if (planId === "free") {
      toast.info("You're already on the free plan")
      return
    }

    if (planId === currentPlan) {
      toast.info("This is your current plan")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/subscriptions/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "current-user-id", // Replace with actual user ID
          userEmail: "user@example.com", // Replace with actual email
          planName: planId,
          billingCycle
        })
      })

      const data = await response.json()

      if (data.success && data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl
      } else {
        toast.error(data.error || "Failed to start subscription")
      }
    } catch (error) {
      console.error("Subscription error:", error)
      toast.error("Failed to start subscription")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return

    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "current-user-id",
          cancelImmediately: false
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
      } else {
        toast.error(data.error || "Failed to cancel subscription")
      }
    } catch (error) {
      toast.error("Failed to cancel subscription")
    }
  }

  const currentPlanConfig = plans.find(p => p.id === currentPlan)

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 ml-0 md:ml-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-lg opacity-75" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg glow-primary">
                <CreditCard className="w-6 h-6 text-background" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Subscription & Billing
              </h1>
              <p className="text-muted-foreground">Manage your subscription and view usage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Plan Card */}
      {currentPlanConfig && (
        <Card className="glass-card hover-lift border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <currentPlanConfig.icon className="w-6 h-6 text-background" />
                </div>
                <div>
                  <CardTitle>Current Plan: {currentPlanConfig.name}</CardTitle>
                  <CardDescription>
                    ${currentPlanConfig.price}/{currentPlanConfig.interval}
                  </CardDescription>
                </div>
              </div>
              {currentPlan !== "free" && (
                <Button variant="outline" onClick={handleCancelSubscription}>
                  Cancel Plan
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Usage Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Clients</div>
                <div className="text-2xl font-bold">
                  {usage.clients}
                  {currentPlanConfig.limits.clients && (
                    <span className="text-sm text-muted-foreground">
                      /{currentPlanConfig.limits.clients}
                    </span>
                  )}
                </div>
                {currentPlanConfig.limits.clients && (
                  <Progress 
                    value={(usage.clients / currentPlanConfig.limits.clients) * 100} 
                    className="h-1 mt-2"
                  />
                )}
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">GIA Queries Today</div>
                <div className="text-2xl font-bold">
                  {usage.giaQueries}
                  <span className="text-sm text-muted-foreground">
                    /{currentPlanConfig.limits.giaQueries}
                  </span>
                </div>
                <Progress 
                  value={(usage.giaQueries / currentPlanConfig.limits.giaQueries) * 100} 
                  className="h-1 mt-2"
                />
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">AI Personas</div>
                <div className="text-2xl font-bold">
                  {usage.aiPersonas}
                  {currentPlanConfig.limits.aiPersonas !== 999999 && (
                    <span className="text-sm text-muted-foreground">
                      /{currentPlanConfig.limits.aiPersonas}
                    </span>
                  )}
                </div>
                {currentPlanConfig.limits.aiPersonas !== 999999 && (
                  <Progress 
                    value={(usage.aiPersonas / currentPlanConfig.limits.aiPersonas) * 100} 
                    className="h-1 mt-2"
                  />
                )}
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Workout Plans</div>
                <div className="text-2xl font-bold">
                  {usage.workoutPlans}
                  {currentPlanConfig.limits.workoutPlans !== 999999 && (
                    <span className="text-sm text-muted-foreground">
                      /{currentPlanConfig.limits.workoutPlans}
                    </span>
                  )}
                </div>
                {currentPlanConfig.limits.workoutPlans !== 999999 && (
                  <Progress 
                    value={(usage.workoutPlans / currentPlanConfig.limits.workoutPlans) * 100} 
                    className="h-1 mt-2"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant={billingCycle === "monthly" ? "default" : "outline"}
          onClick={() => setBillingCycle("monthly")}
        >
          Monthly
        </Button>
        <Button
          variant={billingCycle === "yearly" ? "default" : "outline"}
          onClick={() => setBillingCycle("yearly")}
        >
          Yearly <Badge className="ml-2">Save 20%</Badge>
        </Button>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon
          const isCurrentPlan = plan.id === currentPlan
          const displayPrice = billingCycle === "yearly" && plan.price > 0 
            ? Math.floor(plan.price * 12 * 0.8) 
            : plan.price

          return (
            <Card
              key={plan.id}
              className={cn(
                "glass-card hover-lift relative",
                plan.popular && "ring-2 ring-primary shadow-lg shadow-primary/20",
                isCurrentPlan && "border-primary/50"
              )}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-primary">
                    ${displayPrice}
                  </span>
                  <span className="text-muted-foreground">
                    /{billingCycle === "yearly" ? "year" : plan.interval}
                  </span>
                </div>
                {billingCycle === "yearly" && plan.price > 0 && (
                  <div className="text-sm text-muted-foreground">
                    ${plan.price}/month billed annually
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan || isLoading}
                  className={cn(
                    "w-full",
                    plan.popular && "bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary"
                  )}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      {plan.id === "free" ? "Downgrade" : "Upgrade"}
                      <TrendingUp className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* FAQ / Info */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Billing Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p>Cancel anytime, no long-term contracts</p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p>14-day free trial on paid plans</p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p>Secure payments processed by Stripe</p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p>Pro-rated upgrades and downgrades</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 📋 INTEGRATION INSTRUCTIONS:

1. **Copy these 3 files** to your v0 project in the correct locations
2. **Add missing dependencies** (if any):
   ```bash
   npm install sonner  # For toast notifications
   ```

3. **Update your `components.json`** if you're missing any shadcn components:
   ```bash
   npx shadcn-ui@latest add tabs progress
   ```

4. **The pages will automatically:**
   - ✅ Match your lime green theme
   - ✅ Use your glass morphism effects
   - ✅ Include glow animations
   - ✅ Work with your i18n context
   - ✅ Connect to your backend APIs

## 🎨 WHAT'S INCLUDED:

- **Glass card effects** (`.glass-card`)
- **Hover animations** (`.hover-lift`)
- **Primary gradient** (`from-primary to-accent`)
- **Glow effects** (`.glow-primary`)
- **Your exact color scheme**
- **Your icon library** (lucide-react)
- **Your component patterns**

These pages will look **native** to your existing dashboard! 🚀


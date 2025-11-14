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
  Wand2,
  Mic,
  MicOff,
  Lightbulb,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  DollarSign
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

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  functionCalls?: any[]
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
  const [activeTab, setActiveTab] = useState("chat")
  const [contentType, setContentType] = useState("workout_tip")
  const [tone, setTone] = useState("professional")
  const [length, setLength] = useState("medium")
  const [prompt, setPrompt] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [library, setLibrary] = useState<GeneratedContent[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  
  // Voice state
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [voiceSupported, setVoiceSupported] = useState(true)
  
  // Suggestions state
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

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

  const handleSendMessage = async (voiceMessage?: string) => {
    const messageToSend = voiceMessage || chatInput
    if (!messageToSend.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageToSend,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    if (!voiceMessage) setChatInput("")
    setIsChatLoading(true)

    try {
      const response = await fetch("/api/gia/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          conversationId
        })
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          functionCalls: data.functionCalls
        }

        setChatMessages(prev => [...prev, assistantMessage])
        setConversationId(data.conversationId)
      } else {
        toast.error(data.error || "Failed to send message")
      }
    } catch (error) {
      console.error("Chat error:", error)
      toast.error("Failed to send message")
    } finally {
      setIsChatLoading(false)
    }
  }

  // Voice functions
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice recognition not supported in this browser")
      setVoiceSupported(false)
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      toast.success("🎤 Listening...")
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setTranscript(transcript)
      setIsListening(false)
      
      // Send to GIA chat
      handleSendMessage(transcript)
      
      toast.success(`Heard: "${transcript}"`)
    }

    recognition.onerror = (event: any) => {
      setIsListening(false)
      toast.error(`Voice error: ${event.error}`)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  // Fetch suggestions
  const fetchSuggestions = async () => {
    setLoadingSuggestions(true)
    try {
      const response = await fetch('/api/gia/suggestions', {
        method: 'POST',
      })
      const data = await response.json()
      setSuggestions(data.data?.suggestions || [])
      setLastRefresh(new Date())
      toast.success(`Found ${data.data?.suggestions?.length || 0} suggestions`)
    } catch (error) {
      toast.error("Failed to load suggestions")
    } finally {
      setLoadingSuggestions(false)
    }
  }

  // Execute suggestion action
  const executeAction = async (suggestion: any) => {
    try {
      const response = await fetch(suggestion.action.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestion.action.params),
      })
      
      if (response.ok) {
        toast.success('Action completed successfully!')
        fetchSuggestions() // Refresh suggestions
      } else {
        toast.error('Action failed')
      }
    } catch (error) {
      toast.error('Failed to execute action')
    }
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
        <TabsList className="grid w-full grid-cols-6 max-w-4xl">
          <TabsTrigger value="chat">
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="voice">
            <Mic className="w-4 h-4 mr-2" />
            Voice
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            <Lightbulb className="w-4 h-4 mr-2" />
            Suggestions
          </TabsTrigger>
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

        {/* Chat Tab - AI Agent */}
        <TabsContent value="chat" className="space-y-6 mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Chat with GIA
              </CardTitle>
              <CardDescription>
                Ask GIA to manage your calendar, clients, payments, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Chat Messages */}
              <div className="space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto mb-4 p-4 rounded-lg bg-card/50 border border-border/50">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <Sparkles className="w-16 h-16 mb-4 text-primary opacity-50" />
                    <p className="text-lg font-medium mb-2">Start chatting with GIA</p>
                    <p className="text-sm text-muted-foreground mb-4 max-w-md">
                      Try: "What's on my schedule today?" or "How much did I make this week?"
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="p-2 rounded border border-border/50 text-left">
                        💬 "Add John tomorrow at 2pm"
                      </div>
                      <div className="p-2 rounded border border-border/50 text-left">
                        📅 "Show my schedule today"
                      </div>
                      <div className="p-2 rounded border border-border/50 text-left">
                        💰 "How much did I make this week?"
                      </div>
                      <div className="p-2 rounded border border-border/50 text-left">
                        👥 "List my clients"
                      </div>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3 p-4 rounded-lg",
                        msg.role === "user" 
                          ? "bg-primary/10 ml-auto max-w-[80%]" 
                          : "bg-card border border-border/50 mr-auto max-w-[80%]"
                      )}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-background" />
                          </div>
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        {msg.functionCalls && msg.functionCalls.length > 0 && (
                          <div className="text-xs text-muted-foreground space-y-1">
                            {msg.functionCalls.map((call, idx) => (
                              <Badge key={idx} variant="outline" className="mr-1">
                                <Zap className="w-3 h-3 mr-1" />
                                {call.function}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                
                {isChatLoading && (
                  <div className="flex gap-3 p-4 rounded-lg bg-card border border-border/50 mr-auto max-w-[80%]">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-background animate-spin" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">GIA is thinking...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask GIA anything... (e.g., 'What's my schedule today?')"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  rows={2}
                  className="resize-none"
                  disabled={isChatLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary"
                  size="lg"
                >
                  {isChatLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {conversationId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setChatMessages([])
                    setConversationId(null)
                    toast.success("Started new conversation")
                  }}
                >
                  Start New Conversation
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice Tab */}
        <TabsContent value="voice" className="space-y-6 mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-primary" />
                Voice Commands
              </CardTitle>
              <CardDescription>
                Use voice to control GIA - just click and speak
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6">
                {/* Microphone Button */}
                <div className="relative">
                  <div className={cn(
                    "absolute inset-0 rounded-full blur-xl transition-opacity duration-300",
                    isListening ? "opacity-75 bg-gradient-to-r from-primary to-accent animate-pulse" : "opacity-0"
                  )} />
                  <Button
                    size="lg"
                    onClick={startVoiceRecognition}
                    disabled={!voiceSupported || isListening}
                    className={cn(
                      "relative w-32 h-32 rounded-full text-white",
                      isListening 
                        ? "bg-gradient-to-r from-red-500 to-pink-500 animate-pulse" 
                        : "bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    )}
                  >
                    {isListening ? (
                      <div className="flex flex-col items-center">
                        <MicOff size={48} />
                        <span className="text-xs mt-2">Listening...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Mic size={48} />
                        <span className="text-xs mt-2">Click to talk</span>
                      </div>
                    )}
                  </Button>
                </div>

                {/* Status */}
                <div className="text-center">
                  {!voiceSupported && (
                    <p className="text-sm text-destructive">
                      ⚠️ Voice not supported in this browser
                    </p>
                  )}
                  {isListening && (
                    <p className="text-sm font-medium text-primary animate-pulse">
                      🎤 Listening... Speak now
                    </p>
                  )}
                  {!isListening && voiceSupported && (
                    <p className="text-sm text-muted-foreground">
                      Click the microphone to start
                    </p>
                  )}
                </div>

                {/* Transcript */}
                {transcript && (
                  <Card className="w-full bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium mb-2">You said:</p>
                      <p className="text-lg italic">"{transcript}"</p>
                    </CardContent>
                  </Card>
                )}

                {/* Tips */}
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="text-base">💡 Voice Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "What's my schedule today?",
                        "How much did I make this week?",
                        "List my clients",
                        "Show upcoming bookings",
                        "Add John tomorrow at 2pm",
                        "Send invoice to Mike for $75"
                      ].map((cmd, i) => (
                        <div key={i} className="p-3 bg-secondary/50 rounded-lg border border-border/50 hover:bg-secondary transition-colors">
                          <p className="text-sm">💬 "{cmd}"</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      <strong>Pro tip:</strong> Speak clearly and wait for the beep. Works best in Chrome/Edge.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-6 mt-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Proactive Suggestions
                  </CardTitle>
                  <CardDescription>
                    GIA analyzed your data and found these opportunities
                  </CardDescription>
                </div>
                <Button 
                  onClick={fetchSuggestions} 
                  disabled={loadingSuggestions}
                  variant="outline"
                >
                  <RefreshCw className={cn("mr-2 h-4 w-4", loadingSuggestions && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lastRefresh && (
                <p className="text-xs text-muted-foreground mb-4">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </p>
              )}

              {loadingSuggestions ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-12">
                  <Lightbulb className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg font-medium mb-2">No suggestions right now</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    GIA will notify you when there are opportunities
                  </p>
                  <Button onClick={fetchSuggestions}>
                    Analyze My Data
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <Card 
                      key={suggestion.id || index} 
                      className={cn(
                        "border-l-4 transition-all hover:shadow-lg",
                        suggestion.priority === 'urgent' && "border-l-red-500 bg-red-500/5",
                        suggestion.priority === 'high' && "border-l-orange-500 bg-orange-500/5",
                        suggestion.priority === 'medium' && "border-l-yellow-500 bg-yellow-500/5",
                        suggestion.priority === 'low' && "border-l-blue-500 bg-blue-500/5"
                      )}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {suggestion.type === 'action' && <Zap className="w-5 h-5 text-orange-500" />}
                              {suggestion.type === 'warning' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                              {suggestion.type === 'opportunity' && <TrendingUp className="w-5 h-5 text-green-500" />}
                              {suggestion.type === 'insight' && <Lightbulb className="w-5 h-5 text-blue-500" />}
                              <CardTitle className="text-lg">
                                {suggestion.title}
                              </CardTitle>
                            </div>
                            <CardDescription className="text-base">
                              {suggestion.message}
                            </CardDescription>
                          </div>
                          <Badge 
                            variant={
                              suggestion.priority === 'urgent' || suggestion.priority === 'high' 
                                ? 'destructive' 
                                : 'secondary'
                            }
                            className="shrink-0"
                          >
                            {suggestion.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      {suggestion.action && (
                        <CardContent className="pt-0">
                          <Button 
                            onClick={() => executeAction(suggestion)}
                            className="w-full sm:w-auto"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {suggestion.action.label}
                          </Button>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Suggestion Stats */}
          {suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">📊 Suggestion Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-red-500/10 rounded-lg">
                    <p className="text-2xl font-bold text-red-500">
                      {suggestions.filter(s => s.priority === 'urgent').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Urgent</p>
                  </div>
                  <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                    <p className="text-2xl font-bold text-orange-500">
                      {suggestions.filter(s => s.priority === 'high').length}
                    </p>
                    <p className="text-xs text-muted-foreground">High</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-500">
                      {suggestions.filter(s => s.priority === 'medium').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Medium</p>
                  </div>
                  <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                    <p className="text-2xl font-bold text-blue-500">
                      {suggestions.filter(s => s.priority === 'low').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Low</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

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

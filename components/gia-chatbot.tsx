"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sparkles, X, Send, Minimize2, Users, Calendar, Dumbbell, TrendingUp, MessageCircle, Zap } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface Message {
  role: "user" | "assistant"
  content: string
}

const quickActions = [
  { icon: Calendar, label: "Create session plan", prompt: "Help me create a session plan for a beginner" },
  { icon: Users, label: "Client management tips", prompt: "Give me tips for managing clients better" },
  { icon: TrendingUp, label: "Grow my business", prompt: "How can I grow my sports coaching business?" },
  { icon: MessageCircle, label: "Marketing ideas", prompt: "Give me marketing content ideas for social media" },
]

const integrations = [
  { name: "Your Dashboard", icon: "📊" },
  { name: "Client Manager", icon: "👥" },
  { name: "Calendar", icon: "📅" },
  { name: "Session Planner", icon: "🎯" },
  { name: "Marketing Tools", icon: "📱" },
]

export function GiaChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Gia, your AI assistant for sports & wellness professionals. 🎾⚽🏀\n\nI can help you with:\n• Creating custom session plans\n• Managing clients & schedules\n• Growing your business\n• Marketing content ideas\n• Coaching tips & best practices\n\nWhat would you like help with today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleQuickAction = (prompt: string) => {
    setShowSuggestions(false)
    setInput(prompt)
    handleSendMessage(prompt)
  }

  const handleSendMessage = async (message?: string) => {
    const userMessage = message || input.trim()
    if (!userMessage || isLoading) return

    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)
    setShowSuggestions(false)

    try {
      const response = await fetch("/api/gia/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ])
      } else {
        // Show the actual error message from the API (helpful for debugging)
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.message || data.error || "Sorry, I encountered an error. Please try again.",
          },
        ])
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-primary via-accent to-primary hover:shadow-primary/50 transition-all z-50 p-0"
        aria-label="Open Gia chat"
      >
        <Sparkles className="h-6 w-6 text-black" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[400px] h-[600px] shadow-2xl z-50 flex flex-col glass border-primary/20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary via-accent to-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-black" />
          </div>
          <div>
            <h3 className="font-bold text-white">Gia</h3>
            <p className="text-xs text-muted-foreground">AI Sports & Wellness Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-black"
                        : "bg-secondary/50 text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {/* Quick Actions - Show on first open */}
              {showSuggestions && messages.length === 1 && (
                <div className="space-y-3 mt-4">
                  <p className="text-xs text-muted-foreground font-semibold">Quick Actions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction(action.prompt)}
                        className="h-auto py-3 flex flex-col items-start gap-1 bg-secondary/30 hover:bg-secondary/50 border-border/50"
                      >
                        <action.icon className="h-4 w-4 text-primary" />
                        <span className="text-xs text-left">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                  
                  {/* Integrations Display */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground font-semibold mb-2">Integrated with:</p>
                    <div className="flex flex-wrap gap-2">
                      {integrations.map((int, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-secondary/30 text-xs">
                          <span className="mr-1">{int.icon}</span>
                          {int.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary/50 rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-100" />
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border/50">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Gia anything..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4 text-black" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Powered by Google Gemini
            </p>
          </div>
        </>
      )}
    </Card>
  )
}



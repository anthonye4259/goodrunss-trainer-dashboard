"use client"

import { useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Sparkles,
  X,
  Send,
  Minimize2,
  MessageCircle,
  Loader2,
  UserPlus,
  CalendarPlus,
  TrendingUp,
  CheckCircle2,
  Mic
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from 'react-markdown'

const quickActions = [
  {
    icon: CalendarPlus,
    label: "Create session plan",
    prompt: "Create a detailed 60-minute training session plan for an intermediate athlete",
    color: "text-blue-400"
  },
  {
    icon: UserPlus,
    label: "Client onboarding",
    prompt: "What should I include in my client onboarding process?",
    color: "text-green-400"
  },
  {
    icon: TrendingUp,
    label: "Grow my business",
    prompt: "Give me 5 actionable strategies to grow my sports coaching business this month",
    color: "text-purple-400"
  },
  {
    icon: MessageCircle,
    label: "Social media content",
    prompt: "Create 3 engaging social media posts for this week",
    color: "text-pink-400"
  },
]

export function GiaChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [position, setPosition] = useState({ x: 0, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, append } = useChat({
    api: '/api/gia/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: "👋 **Hey there!** I'm Gia, your AI Business Partner.\n\nI can help you:\n• ✨ Create custom session plans\n• 👥 Manage clients & schedules\n• 📈 Grow your business\n• 📱 Generate marketing content\n• 🎯 Optimize your coaching\n\n**What would you like to work on today?**",
      },
    ],
    onResponse: () => {
      setShowSuggestions(false)
    }
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({ x: window.innerWidth - 500, y: 100 })
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (cardRef.current) {
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  const handleQuickAction = (prompt: string) => {
    setShowSuggestions(false)
    append({
      role: 'user',
      content: prompt
    })
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Pulsing indicator */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-accent to-primary blur-lg opacity-50 animate-pulse"></div>
          <Button
            onClick={() => setIsOpen(true)}
            className="relative h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-primary via-accent to-primary hover:shadow-primary/50 transition-all p-0 hover:scale-110"
            aria-label="Open Gia chat"
          >
            <Sparkles className="h-7 w-7 text-black" />
          </Button>
        </div>

        {/* Tooltip */}
        <div className="bg-black/90 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg animate-fade-in">
          💬 Ask Gia anything!
        </div>
      </div>
    )
  }

  return (
    <Card
      ref={cardRef}
      className="fixed w-[450px] h-[650px] shadow-2xl z-50 flex flex-col bg-gradient-to-b from-[#1a1f2e] to-[#0f1419] border border-primary/30 backdrop-blur-xl"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary via-accent to-primary opacity-20 blur-sm"></div>

      {/* Header - Draggable */}
      <div
        className="relative flex items-center justify-between p-4 border-b border-border/30 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 cursor-grab active:cursor-grabbing backdrop-blur-sm"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-accent to-primary blur-md opacity-70 animate-pulse"></div>
            <div className="relative h-11 w-11 rounded-full bg-gradient-to-r from-primary via-accent to-primary flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-black" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Gia</h3>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-xs text-green-400 font-medium">Online • GPT-4o</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              setIsMinimized(!isMinimized)
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="h-9 w-9 hover:bg-white/10"
          >
            <Minimize2 className="h-4 w-4 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="h-9 w-9 hover:bg-white/10"
          >
            <X className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4 bg-[#0f1419]" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index}>
                  <div
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl px-4 py-3 ${message.role === "user"
                        ? "bg-gradient-to-r from-primary via-accent to-primary text-black shadow-lg"
                        : "bg-[#1a1f2e] text-white border border-primary/20"
                        }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                              strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>,
                              ul: ({ children }) => <ul className="space-y-1 my-2">{children}</ul>,
                              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                              code: ({ children }) => <code className="bg-black/50 px-1.5 py-0.5 rounded text-primary">{children}</code>,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>

                          {/* Show tool calls if any (optional, for debugging or transparency) */}
                          {message.toolInvocations?.map((toolInvocation: any) => (
                            <div key={toolInvocation.toolCallId} className="mt-2 text-xs bg-black/30 p-2 rounded border border-white/10">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Gia is {toolInvocation.toolName.replace(/_/g, ' ')}...</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Quick Actions */}
              {showSuggestions && messages.length === 1 && (
                <div className="space-y-3 mt-4">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Suggested Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        onClick={() => handleQuickAction(action.prompt)}
                        className="h-auto py-4 flex flex-col items-start gap-2 bg-[#1a1f2e] hover:bg-[#252b3b] border-primary/20 hover:border-primary/40 transition-all group"
                      >
                        <action.icon className={`h-5 w-5 ${action.color} group-hover:scale-110 transition-transform`} />
                        <span className="text-xs text-left font-medium text-white">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading indicator (only when waiting for start of stream) */}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex justify-start">
                  <div className="bg-[#1a1f2e] border border-primary/20 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                      <span className="text-sm text-muted-foreground">Gia is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="relative p-4 border-t border-border/30 bg-[#1a1f2e]">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask Gia anything..."
                disabled={isLoading}
                className="flex-1 bg-[#0f1419] border-primary/20 focus:border-primary/50 text-white placeholder:text-muted-foreground"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="hover:bg-white/10 text-muted-foreground hover:text-white"
                onClick={() => alert("Voice mode coming soon!")}
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-gradient-to-r from-primary via-accent to-primary hover:opacity-90 transition-opacity shadow-lg"
              >
                <Send className="h-4 w-4 text-black" />
              </Button>
            </form>
            <p className="text-[10px] text-muted-foreground mt-2 text-center flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" />
              Powered by GPT-4o
            </p>
          </div>
        </>
      )}
    </Card>
  )
}

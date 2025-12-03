"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Sparkles,
  Send,
  X,
  Loader2,
  Minimize2,
  Maximize,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { GIAModeSelector, type GIAMode } from "@/components/gia-mode-selector"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function FloatingGIA() {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<GIAMode>('wellness')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Listen for openGIA events from dashboard
  useEffect(() => {
    const handleOpenGIA = (event: CustomEvent) => {
      setIsOpen(true)
      setIsMinimized(false)
      if (event.detail?.prompt) {
        setInput(event.detail.prompt)
      }
    }

    window.addEventListener('openGIA', handleOpenGIA as EventListener)
    return () => window.removeEventListener('openGIA', handleOpenGIA as EventListener)
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    const allMessages = [...messages, userMessage]
    setMessages(allMessages)
    setInput("")
    setIsLoading(true)

    // Add placeholder for assistant response
    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    }])

    try {
      const response = await fetch("/api/gia/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          mode: selectedMode,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Request failed with status ${response.status}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response body")
      }

      const decoder = new TextDecoder()
      let fullContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullContent += chunk

        // Update the assistant message with streamed content
        setMessages(prev => prev.map(m => 
          m.id === assistantId 
            ? { ...m, content: fullContent }
            : m
        ))
      }

      // If no content was received, show error
      if (!fullContent.trim()) {
        setMessages(prev => prev.map(m => 
          m.id === assistantId 
            ? { ...m, content: "I apologize, but I couldn't generate a response. Please try again." }
            : m
        ))
      }

    } catch (error: any) {
      console.error("Chat error:", error)
      
      // Remove the placeholder message on error
      setMessages(prev => prev.filter(m => m.id !== assistantId))
      
      toast({
        title: "Request failed",
        description: error.message || "GIA is temporarily unavailable. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-primary to-accent hover:scale-110 transition-all duration-300 z-50"
          size="icon"
        >
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card
          className={cn(
            "fixed shadow-2xl border-border/50 backdrop-blur-xl z-50 transition-all duration-300 flex flex-col overflow-hidden",
            isFullscreen
              ? "inset-4 w-auto h-auto"
              : isMinimized
                ? "bottom-6 right-6 w-80 h-16"
                : "bottom-6 right-6 w-96 h-[700px]",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/40 bg-gradient-to-br from-primary/10 to-accent/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-sm">GIA</h3>
                <p className="text-xs text-muted-foreground">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setIsFullscreen(!isFullscreen)
                  setIsMinimized(false)
                }}
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                <Maximize className="h-4 w-4" />
              </Button>
              {!isFullscreen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? "Expand" : "Minimize"}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Mode Selector */}
              <GIAModeSelector
                selectedMode={selectedMode}
                onModeChange={setSelectedMode}
              />

              {/* Messages */}
              <ScrollArea
                className="flex-1 p-4 min-h-0"
                ref={scrollAreaRef}
              >
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Hi! I'm GIA, your AI assistant.</p>
                      <p className="text-xs mt-1">Ask me anything about training, programming, or business.</p>
                    </div>
                  )}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2",
                        message.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      {message.role === "assistant" && (
                        <Avatar className="h-7 w-7 bg-primary/10 flex-shrink-0">
                          <AvatarFallback>
                            <Sparkles className="h-3 w-3 text-primary" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[75%] rounded-lg p-3 text-sm",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground",
                        )}
                      >
                        <div className="space-y-1 whitespace-pre-wrap">
                          {message.content || (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                        </div>
                      </div>
                      {message.role === "user" && (
                        <Avatar className="h-7 w-7 bg-primary/10 flex-shrink-0">
                          <AvatarFallback className="text-primary text-xs font-bold">
                            You
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input */}
              <CardContent className="p-3 border-t border-border/40">
                <div className="flex items-end gap-2">
                  <Textarea
                    placeholder="Ask GIA..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    rows={1}
                    className="flex-1 resize-none text-sm min-h-[32px] max-h-[80px]"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      )}
    </>
  )
}

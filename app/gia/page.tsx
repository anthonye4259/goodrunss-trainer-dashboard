"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, Sparkles, TrendingUp, Users, Calendar, DollarSign, Paperclip } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"

const suggestedPrompts = [
  "Analyze my revenue trends",
  "Which clients need follow-up?",
  "Optimize my schedule",
  "Show client retention rate",
]

const quickInsights = [
  {
    icon: TrendingUp,
    title: "Revenue Up 18%",
    description: "Your earnings increased compared to last month",
    color: "text-green-500",
    bgColor: "bg-green-500/20",
  },
  {
    icon: Users,
    title: "3 Inactive Clients",
    description: "Haven't booked in 2+ weeks - consider reaching out",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/20",
  },
  {
    icon: Calendar,
    title: "Peak Hours: 2-5 PM",
    description: "Most sessions booked during afternoon",
    color: "text-blue-500",
    bgColor: "bg-blue-500/20",
  },
  {
    icon: DollarSign,
    title: "Avg Session: $147",
    description: "Up $12 from last month",
    color: "text-primary",
    bgColor: "bg-primary/20",
  },
]

export default function GIAPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, setInput, append, isLoading } = useChat({
    api: "/api/gia/chat",
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content: "Hi! I'm GIA, your Goodrunss Intelligence Agent. I can help you analyze your training business, optimize your schedule, and provide insights about your clients and revenue. What would you like to know?",
      },
    ],
    onError: (error) => {
      console.error("Chat error:", error)
      toast.error("Failed to connect to GIA. Please try again.")
    }
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i])
    }

    // Add a user message about the upload
    await append({
      role: "user",
      content: `Uploading ${files.length} document(s) for analysis...`,
    })

    try {
      const response = await fetch("/api/gia/process-documents", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        const summary = `I've processed ${data.data.filesProcessed} document(s).
        
**Extracted Data:**
• ${data.data.extractedProfiles.length} Client Profiles
• ${data.data.extractedProgress.length} Progress Entries
• ${data.data.extractedGoals.length} Goals

I've updated your database with this information. You can now ask me questions about these clients!`

        await append({
          role: "assistant",
          content: summary,
        })
      } else {
        throw new Error(data.error || "Failed to process documents")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to process documents")
      await append({
        role: "assistant",
        content: "I encountered an error processing your documents. Please try again.",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt)
    // Optional: auto-submit
    // append({ role: 'user', content: prompt })
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-balance flex items-center gap-3">
          <Sparkles className="h-10 w-10 text-primary" />
          GIA - Goodrunss Intelligence Agent
        </h1>
        <p className="mt-2 text-muted-foreground">Your AI-powered training business assistant</p>
      </div>

      {/* Quick Insights */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickInsights.map((insight, index) => (
          <Card key={index} className="glass border-border/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${insight.bgColor}`}>
                  <insight.icon className={`h-5 w-5 ${insight.color}`} />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-sm">{insight.title}</p>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chat Interface */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Chat with GIA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="space-y-4 h-[500px] overflow-y-auto pr-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 bg-primary">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">GIA</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border/50"
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                      {/* Render tool invocations if any (though usually content is empty for tool calls, AI SDK handles text) */}
                      {message.toolInvocations?.map((toolInvocation) => {
                        const { toolName, toolCallId, state } = toolInvocation;

                        if (state === 'result') {
                          const { result } = toolInvocation;
                          return (
                            <div key={toolCallId} className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono">
                              {toolName === 'sendSMS' ? (
                                <>
                                  <div className="font-semibold text-green-600">✓ SMS Sent</div>
                                  <div>{result.message}</div>
                                </>
                              ) : (
                                <div>Tool {toolName} executed</div>
                              )}
                            </div>
                          );
                        } else {
                          return (
                            <div key={toolCallId} className="mt-2 p-2 bg-muted/50 rounded text-xs animate-pulse">
                              Calling {toolName}...
                            </div>
                          );
                        }
                      })}
                    </p>
                    <p
                      className={`text-xs mt-2 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                    >
                      {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 bg-muted">
                      <AvatarFallback className="text-xs">YOU</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 bg-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">GIA</AvatarFallback>
                  </Avatar>
                  <div className="bg-card border border-border/50 rounded-lg p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="file"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isUploading}
                title="Upload documents (PDF, Image)"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Ask GIA anything..."
                value={input}
                onChange={handleInputChange}
                className="flex-1"
                disabled={isLoading || isUploading}
              />
              <Button type="submit" disabled={!input.trim() || isLoading || isUploading} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Suggested Prompts */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Suggested Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestedPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4 bg-transparent"
                onClick={() => handleSuggestedPrompt(prompt)}
                disabled={isLoading || isUploading}
              >
                <span className="text-sm">{prompt}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Capabilities */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>What GIA Can Do</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold">Business Analytics</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Analyze revenue trends, session patterns, and growth metrics
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold">Client Insights</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Track client engagement, identify at-risk clients, and improve retention
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold">SMS Messaging</h3>
              </div>
              <p className="text-sm text-muted-foreground">Send bulk messages, reminders, and updates to your clients instantly</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

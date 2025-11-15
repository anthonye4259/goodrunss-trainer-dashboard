"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, Sparkles, TrendingUp, Users, Calendar, DollarSign } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm GIA, your Goodrunss Intelligence Agent. I can help you analyze your training business, optimize your schedule, and provide insights about your clients and revenue. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")

  const handleSendMessage = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])
    setInput("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(input),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  const getAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes("revenue") || lowerQuery.includes("earnings")) {
      return "Based on your data, your revenue has grown 18% this month to $12,800. Your top-performing sport is Basketball at $19,200 total. I recommend focusing on afternoon slots (2-5 PM) as they generate the highest revenue per session."
    }

    if (lowerQuery.includes("client") || lowerQuery.includes("follow")) {
      return "You have 3 clients who haven't booked in over 2 weeks: James Wilson, Lisa Martinez, and Tom Anderson. I suggest sending them a personalized message offering a special rate for their next session to re-engage them."
    }

    if (lowerQuery.includes("schedule") || lowerQuery.includes("optimize")) {
      return "Your schedule shows gaps on Tuesday and Thursday mornings. Based on client preferences, I recommend offering early morning slots (7-9 AM) for working professionals. This could add 4-6 sessions per week."
    }

    if (lowerQuery.includes("retention")) {
      return "Your client retention rate is 87%, which is excellent! Clients who book 2+ sessions per week have a 95% retention rate. Consider offering package deals to encourage more frequent bookings."
    }

    return "I can help you with revenue analysis, client management, schedule optimization, and business insights. Try asking about your revenue trends, inactive clients, or schedule optimization!"
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt)
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
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border/50"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 bg-muted">
                      <AvatarFallback className="text-xs">YOU</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Ask GIA anything about your training business..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
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
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold">Schedule Optimization</h3>
              </div>
              <p className="text-sm text-muted-foreground">Find optimal booking times and maximize your availability</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

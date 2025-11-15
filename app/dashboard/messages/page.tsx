"use client"

import { useState } from "react"
import { Search, Send, Phone, Video, MoreVertical, Paperclip, Smile, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  senderId: string
  content: string
  timestamp: Date
  read: boolean
}

type Conversation = {
  id: string
  clientId: string
  clientName: string
  clientAvatar: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  messages: Message[]
}

export default function MessagesPage() {
  const [conversations] = useState<Conversation[]>([
    {
      id: "1",
      clientId: "c1",
      clientName: "Sarah Johnson",
      clientAvatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Can we reschedule tomorrow's session?",
      lastMessageTime: new Date(Date.now() - 3600000),
      unreadCount: 2,
      messages: [
        {
          id: "m1",
          senderId: "c1",
          content: "Hi Coach! Hope you're doing well.",
          timestamp: new Date(Date.now() - 7200000),
          read: true,
        },
        {
          id: "m2",
          senderId: "trainer",
          content: "Hey Sarah! I'm great, thanks. How can I help you?",
          timestamp: new Date(Date.now() - 7000000),
          read: true,
        },
        {
          id: "m3",
          senderId: "c1",
          content: "Can we reschedule tomorrow's session?",
          timestamp: new Date(Date.now() - 3600000),
          read: false,
        },
        {
          id: "m4",
          senderId: "c1",
          content: "Something came up at work 😅",
          timestamp: new Date(Date.now() - 3500000),
          read: false,
        },
      ],
    },
    {
      id: "2",
      clientId: "c2",
      clientName: "Mike Chen",
      clientAvatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Thanks for the workout plan!",
      lastMessageTime: new Date(Date.now() - 10800000),
      unreadCount: 0,
      messages: [
        {
          id: "m5",
          senderId: "c2",
          content: "Just finished the workout you sent!",
          timestamp: new Date(Date.now() - 14400000),
          read: true,
        },
        {
          id: "m6",
          senderId: "trainer",
          content: "Awesome! How did it feel?",
          timestamp: new Date(Date.now() - 14000000),
          read: true,
        },
        {
          id: "m7",
          senderId: "c2",
          content: "Thanks for the workout plan!",
          timestamp: new Date(Date.now() - 10800000),
          read: true,
        },
      ],
    },
    {
      id: "3",
      clientId: "c3",
      clientName: "Emily Davis",
      clientAvatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "What time is our session on Friday?",
      lastMessageTime: new Date(Date.now() - 86400000),
      unreadCount: 0,
      messages: [
        {
          id: "m8",
          senderId: "c3",
          content: "What time is our session on Friday?",
          timestamp: new Date(Date.now() - 86400000),
          read: true,
        },
        {
          id: "m9",
          senderId: "trainer",
          content: "We're scheduled for 2:00 PM on Friday!",
          timestamp: new Date(Date.now() - 86000000),
          read: true,
        },
      ],
    },
  ])

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0])
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = conversations.filter((conv) =>
    conv.clientName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return

    // In a real app, this would send to backend
    console.log("[v0] Sending message:", messageInput)
    setMessageInput("")
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return "Yesterday"
    return `${days}d ago`
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] bg-background">
      {/* Conversations List */}
      <div
        className={cn(
          "w-full md:w-80 border-r border-border flex flex-col bg-card",
          selectedConversation && "hidden md:flex",
        )}
      >
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold text-primary mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background border-border"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={cn(
                "w-full p-4 flex items-start gap-3 hover:bg-primary/5 transition-colors border-b border-border text-left",
                selectedConversation?.id === conversation.id && "bg-primary/10",
              )}
            >
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={conversation.clientAvatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {conversation.clientName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-primary truncate">{conversation.clientName}</h3>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatTime(conversation.lastMessageTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                  {conversation.unreadCount > 0 && (
                    <span className="ml-2 flex-shrink-0 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col w-full md:w-auto">
          {/* Chat Header */}
          <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSelectedConversation(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedConversation.clientAvatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {selectedConversation.clientName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-primary">{selectedConversation.clientName}</h3>
                <p className="text-xs text-muted-foreground">Active now</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Video className="h-5 w-5 text-primary" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <MoreVertical className="h-5 w-5 text-primary" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex gap-3", message.senderId === "trainer" ? "justify-end" : "justify-start")}
                >
                  {message.senderId !== "trainer" && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={selectedConversation.clientAvatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {selectedConversation.clientName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2",
                      message.senderId === "trainer"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border",
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        message.senderId === "trainer" ? "text-primary-foreground/70" : "text-muted-foreground",
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t border-border p-4 bg-card">
            <div className="flex items-end gap-2">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 flex-shrink-0">
                <Paperclip className="h-5 w-5 text-primary" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  className="pr-10 bg-background border-border"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-primary/10"
                >
                  <Smile className="h-5 w-5 text-primary" />
                </Button>
              </div>
              <Button onClick={handleSendMessage} disabled={!messageInput.trim()} className="flex-shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Send className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-primary mb-2">Select a conversation</h3>
            <p className="text-muted-foreground">Choose a client from the list to start messaging</p>
          </div>
        </div>
      )}
    </div>
  )
}

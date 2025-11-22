"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

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
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/messages')
      if (!response.ok) throw new Error('Failed to fetch conversations')
      const data = await response.json()
      
      // Map API response to expected format
      const mappedConversations = (data.conversations || []).map((conv: any) => ({
        id: conv.partnerId,
        clientId: conv.partnerId,
        clientName: conv.partner?.name || 'Unknown',
        clientAvatar: conv.partner?.image || '/placeholder.svg',
        lastMessage: conv.lastMessage?.content || '',
        lastMessageTime: new Date(conv.lastMessage?.createdAt || Date.now()),
        unreadCount: conv.unreadCount || 0,
        messages: [],
      }))
      
      setConversations(mappedConversations)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setConversations([])
    } finally {
      setIsLoading(false)
    }
  }

  // Show empty state if no conversations
  if (!isLoading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4">
        <Card className="p-12 text-center max-w-2xl">
          <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
            <MessageSquare className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Connect Your Messaging</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Connect WhatsApp or SMS to manage all your client conversations in one place.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-6">
            <Button asChild className="bg-[#25D366] hover:bg-[#20BA5A] h-12">
              <Link href="/dashboard/settings">
                <Smartphone className="mr-2 h-5 w-5" />
                Connect WhatsApp
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-12">
              <Link href="/dashboard/settings">
                <MessageSquare className="mr-2 h-5 w-5" />
                Connect SMS
              </Link>
            </Button>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 max-w-lg mx-auto">
            <p className="text-sm text-muted-foreground">
              💡 <span className="font-semibold text-foreground">Coming Soon:</span> Connect your existing messaging apps to view and respond to client messages directly from your dashboard.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">Available integrations:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="px-3 py-1.5 rounded-full bg-secondary text-sm">WhatsApp Business</div>
              <div className="px-3 py-1.5 rounded-full bg-secondary text-sm">SMS/Text</div>
              <div className="px-3 py-1.5 rounded-full bg-secondary text-sm">Instagram DMs</div>
              <div className="px-3 py-1.5 rounded-full bg-secondary text-sm">Facebook Messenger</div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center space-y-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    )
  }

  // If we have conversations, show them (future implementation)
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <p className="text-muted-foreground">
        You have {conversations.length} conversation(s). Full messaging interface coming soon.
      </p>
    </div>
  )
}

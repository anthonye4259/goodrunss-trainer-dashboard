"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Search, Send, Phone, Video, MoreVertical, Check, X, Sparkles, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

interface Conversation {
    id: string
    clientId: string
    clientName: string
    clientAvatar?: string
    lastMessage: {
        content: string
        timestamp: string
        read: boolean
        sender: 'client' | 'trainer'
    }
    unreadCount: number
}

interface Draft {
    id: string
    recipientName: string
    message: string
    type: string
    createdAt: string
    status: 'draft' | 'approved'
}

export function UnifiedInbox() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [drafts, setDrafts] = useState<Draft[]>([])
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [messageInput, setMessageInput] = useState("")

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [inboxRes, queueRes] = await Promise.all([
                fetch('/api/messages/inbox'),
                fetch('/api/gia/message-queue')
            ])

            const inboxData = await inboxRes.json()
            const queueData = await queueRes.json()

            setConversations(inboxData.conversations || [])
            setDrafts(queueData.queue || [])

            if (inboxData.conversations?.length > 0 && !selectedConvId) {
                setSelectedConvId(inboxData.conversations[0].id)
            }
        } catch (error) {
            console.error('Error fetching inbox data:', error)
            toast.error('Failed to load messages')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSendMessage = async () => {
        if (!messageInput.trim()) return

        // In a real app, send to API
        toast.success('Message sent!')
        setMessageInput("")
    }

    const handleApproveDraft = async (draftId: string) => {
        // In a real app, call API to approve and send
        toast.success('Draft approved and sent!')
        setDrafts(drafts.filter(d => d.id !== draftId))
    }

    const handleDiscardDraft = async (draftId: string) => {
        // In a real app, call API to delete
        toast.success('Draft discarded')
        setDrafts(drafts.filter(d => d.id !== draftId))
    }

    const selectedConversation = conversations.find(c => c.id === selectedConvId)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[600px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
            {/* Sidebar - Conversations */}
            <Card className="md:col-span-4 lg:col-span-3 glass border-border/50 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-border/50">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search messages..." className="pl-8 bg-background/50" />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="flex flex-col gap-1 p-2">
                        {conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => setSelectedConvId(conv.id)}
                                className={`flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${selectedConvId === conv.id
                                        ? 'bg-primary/10 border border-primary/20'
                                        : 'hover:bg-accent/5'
                                    }`}
                            >
                                <Avatar>
                                    <AvatarImage src={conv.clientAvatar} />
                                    <AvatarFallback>{conv.clientName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`font-medium text-sm ${conv.unreadCount > 0 ? 'text-primary' : ''}`}>
                                            {conv.clientName}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {conv.lastMessage.sender === 'trainer' && 'You: '}
                                        {conv.lastMessage.content}
                                    </p>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <Badge variant="default" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                                        {conv.unreadCount}
                                    </Badge>
                                )}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </Card>

            {/* Main Chat Area */}
            <Card className="md:col-span-8 lg:col-span-6 glass border-border/50 flex flex-col overflow-hidden">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-border/50 flex items-center justify-between bg-background/30">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={selectedConversation.clientAvatar} />
                                    <AvatarFallback>{selectedConversation.clientName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-sm">{selectedConversation.clientName}</h3>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        Online
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Phone className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Video className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {/* Mock message history */}
                                <div className="flex justify-start">
                                    <div className="bg-accent/10 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                                        <p className="text-sm">Hi! I'm interested in personal training.</p>
                                        <span className="text-[10px] text-muted-foreground mt-1 block">Yesterday 9:41 AM</span>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
                                        <p className="text-sm">Great! What are your goals?</p>
                                        <span className="text-[10px] text-primary-foreground/70 mt-1 block">Yesterday 9:45 AM</span>
                                    </div>
                                </div>
                                <div className="flex justify-start">
                                    <div className="bg-accent/10 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                                        <p className="text-sm">{selectedConversation.lastMessage.content}</p>
                                        <span className="text-[10px] text-muted-foreground mt-1 block">
                                            {new Date(selectedConversation.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 border-t border-border/50 bg-background/30">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Type a message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    className="bg-background/50"
                                />
                                <Button onClick={handleSendMessage} size="icon" className="shrink-0">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </Card>

            {/* Right Sidebar - Gia Drafts */}
            <Card className="md:col-span-12 lg:col-span-3 glass border-border/50 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-border/50 bg-primary/5">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-sm">Gia Draft Queue</h3>
                        <Badge variant="secondary" className="ml-auto text-xs">
                            {drafts.length}
                        </Badge>
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-4">
                        {drafts.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                <p>No pending drafts.</p>
                                <p className="text-xs mt-2">Gia will draft messages here for your approval.</p>
                            </div>
                        ) : (
                            drafts.map((draft) => (
                                <Card key={draft.id} className="bg-background/40 border-primary/20">
                                    <CardContent className="p-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-primary">To: {draft.recipientName}</span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(draft.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground bg-background/50 p-2 rounded border border-border/50 italic">
                                            "{draft.message}"
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 h-7 text-xs border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                                                onClick={() => handleDiscardDraft(draft.id)}
                                            >
                                                <X className="h-3 w-3 mr-1" />
                                                Discard
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="flex-1 h-7 text-xs bg-primary text-black hover:bg-primary/90"
                                                onClick={() => handleApproveDraft(draft.id)}
                                            >
                                                <Check className="h-3 w-3 mr-1" />
                                                Send
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </Card>
        </div>
    )
}

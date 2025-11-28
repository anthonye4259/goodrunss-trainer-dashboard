"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, User, Sparkles, RefreshCw } from "lucide-react"

interface Message {
    role: 'user' | 'assistant'
    content: string
}

interface PersonaPreviewProps {
    name: string
    tagline: string | null
    teachingStyle: string | null
    personality: any
}

export function PersonaPreview({ name, tagline, teachingStyle, personality }: PersonaPreviewProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: `Hi! I'm ${name || 'your AI coach'}. Ready to train?` }
    ])
    const [input, setInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMessage = input
        setInput("")
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setIsTyping(true)

        // Simulate AI response based on persona settings
        setTimeout(() => {
            let response = "I'm ready to help you crush your goals!"

            // Simple logic to mimic personality traits
            const strictness = personality?.strictness || 50
            const energy = personality?.energy || 50
            const empathy = personality?.empathy || 50

            if (strictness > 70) {
                response = "No excuses. Let's get to work. What's your status?"
            } else if (energy > 70) {
                response = "LET'S GOOO! I'm pumped to see what you can do today! 🔥"
            } else if (empathy > 70) {
                response = "I understand it's tough, but I believe in you. How are you feeling today?"
            }

            setMessages(prev => [...prev, { role: 'assistant', content: response }])
            setIsTyping(false)
        }, 1500)
    }

    const handleReset = () => {
        setMessages([
            { role: 'assistant', content: `Hi! I'm ${name || 'your AI coach'}. Ready to train?` }
        ])
    }

    return (
        <Card className="glass border-border/50 h-[600px] flex flex-col">
            <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-primary">
                            <AvatarImage src="/placeholder-avatar.jpg" />
                            <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg">{name || "AI Coach"}</CardTitle>
                            <p className="text-xs text-muted-foreground">{tagline || "Your personal trainer"}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleReset} title="Reset Chat">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-br-none'
                                    : 'bg-muted text-foreground rounded-bl-none'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-2 flex items-center gap-1">
                            <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </CardContent>

            <CardFooter className="border-t border-border/50 pt-4">
                <form
                    className="flex w-full gap-2"
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSend()
                    }}
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}

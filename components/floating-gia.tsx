"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from '@ai-sdk/react'
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

export function FloatingGIA() {
    const { toast } = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [selectedMode, setSelectedMode] = useState<GIAMode>('wellness')
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    // Use the AI SDK's useChat hook - handles tool calls automatically
    const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
        api: '/api/gia/chat',
        body: {
            mode: selectedMode,
        },
        onError: (error) => {
            console.error('Chat error:', error)
            toast({
                title: "Request failed",
                description: error.message || "GIA is temporarily unavailable. Please try again.",
                variant: "destructive",
            })
        },
    })

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
        }

        window.addEventListener('openGIA', handleOpenGIA as EventListener)
        return () => window.removeEventListener('openGIA', handleOpenGIA as EventListener)
    }, [])

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
                                                    {message.content}
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
                                    {isLoading && (
                                        <div className="flex gap-2 justify-start">
                                            <Avatar className="h-7 w-7 bg-primary/10">
                                                <AvatarFallback>
                                                    <Sparkles className="h-3 w-3 text-primary" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="bg-secondary rounded-lg p-3">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Input */}
                            <CardContent className="p-3 border-t border-border/40">
                                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                                    <Textarea
                                        placeholder="Ask GIA..."
                                        value={input}
                                        onChange={handleInputChange}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault()
                                                handleSubmit(e)
                                            }
                                        }}
                                        rows={1}
                                        className="flex-1 resize-none text-sm min-h-[32px] max-h-[80px]"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        type="submit"
                                        disabled={isLoading || !input.trim()}
                                        size="icon"
                                        className="h-8 w-8 flex-shrink-0 bg-primary hover:bg-primary/90"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </CardContent>
                        </>
                    )}
                </Card>
            )}
        </>
    )
}

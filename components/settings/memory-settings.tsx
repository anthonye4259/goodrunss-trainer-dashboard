"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, Trash2, Edit2, Save, X, Plus, Sparkles, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Memory {
    id: string
    category: 'preference' | 'fact' | 'pattern' | 'style'
    key: string
    value: string
    confidence: number
    source: 'explicit' | 'inferred' | 'observed'
    updatedAt: string
}

export function MemorySettings() {
    const { toast } = useToast()
    const [memories, setMemories] = useState<Memory[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValue, setEditValue] = useState("")
    const [activeTab, setActiveTab] = useState("all")

    useEffect(() => {
        fetchMemories()
    }, [])

    const fetchMemories = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/gia/memory')
            if (!response.ok) throw new Error('Failed to fetch memories')
            const data = await response.json()
            setMemories(data.memories)
        } catch (error) {
            console.error('Error fetching memories:', error)
            toast({
                title: "Error loading memories",
                description: "Please try again later.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateMemory = async (key: string, value: string) => {
        try {
            const response = await fetch('/api/gia/memory', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            })

            if (!response.ok) throw new Error('Failed to update memory')

            setMemories(memories.map(m =>
                m.key === key ? { ...m, value } : m
            ))
            setEditingId(null)

            toast({
                title: "Memory updated",
                description: "Gia has updated her knowledge about you.",
            })
        } catch (error) {
            toast({
                title: "Error updating memory",
                description: "Please try again later.",
                variant: "destructive",
            })
        }
    }

    const handleDeleteMemory = async (key: string) => {
        try {
            const response = await fetch(`/api/gia/memory?key=${key}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to delete memory')

            setMemories(memories.filter(m => m.key !== key))

            toast({
                title: "Memory deleted",
                description: "Gia has forgotten this information.",
            })
        } catch (error) {
            toast({
                title: "Error deleting memory",
                description: "Please try again later.",
                variant: "destructive",
            })
        }
    }

    const handleClearAll = async () => {
        try {
            const response = await fetch('/api/gia/memory?clearAll=true', {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to clear memories')

            setMemories([])

            toast({
                title: "All memories cleared",
                description: "Gia has forgotten everything about you.",
            })
        } catch (error) {
            toast({
                title: "Error clearing memories",
                description: "Please try again later.",
                variant: "destructive",
            })
        }
    }

    const filteredMemories = activeTab === "all"
        ? memories
        : memories.filter(m => m.category === activeTab)

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'preference': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            case 'fact': return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'pattern': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
            case 'style': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        }
    }

    return (
        <div className="space-y-6">
            <Card className="glass border-border/50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-primary" />
                                Gia's Memory
                            </CardTitle>
                            <CardDescription>
                                View and manage what Gia knows about you to personalize your experience.
                            </CardDescription>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    Clear All
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete all memories Gia has learned about you.
                                        She will forget your preferences, style, and patterns. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Yes, clear everything
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList className="bg-card/50">
                            <TabsTrigger value="all">All Memories</TabsTrigger>
                            <TabsTrigger value="preference">Preferences</TabsTrigger>
                            <TabsTrigger value="fact">Facts</TabsTrigger>
                            <TabsTrigger value="pattern">Patterns</TabsTrigger>
                            <TabsTrigger value="style">Style</TabsTrigger>
                        </TabsList>

                        <ScrollArea className="h-[500px] pr-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-40">
                                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : filteredMemories.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-center space-y-2">
                                    <Sparkles className="h-8 w-8 text-muted-foreground/50" />
                                    <p className="text-muted-foreground">No memories found yet.</p>
                                    <p className="text-xs text-muted-foreground/70">Chat with Gia and she will start learning about you!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredMemories.map((memory) => (
                                        <div key={memory.id} className="group flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-colors">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className={getCategoryColor(memory.category)}>
                                                        {memory.category}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        {memory.key.replace(/_/g, ' ')}
                                                    </span>
                                                    <Badge variant="secondary" className="text-[10px] h-5">
                                                        {Math.round(memory.confidence * 100)}% confidence
                                                    </Badge>
                                                </div>

                                                {editingId === memory.id ? (
                                                    <div className="space-y-2">
                                                        <Textarea
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            className="min-h-[80px]"
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleUpdateMemory(memory.key, editValue)}
                                                                className="h-8"
                                                            >
                                                                <Save className="h-3 w-3 mr-1" /> Save
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => setEditingId(null)}
                                                                className="h-8"
                                                            >
                                                                <X className="h-3 w-3 mr-1" /> Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-foreground/90 leading-relaxed">
                                                        {memory.value}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    onClick={() => {
                                                        setEditingId(memory.id)
                                                        setEditValue(memory.value)
                                                    }}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => handleDeleteMemory(memory.key)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}

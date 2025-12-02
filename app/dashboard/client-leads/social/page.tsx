"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MessageCircle, ExternalLink, Sparkles, Copy, RefreshCw, ThumbsUp, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { formatDistanceToNow } from "date-fns"

interface RedditPost {
    id: string
    title: string
    selftext: string
    author: string
    permalink: string
    url: string
    created_utc: number
    subreddit: string
    score: number
    num_comments: number
}

export default function SocialLeadsPage() {
    const { toast } = useToast()
    const [query, setQuery] = useState("looking for personal trainer")
    const [posts, setPosts] = useState<RedditPost[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [draftingId, setDraftingId] = useState<string | null>(null)
    const [drafts, setDrafts] = useState<Record<string, string>>({})

    const handleSearch = async () => {
        if (!query.trim()) return

        setIsLoading(true)
        try {
            const response = await fetch(`/api/social/search?q=${encodeURIComponent(query)}`)
            if (!response.ok) throw new Error('Failed to fetch posts')
            const data = await response.json()
            setPosts(data.posts)
        } catch (error) {
            console.error('Search error:', error)
            toast({
                title: "Error searching Reddit",
                description: "Please try again later.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDraftReply = async (post: RedditPost) => {
        setDraftingId(post.id)
        try {
            const response = await fetch('/api/gia/draft-social-reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postContent: post.selftext,
                    postTitle: post.title,
                    platform: 'Reddit'
                })
            })

            if (!response.ok) throw new Error('Failed to draft reply')
            const data = await response.json()

            setDrafts(prev => ({
                ...prev,
                [post.id]: data.reply
            }))

            toast({
                title: "Reply drafted",
                description: "Gia has created a response for you.",
            })
        } catch (error) {
            console.error('Draft error:', error)
            toast({
                title: "Error drafting reply",
                description: "Please try again later.",
                variant: "destructive",
            })
        } finally {
            setDraftingId(null)
        }
    }

    const handleCopyDraft = (text: string) => {
        navigator.clipboard.writeText(text)
        toast({
            title: "Copied to clipboard",
            description: "Ready to paste on Reddit.",
        })
    }

    return (
        <div className="space-y-6 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        Social Lead Scanner <MessageCircle className="h-6 w-6 text-primary" />
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Find potential clients asking for help on Reddit and engage with them.
                    </p>
                </div>
            </div>

            <Card className="glass border-border/50">
                <CardHeader>
                    <CardTitle>Search Discussions</CardTitle>
                    <CardDescription>
                        Enter keywords like "looking for coach", "marathon help", or "form check".
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search keywords..."
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button onClick={handleSearch} disabled={isLoading} className="gap-2">
                            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            Search
                        </Button>
                    </div>
                    <div className="flex gap-2 mt-4 flex-wrap">
                        {["looking for personal trainer", "marathon training help", "powerlifting coach", "swim technique help", "nutrition advice needed"].map((suggestion) => (
                            <Badge
                                key={suggestion}
                                variant="outline"
                                className="cursor-pointer hover:bg-primary/10 transition-colors"
                                onClick={() => {
                                    setQuery(suggestion)
                                    // Optional: auto-search on click
                                }}
                            >
                                {suggestion}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {posts.length === 0 && !isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No discussions found. Try a different search term.</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <Card key={post.id} className="glass border-border/50 hover:border-primary/30 transition-colors">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <CardTitle className="text-lg font-semibold leading-tight">
                                            <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary transition-colors">
                                                {post.title}
                                            </a>
                                        </CardTitle>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                            <Badge variant="secondary" className="text-[10px]">r/{post.subreddit}</Badge>
                                            <span>• Posted by u/{post.author}</span>
                                            <span>• {formatDistanceToNow(new Date(post.created_utc * 1000))} ago</span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" asChild>
                                        <a href={post.url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-3">
                                <p className="text-sm text-foreground/80 line-clamp-3">
                                    {post.selftext}
                                </p>
                                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {post.score}</span>
                                    <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {post.num_comments} comments</span>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-3 border-t border-border/30 flex flex-col items-stretch gap-4">
                                {!drafts[post.id] ? (
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                                        onClick={() => handleDraftReply(post)}
                                        disabled={draftingId === post.id}
                                    >
                                        {draftingId === post.id ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                Gia is reading and drafting...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4" />
                                                Draft Reply with Gia
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <div className="w-full space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium flex items-center gap-2 text-primary">
                                                <Sparkles className="h-4 w-4" /> Gia's Draft
                                            </span>
                                            <Button size="sm" variant="ghost" onClick={() => handleCopyDraft(drafts[post.id])} className="h-8 gap-2">
                                                <Copy className="h-3 w-3" /> Copy
                                            </Button>
                                        </div>
                                        <Textarea
                                            readOnly
                                            value={drafts[post.id]}
                                            className="min-h-[120px] bg-background/50 text-sm"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setDrafts(prev => {
                                                    const newDrafts = { ...prev }
                                                    delete newDrafts[post.id]
                                                    return newDrafts
                                                })}
                                            >
                                                Discard
                                            </Button>
                                            <Button size="sm" onClick={() => handleCopyDraft(drafts[post.id])}>
                                                Copy & Go to Reddit
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}

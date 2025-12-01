"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Edit3, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface MessageDraftModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    recipientName: string
    recipientId: string
    recipientPhone?: string
    messageType: 'lead_intro' | 'churn_reengagement' | 'referral_request' | 'milestone_celebration'
    context?: {
        sport?: string
        goals?: string
        level?: string
        lastSession?: string
        missedSessions?: number
        milestone?: string
    }
    onSent?: () => void
}

export function MessageDraftModal({
    open,
    onOpenChange,
    recipientName,
    recipientId,
    recipientPhone,
    messageType,
    context,
    onSent
}: MessageDraftModalProps) {
    const [draftedMessage, setDraftedMessage] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [metadata, setMetadata] = useState<any>(null)

    // Auto-generate message when modal opens
    useState(() => {
        if (open && !draftedMessage) {
            generateMessage()
        }
    })

    const generateMessage = async () => {
        setIsGenerating(true)
        try {
            const response = await fetch('/api/gia/draft-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: messageType,
                    recipientId,
                    recipientName,
                    context
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate message')
            }

            setDraftedMessage(data.message)
            setMetadata(data.metadata)
        } catch (error: any) {
            console.error('Error generating message:', error)
            toast.error(error.message || 'Failed to generate message')
        } finally {
            setIsGenerating(false)
        }
    }

    const sendMessage = async () => {
        if (!draftedMessage.trim()) {
            toast.error('Message cannot be empty')
            return
        }

        setIsSending(true)
        try {
            const response = await fetch('/api/gia/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: draftedMessage,
                    phoneNumbers: recipientPhone ? [recipientPhone] : undefined,
                    clientIds: recipientPhone ? undefined : [recipientId]
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send message')
            }

            toast.success(`Message sent to ${recipientName}!`)
            onOpenChange(false)
            onSent?.()
        } catch (error: any) {
            console.error('Error sending message:', error)
            toast.error(error.message || 'Failed to send message')
        } finally {
            setIsSending(false)
        }
    }

    const getTypeLabel = () => {
        switch (messageType) {
            case 'lead_intro':
                return 'Lead Introduction'
            case 'churn_reengagement':
                return 'Re-engagement'
            case 'referral_request':
                return 'Referral Request'
            case 'milestone_celebration':
                return 'Milestone Celebration'
            default:
                return 'Message'
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>Draft Message to {recipientName}</DialogTitle>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {getTypeLabel()}
                        </Badge>
                    </div>
                    <DialogDescription>
                        AI-generated personalized message. Edit if needed, then send.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {isGenerating ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="ml-2 text-sm text-muted-foreground">Generating message...</span>
                        </div>
                    ) : (
                        <>
                            <div className="relative">
                                <Textarea
                                    value={draftedMessage}
                                    onChange={(e) => {
                                        setDraftedMessage(e.target.value)
                                        setIsEditing(true)
                                    }}
                                    placeholder="Message will appear here..."
                                    className="min-h-[120px] resize-none"
                                    disabled={isSending}
                                />
                                {isEditing && (
                                    <Badge variant="outline" className="absolute top-2 right-2 text-xs">
                                        <Edit3 className="h-3 w-3 mr-1" />
                                        Edited
                                    </Badge>
                                )}
                            </div>

                            {metadata && (
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{metadata.length} characters</span>
                                    <span>{metadata.smsSegments} SMS segment{metadata.smsSegments > 1 ? 's' : ''}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <DialogFooter className="flex items-center justify-between sm:justify-between">
                    <Button
                        variant="outline"
                        onClick={generateMessage}
                        disabled={isGenerating || isSending}
                    >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Regenerate
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isSending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={sendMessage}
                            disabled={isGenerating || isSending || !draftedMessage.trim()}
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Now
                                </>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, TrendingUp, Users, X } from "lucide-react"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    priority: string
    actionUrl?: string | null
    actionLabel?: string | null
    createdAt: string
}

interface NotificationDropdownProps {
    notifications: Notification[]
    onClose: () => void
    onMarkRead: (id: string) => void
    isLoading: boolean
}

export function NotificationDropdown({
    notifications,
    onClose,
    onMarkRead,
    isLoading
}: NotificationDropdownProps) {
    const router = useRouter()

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "critical":
                return "text-red-500 bg-red-500/10 border-red-500/20"
            case "important":
                return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
            default:
                return "text-blue-500 bg-blue-500/10 border-blue-500/20"
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "churn_risk":
                return <AlertCircle className="h-5 w-5" />
            case "upsell":
                return <TrendingUp className="h-5 w-5" />
            case "new_leads":
                return <Users className="h-5 w-5" />
            default:
                return <AlertCircle className="h-5 w-5" />
        }
    }

    const handleAction = (notification: Notification) => {
        if (notification.actionUrl) {
            router.push(notification.actionUrl)
        }
        onMarkRead(notification.id)
        onClose()
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Dropdown */}
            <Card className="absolute right-0 top-12 w-96 max-h-[500px] z-50 shadow-2xl border-border/50 bg-background/95 backdrop-blur">
                <div className="p-4 border-b border-border/50 flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Notifications</h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <ScrollArea className="h-[400px]">
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground">
                            Loading notifications...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No new notifications</p>
                            <p className="text-sm mt-1">You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/30">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-accent/50 transition-colors cursor-pointer border-l-4 ${getPriorityColor(notification.priority)}`}
                                    onClick={() => handleAction(notification)}
                                >
                                    <div className="flex gap-3">
                                        <div className={`mt-1 ${getPriorityColor(notification.priority).split(' ')[0]}`}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm mb-1">
                                                {notification.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {notification.message}
                                            </p>
                                            {notification.actionLabel && (
                                                <div className="flex gap-2 mt-2">
                                                    <Button
                                                        variant="link"
                                                        className="h-auto p-0 text-primary"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleAction(notification)
                                                        }}
                                                    >
                                                        {notification.actionLabel} →
                                                    </Button>

                                                    {(notification.type === 'churn_risk' || notification.type === 'hot_lead') && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-6 text-xs px-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                onClose()
                                                                const event = new CustomEvent('open-gia-chat', {
                                                                    detail: {
                                                                        prompt: notification.type === 'churn_risk'
                                                                            ? `Draft a check-in message for these at-risk clients: ${notification.message}`
                                                                            : `Draft an outreach message for these new leads: ${notification.message}`
                                                                    }
                                                                })
                                                                window.dispatchEvent(event)
                                                            }}
                                                        >
                                                            Draft Message
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onMarkRead(notification.id)
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </Card>
        </>
    )
}

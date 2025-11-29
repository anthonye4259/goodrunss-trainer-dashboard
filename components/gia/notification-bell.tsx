"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationDropdown } from "./notification-dropdown"

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

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const fetchNotifications = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/gia/notifications")
            if (res.ok) {
                const data = await res.json()
                setNotifications(data.notifications || [])
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
        // Poll every 60 seconds for new notifications
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [])

    const handleMarkRead = async (notificationId: string) => {
        try {
            const res = await fetch("/api/gia/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId })
            })
            if (res.ok) {
                setNotifications(prev => prev.filter(n => n.id !== notificationId))
            }
        } catch (error) {
            console.error("Failed to mark notification as read:", error)
        }
    }

    const unreadCount = notifications.length

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <NotificationDropdown
                    notifications={notifications}
                    onClose={() => setIsOpen(false)}
                    onMarkRead={handleMarkRead}
                    isLoading={isLoading}
                />
            )}
        </div>
    )
}

import { NextRequest, NextResponse } from "next/server"
import { getOrCreateUser } from "@/lib/get-or-create-user"
import { getUnreadNotifications, markNotificationRead } from "@/lib/gia/notifications"

export async function GET(req: NextRequest) {
    try {
        const user = await getOrCreateUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const notifications = await getUnreadNotifications(user.id)
        return NextResponse.json({ success: true, notifications })
    } catch (error) {
        console.error("Error fetching notifications:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getOrCreateUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { notificationId } = await req.json()
        if (!notificationId) {
            return NextResponse.json({ error: "Missing notificationId" }, { status: 400 })
        }

        await markNotificationRead(notificationId, user.id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error marking notification read:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

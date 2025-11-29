import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get("ambassador_session")?.value

        if (!sessionToken) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        const session = await prisma.ambassador_sessions.findUnique({
            where: { sessionToken },
            include: { ambassador: true }
        })

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 401 })
        }

        if (session.expiresAt < new Date()) {
            // Clean up expired session
            await prisma.ambassador_sessions.delete({
                where: { id: session.id }
            })
            return NextResponse.json({ error: "Session expired" }, { status: 401 })
        }

        return NextResponse.json({
            ambassador: {
                id: session.ambassador.id,
                email: session.ambassador.email,
                name: session.ambassador.name,
                referralCode: session.ambassador.referralCode
            }
        })

    } catch (error) {
        console.error("[SESSION_ERROR]", error)
        return NextResponse.json({ error: "Failed to get session" }, { status: 500 })
    }
}

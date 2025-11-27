import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get("ambassador_session")?.value

        if (sessionToken) {
            // Delete session from database
            await prisma.ambassador_sessions.deleteMany({
                where: { sessionToken }
            })
        }

        // Create response and delete cookie
        const response = NextResponse.json({ success: true })
        response.cookies.delete("ambassador_session")

        return response

    } catch (error) {
        console.error("[LOGOUT_ERROR]", error)
        return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
    }
}

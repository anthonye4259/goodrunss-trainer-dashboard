import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json()

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 })
        }

        // Find magic link
        const magicLink = await prisma.ambassador_magic_links.findUnique({
            where: { token },
            include: { ambassador: true }
        })

        if (!magicLink) {
            return NextResponse.json({ error: "Invalid link" }, { status: 400 })
        }

        if (magicLink.used) {
            return NextResponse.json({ error: "Link already used" }, { status: 400 })
        }

        if (magicLink.expiresAt < new Date()) {
            return NextResponse.json({ error: "Link expired" }, { status: 400 })
        }

        // Mark magic link as used
        await prisma.ambassador_magic_links.update({
            where: { id: magicLink.id },
            data: { used: true }
        })

        // Create session (30 days)
        const sessionToken = crypto.randomBytes(32).toString("hex")
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

        await prisma.ambassador_sessions.create({
            data: {
                ambassadorId: magicLink.ambassadorId,
                sessionToken,
                expiresAt
            }
        })

        // Set HttpOnly cookie
        const cookieStore = await cookies()
        cookieStore.set("ambassador_session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 30 * 24 * 60 * 60 // 30 days
        })

        return NextResponse.json({
            success: true,
            // sessionToken, // No longer needed in response body as it's in cookie
            ambassador: {
                id: magicLink.ambassador.id,
                email: magicLink.ambassador.email,
                name: magicLink.ambassador.name
            }
        })

    } catch (error) {
        console.error("[VERIFY_ERROR]", error)
        return NextResponse.json({ error: "Failed to verify link" }, { status: 500 })
    }
}

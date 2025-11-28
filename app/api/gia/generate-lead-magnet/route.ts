import { NextRequest, NextResponse } from "next/server"
import { getOrCreateUser } from "@/lib/get-or-create-user"
import { generateLeadMagnet, generateLandingPage, generateEmailSequence } from "@/lib/gia/openai"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/gia/generate-lead-magnet
 * Generate a lead magnet using AI
 */
export async function POST(req: NextRequest) {
    try {
        const trainer = await getOrCreateUser()

        if (!trainer) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { specialty, targetClient, format } = await req.json()

        if (!specialty || !targetClient || !format) {
            return NextResponse.json(
                { error: "Missing required fields: specialty, targetClient, format" },
                { status: 400 }
            )
        }

        console.log('[LEAD MAGNET] Generating...', { specialty, targetClient, format })

        // Generate lead magnet content
        const leadMagnetContent = await generateLeadMagnet(specialty, targetClient, format)

        // Generate landing page copy
        const landingPageCopy = await generateLandingPage(leadMagnetContent, trainer.name)

        // Generate email sequence
        const emailSequence = await generateEmailSequence(leadMagnetContent, trainer.name)

        // Save to database
        const leadMagnet = await prisma.lead_magnets.create({
            data: {
                id: crypto.randomUUID(),
                trainerId: trainer.id,
                title: leadMagnetContent.title,
                description: leadMagnetContent.subtitle,
                format: format,
                specialty: specialty,
                targetClient: targetClient,
                content: leadMagnetContent,
                landingPageCopy: landingPageCopy,
                emailSequence: emailSequence,
                landingPageUrl: `/lead/${crypto.randomUUID().slice(0, 8)}`,
                downloads: 0,
                leads: 0,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        })

        console.log('[LEAD MAGNET] ✅ Created:', leadMagnet.id)

        return NextResponse.json({
            success: true,
            leadMagnet: {
                id: leadMagnet.id,
                title: leadMagnet.title,
                description: leadMagnet.description,
                landingPageUrl: leadMagnet.landingPageUrl,
                content: leadMagnetContent,
                landingPageCopy: landingPageCopy,
                emailSequence: emailSequence
            }
        })
    } catch (error: any) {
        console.error("[LEAD MAGNET] Error:", error)
        return NextResponse.json(
            { error: "Failed to generate lead magnet", details: error.message },
            { status: 500 }
        )
    }
}

/**
 * GET /api/gia/generate-lead-magnet
 * Get all lead magnets for trainer
 */
export async function GET(req: NextRequest) {
    try {
        const trainer = await getOrCreateUser()

        if (!trainer) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const leadMagnets = await prisma.lead_magnets.findMany({
            where: { trainerId: trainer.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                description: true,
                format: true,
                specialty: true,
                targetClient: true,
                landingPageUrl: true,
                downloads: true,
                leads: true,
                isActive: true,
                createdAt: true,
            }
        })

        return NextResponse.json({
            success: true,
            leadMagnets
        })
    } catch (error: any) {
        console.error("[LEAD MAGNET] Error fetching:", error)
        return NextResponse.json(
            { error: "Failed to fetch lead magnets", details: error.message },
            { status: 500 }
        )
    }
}

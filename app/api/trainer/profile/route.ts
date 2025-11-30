import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const { userId } = await auth()
        const user = await currentUser()

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Find or create trainer profile
        let profile = await prisma.trainerProfile.findUnique({
            where: { userId }
        })

        if (!profile) {
            // Create default profile if it doesn't exist
            profile = await prisma.trainerProfile.create({
                data: {
                    userId,
                    tier: "MEMBER",
                    isVerified: false
                }
            })
        }

        return NextResponse.json(profile)
    } catch (error) {
        console.error("[TRAINER_PROFILE_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

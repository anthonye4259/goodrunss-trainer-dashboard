import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

import { getOrCreateUser } from "@/lib/get-or-create-user"

export async function GET() {
    try {
        const user = await getOrCreateUser()

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Find or create trainer profile
        let profile = await prisma.trainer_profiles.findUnique({
            where: { userId: user.id }
        })

        if (!profile) {
            // Create default profile if it doesn't exist
            profile = await prisma.trainer_profiles.create({
                data: {
                    userId: user.id,
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

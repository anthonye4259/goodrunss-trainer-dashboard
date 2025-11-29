import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const { userId } = getAuth(req)
        const { searchParams } = new URL(req.url)
        const email = searchParams.get("email")

        let ambassador

        // Support both authenticated users and email-based lookups
        if (email) {
            // Public ambassador lookup by email
            ambassador = await prisma.ambassadors.findUnique({
                where: { email },
                include: {
                    referrals: {
                        include: {
                            referredUser: true,
                            commissions: true
                        }
                    },
                    commissions: true
                }
            })
        } else if (userId) {
            // Authenticated user lookup
            const user = await prisma.users.findUnique({
                where: { clerkId: userId },
                include: {
                    ambassador: {
                        include: {
                            referrals: {
                                include: {
                                    referredUser: true,
                                    commissions: true
                                }
                            },
                            commissions: true
                        }
                    }
                }
            })

            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 })
            }

            ambassador = user.ambassador
        } else {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // If not an ambassador yet, return null
        if (!ambassador) {
            return NextResponse.json({ stats: null, referrals: [] })
        }

        // Calculate stats
        const stats = {
            totalEarnings: Number(ambassador.totalEarnings),
            pendingEarnings: Number(ambassador.pendingEarnings),
            paidEarnings: Number(ambassador.paidEarnings),
            totalReferrals: ambassador.totalReferrals,
            activeReferrals: ambassador.activeReferrals,
            referralCode: ambassador.referralCode,
            referralLink: `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${ambassador.referralCode}`,
            payoutMethod: ambassador.payoutMethod,
            payoutEmail: ambassador.payoutEmail
        }

        // Format referrals
        const referrals = ambassador.referrals.map((ref: any) => ({
            id: ref.id,
            referredUserName: ref.referredUser.name || ref.referredUser.email,
            status: ref.status,
            convertedAt: ref.convertedAt,
            totalCommissions: ref.commissions.reduce((sum: number, c: any) => sum + Number(c.amount), 0)
        }))

        return NextResponse.json({ stats, referrals })
    } catch (error) {
        console.error("Error fetching ambassador stats:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

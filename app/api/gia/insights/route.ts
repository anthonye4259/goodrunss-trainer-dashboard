import { NextRequest, NextResponse } from "next/server"
import { getOrCreateUser } from "@/lib/get-or-create-user"
import { analyzeClientRisk, analyzeRevenue, generateRecommendations } from "@/lib/gia/intelligence"

/**
 * GET /api/gia/insights
 * Returns daily briefing insights for the trainer
 */
export async function GET(req: NextRequest) {
    try {
        const trainer = await getOrCreateUser()

        if (!trainer) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Run all analyses in parallel
        const [clientRisks, revenueInsights, recommendations] = await Promise.all([
            analyzeClientRisk(trainer.id),
            analyzeRevenue(trainer.id),
            generateRecommendations(trainer.id)
        ])

        // Calculate summary stats
        const highRiskCount = clientRisks.filter(r => r.riskLevel === 'high').length
        const mediumRiskCount = clientRisks.filter(r => r.riskLevel === 'medium').length

        return NextResponse.json({
            success: true,
            insights: {
                summary: {
                    atRiskClients: highRiskCount + mediumRiskCount,
                    highRiskClients: highRiskCount,
                    revenueGrowth: revenueInsights.growth,
                    upsellOpportunities: revenueInsights.upsellOpportunities.length,
                    criticalActions: recommendations.filter(r => r.priority === 'critical').length
                },
                clientRisks,
                revenue: revenueInsights,
                recommendations
            }
        })
    } catch (error: any) {
        console.error("Error generating insights:", error)
        return NextResponse.json(
            { error: "Failed to generate insights", details: error.message },
            { status: 500 }
        )
    }
}

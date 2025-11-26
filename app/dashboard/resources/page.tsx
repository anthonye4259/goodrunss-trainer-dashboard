import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Lock, Zap, Video, Shield, TrendingUp, Gift } from "lucide-react"

export const metadata: Metadata = {
    title: "Exclusive Resources | GoodRunss Elite",
    description: "Premium tools and templates for your training business",
}

// Force dynamic rendering
export const dynamic = "force-dynamic"

async function getUserTier() {
    const user = await currentUser()
    if (!user) return "MEMBER"

    const profile = await prisma.trainer_profiles.findUnique({
        where: { userId: user.id }
    })

    return profile?.tier || "MEMBER"
}

export default async function ResourcesPage() {
    const userTier = await getUserTier()

    // Helper to check access
    const hasAccess = (requiredTier: string) => {
        const tiers = ["MEMBER", "PRO", "ELITE", "LEGEND"]
        return tiers.indexOf(userTier) >= tiers.indexOf(requiredTier)
    }

    const resources = [
        {
            category: "Legal & Business",
            icon: Shield,
            items: [
                { title: "Liability Waiver Template", description: "Standard sports/fitness waiver for new clients.", tier: "MEMBER", type: "PDF" },
                { title: "Invoice Template", description: "Professional invoice design for your services.", tier: "MEMBER", type: "PDF" },
                { title: "Client Service Agreement", description: "Comprehensive contract for 1-on-1 coaching.", tier: "PRO", type: "DOCX" },
                { title: "Media Release Form", description: "Permission to use client photos/videos.", tier: "PRO", type: "PDF" },
            ]
        },
        {
            category: "Marketing & Growth",
            icon: TrendingUp,
            items: [
                { title: "Social Media Hook Library", description: "50+ viral hooks for TikTok/Reels.", tier: "PRO", type: "Notion" },
                { title: "Email Newsletter Scripts", description: "Welcome sequence and re-engagement emails.", tier: "PRO", type: "DOCX" },
                { title: "Canva Templates Pack", description: "Instagram Stories and post templates.", tier: "ELITE", type: "Canva" },
                { title: "Viral Content Guide", description: "How to film high-quality content with your phone.", tier: "ELITE", type: "Video" },
            ]
        },
        {
            category: "Programming & Education",
            icon: Zap,
            items: [
                { title: "Movement Screening Checklist", description: "Standard assessment for onboarding.", tier: "MEMBER", type: "PDF" },
                { title: "Periodization Charts", description: "Macro-cycle planning templates.", tier: "PRO", type: "Excel" },
                { title: "Nutrition Guide White-label", description: "Branded guide to give to your clients.", tier: "ELITE", type: "PDF" },
                { title: "Exercise Demo Library", description: "High-quality video demos for your app.", tier: "LEGEND", type: "Video" },
            ]
        },
        {
            category: "Perks & Partnerships",
            icon: Gift,
            items: [
                { title: "Trainer Insurance Referral", description: "Preferred rates with partner providers.", tier: "MEMBER", type: "Link" },
                { title: "Equipment Discount (20%)", description: "Exclusive deal with top sports brands.", tier: "ELITE", type: "Code" },
                { title: "Video Editing Software Deal", description: "3 months free on professional tools.", tier: "LEGEND", type: "Code" },
            ]
        }
    ]

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-8 h-8 text-primary" />
                    Exclusive Resources
                </h1>
                <p className="text-slate-400 mt-2">
                    Premium tools, templates, and perks to scale your business.
                    <br />
                    <span className="text-sm">Your current access level: <span className="text-primary font-bold">{userTier}</span></span>
                </p>
            </div>

            <div className="grid gap-8">
                {resources.map((section) => (
                    <div key={section.category}>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <section.icon className="w-5 h-5 text-blue-400" />
                            {section.category}
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {section.items.map((item) => {
                                const locked = !hasAccess(item.tier)

                                return (
                                    <Card key={item.title} className={`bg-slate-900/50 border-slate-800 backdrop-blur transition-all ${locked ? 'opacity-75' : 'hover:border-slate-600 hover:-translate-y-1'}`}>
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                                                    {item.type}
                                                </Badge>
                                                {item.tier !== "MEMBER" && (
                                                    <Badge className={`${item.tier === "PRO" ? "bg-blue-900 text-blue-200" :
                                                            item.tier === "ELITE" ? "bg-amber-900 text-amber-200" :
                                                                "bg-purple-900 text-purple-200"
                                                        } border-none text-[10px]`}>
                                                        {item.tier}
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-base text-white leading-tight">
                                                {item.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pb-3">
                                            <CardDescription className="text-slate-400 text-xs">
                                                {item.description}
                                            </CardDescription>
                                        </CardContent>
                                        <CardFooter>
                                            {locked ? (
                                                <Button variant="ghost" className="w-full justify-between text-slate-500 hover:text-slate-500 hover:bg-transparent cursor-not-allowed">
                                                    <span className="flex items-center gap-2"><Lock className="w-3 h-3" /> Locked</span>
                                                    <span className="text-xs">Upgrade to {item.tier}</span>
                                                </Button>
                                            ) : (
                                                <Button variant="secondary" className="w-full justify-between bg-slate-800 text-white hover:bg-slate-700">
                                                    <span className="flex items-center gap-2"><Download className="w-3 h-3" /> Download</span>
                                                </Button>
                                            )}
                                        </CardFooter>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

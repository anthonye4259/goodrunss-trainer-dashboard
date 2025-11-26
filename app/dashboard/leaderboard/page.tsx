import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, TrendingUp, Users, Star, Crown } from "lucide-react"

export const metadata: Metadata = {
    title: "Leaderboard | GoodRunss Elite",
    description: "Top performing trainers in the community",
}

// Force dynamic rendering
export const dynamic = "force-dynamic"

async function getLeaderboardData() {
    const profiles = await prisma.trainer_profiles.findMany({
        include: {
            user: true
        },
        orderBy: {
            monthlyRevenue: "desc"
        },
        take: 50
    })

    // Mock data for initial population
    const mockProfiles = [
        {
            id: "mock-1",
            userId: "mock-user-1",
            tier: "LEGEND",
            monthlyRevenue: 28500,
            totalClients: 142,
            averageRating: 5.0,
            user: { name: "Sarah Jenkins", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop" }
        },
        {
            id: "mock-2",
            userId: "mock-user-2",
            tier: "LEGEND",
            monthlyRevenue: 24200,
            totalClients: 98,
            averageRating: 4.9,
            user: { name: "Marcus Chen", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop" }
        },
        {
            id: "mock-3",
            userId: "mock-user-3",
            tier: "ELITE",
            monthlyRevenue: 18900,
            totalClients: 85,
            averageRating: 4.9,
            user: { name: "Elena Rodriguez", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop" }
        },
        {
            id: "mock-4",
            userId: "mock-user-4",
            tier: "ELITE",
            monthlyRevenue: 15400,
            totalClients: 112,
            averageRating: 4.8,
            user: { name: "David Kim", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop" }
        },
        {
            id: "mock-5",
            userId: "mock-user-5",
            tier: "PRO",
            monthlyRevenue: 8200,
            totalClients: 45,
            averageRating: 5.0,
            user: { name: "Jessica Foster", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop" }
        }
    ]

    // Combine real and mock data
    return [...profiles, ...mockProfiles]
}

export default async function LeaderboardPage() {
    const profiles = await getLeaderboardData()

    // Sort by different metrics
    const topEarners = [...profiles].sort((a, b) => Number(b.monthlyRevenue) - Number(a.monthlyRevenue)).slice(0, 10)
    const mostClients = [...profiles].sort((a, b) => b.totalClients - a.totalClients).slice(0, 10)
    const highestRated = [...profiles].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)).slice(0, 10)

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Trophy className="w-8 h-8 text-gold" />
                        Leaderboard
                    </h1>
                    <p className="text-slate-400">Top performers in the GoodRunss Elite community</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-gold" />
                    <span className="text-slate-300 text-sm">You are ranked <span className="text-white font-bold">#42</span></span>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Top Earners */}
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur h-full">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl text-gold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Top Earners
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {topEarners.length > 0 ? (
                            topEarners.map((profile, index) => (
                                <div key={profile.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
                                    <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${index === 0 ? "bg-gold text-black" :
                                        index === 1 ? "bg-slate-300 text-black" :
                                            index === 2 ? "bg-amber-700 text-white" : "bg-slate-800 text-slate-500"
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <Avatar className="w-10 h-10 border border-slate-700">
                                        <AvatarImage src={profile.profilePhotoUrl || profile.user.image || ""} />
                                        <AvatarFallback>{(profile.user.name || "T").charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{profile.user.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{profile.tier} Member</p>
                                    </div>
                                    {/* Hide actual revenue for privacy, show tier or score instead */}
                                    <Badge variant="outline" className="border-slate-700 text-slate-400">
                                        {profile.tier}
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                No data yet. Be the first!
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Most Clients */}
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur h-full">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl text-blue-400 flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Most Clients
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {mostClients.length > 0 ? (
                            mostClients.map((profile, index) => (
                                <div key={profile.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
                                    <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${index === 0 ? "bg-blue-500 text-white" :
                                        index === 1 ? "bg-slate-300 text-black" :
                                            index === 2 ? "bg-amber-700 text-white" : "bg-slate-800 text-slate-500"
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <Avatar className="w-10 h-10 border border-slate-700">
                                        <AvatarImage src={profile.profilePhotoUrl || profile.user.image || ""} />
                                        <AvatarFallback>{(profile.user.name || "T").charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{profile.user.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{profile.totalClients} Clients</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                No data yet. Be the first!
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Highest Rated */}
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur h-full">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl text-purple-400 flex items-center gap-2">
                            <Star className="w-5 h-5" />
                            Highest Rated
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {highestRated.length > 0 ? (
                            highestRated.map((profile, index) => (
                                <div key={profile.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
                                    <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${index === 0 ? "bg-purple-500 text-white" :
                                        index === 1 ? "bg-slate-300 text-black" :
                                            index === 2 ? "bg-amber-700 text-white" : "bg-slate-800 text-slate-500"
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <Avatar className="w-10 h-10 border border-slate-700">
                                        <AvatarImage src={profile.profilePhotoUrl || profile.user.image || ""} />
                                        <AvatarFallback>{(profile.user.name || "T").charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{profile.user.name}</p>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-gold fill-gold" />
                                            <span className="text-xs text-slate-400">{profile.averageRating?.toFixed(1) || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                No data yet. Be the first!
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

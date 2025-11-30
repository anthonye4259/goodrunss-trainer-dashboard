import { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Star, MapPin, Trophy, TrendingUp, Users } from "lucide-react"
import Image from "next/image"

// Force dynamic rendering
export const dynamic = "force-dynamic"

interface TrainerProfilePageProps {
    params: Promise<{
        id: string
    }>
}

async function getTrainerProfile(id: string) {
    // Get user profile from User model
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
            specialties: true,
            certifications: true,
            hourlyRate: true,
            location: true,
            rating: true,
            totalSessions: true,
            isAvailable: true,
            _count: {
                select: {
                    clients: true,
                }
            }
        }
    })

    if (!user || !user.isAvailable) {
        return null
    }

    return user
}

export async function generateMetadata({ params }: TrainerProfilePageProps): Promise<Metadata> {
    const { id } = await params
    const profile = await getTrainerProfile(id)

    if (!profile) {
        return {
            title: "Trainer Not Found",
        }
    }

    return {
        title: `${profile.name || "Trainer"} | GoodRunss Elite`,
        description: profile.bio || "Professional Personal Trainer on GoodRunss",
    }
}

export default async function TrainerProfilePage({ params }: TrainerProfilePageProps) {
    const { id } = await params
    const profile = await getTrainerProfile(id)

    if (!profile) {
        return notFound()
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Hero / Cover Photo */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-black" />
            </div>

            <div className="container max-w-4xl mx-auto px-4 -mt-32 relative z-20">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-end md:items-center gap-6 mb-8">
                    <div className="relative">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background overflow-hidden relative bg-slate-800 shadow-2xl">
                            {profile.image ? (
                                <Image
                                    src={profile.image}
                                    alt={profile.name || "Trainer"}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-500">
                                    {(profile.name || "T").charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 pb-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                {profile.name}
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-4">
                            {profile.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {profile.location}
                                </div>
                            )}
                            {profile.rating && (
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-primary fill-primary" />
                                    {profile.rating.toFixed(1)}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {profile.specialties.map((specialty) => (
                                <Badge key={specialty} variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700">
                                    {specialty}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                        <Button className="flex-1 md:flex-none bg-primary hover:bg-yellow-600 text-black font-bold">
                            Book Now
                        </Button>
                        <Button variant="outline" className="flex-1 md:flex-none border-slate-700 hover:bg-slate-800">
                            Message
                        </Button>
                    </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                    <div className="mb-12">
                        <p className="text-slate-300 leading-relaxed max-w-2xl">
                            {profile.bio}
                        </p>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
                        <CardContent className="p-6 text-center">
                            <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{profile._count.clients}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Clients</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
                        <CardContent className="p-6 text-center">
                            <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{profile.totalSessions}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Sessions</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
                        <CardContent className="p-6 text-center">
                            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">${profile.hourlyRate || 0}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Per Hour</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
                        <CardContent className="p-6 text-center">
                            <Star className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{profile.rating?.toFixed(1) || "N/A"}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Rating</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Certifications */}
                {profile.certifications.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Certifications</h2>
                        <div className="flex flex-wrap gap-3">
                            {profile.certifications.map((cert) => (
                                <div key={cert} className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-3 rounded-lg">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-slate-300 font-medium">{cert}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

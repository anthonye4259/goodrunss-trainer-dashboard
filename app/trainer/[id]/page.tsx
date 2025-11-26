import { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Star, MapPin, Instagram, Youtube, Globe, Trophy, TrendingUp, Users } from "lucide-react"
import Image from "next/image"

// Force dynamic rendering
export const dynamic = "force-dynamic"

interface TrainerProfilePageProps {
    params: Promise<{
        id: string
    }>
}

async function getTrainerProfile(id: string) {
    // Try to find by username (if we had one) or ID
    // For now, assuming ID is the userId or profileId

    // First try to find by userId
    let profile = await prisma.trainer_profiles.findUnique({
        where: { userId: id },
        include: {
            user: true,
            success_stories: {
                where: { isPublic: true },
                orderBy: { createdAt: "desc" }
            }
        }
    })

    // If not found, try by profile ID
    if (!profile) {
        profile = await prisma.trainer_profiles.findUnique({
            where: { id },
            include: {
                user: true,
                success_stories: {
                    where: { isPublic: true },
                    orderBy: { createdAt: "desc" }
                }
            }
        })
    }

    return profile
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
        title: `${profile.user.name || "Trainer"} | GoodRunss Elite`,
        description: profile.bio || "Professional Personal Trainer on GoodRunss",
    }
}

export default async function TrainerProfilePage({ params }: TrainerProfilePageProps) {
    const { id } = await params
    const profile = await getTrainerProfile(id)

    if (!profile) {
        return notFound()
    }

    const { user, success_stories } = profile

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Hero / Cover Photo */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />
                {profile.coverPhotoUrl ? (
                    <Image
                        src={profile.coverPhotoUrl}
                        alt="Cover"
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-black" />
                )}
            </div>

            <div className="container max-w-4xl mx-auto px-4 -mt-32 relative z-20">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-end md:items-center gap-6 mb-8">
                    <div className="relative">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background overflow-hidden relative bg-slate-800 shadow-2xl">
                            {profile.profilePhotoUrl || user.image ? (
                                <Image
                                    src={profile.profilePhotoUrl || user.image || ""}
                                    alt={user.name || "Trainer"}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-500">
                                    {(user.name || "T").charAt(0)}
                                </div>
                            )}
                        </div>
                        {profile.isVerified && (
                            <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1 rounded-full border-4 border-background shadow-lg" title="Verified Trainer">
                                <Check className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 pb-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-2">
                                {user.name}
                                {profile.tier !== "MEMBER" && (
                                    <Badge variant="outline" className="border-gold text-gold bg-gold/10 uppercase text-xs tracking-wider">
                                        {profile.tier}
                                    </Badge>
                                )}
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-4">
                            {profile.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {profile.location}
                                </div>
                            )}
                            {profile.yearsExperience && (
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-gold" />
                                    {profile.yearsExperience} Years Exp.
                                </div>
                            )}
                            {profile.averageRating && (
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-gold fill-gold" />
                                    {profile.averageRating.toFixed(1)} ({profile.totalReviews})
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
                        <Button className="flex-1 md:flex-none bg-gold hover:bg-yellow-600 text-black font-bold">
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

                        {/* Social Links */}
                        <div className="flex gap-4 mt-6">
                            {profile.instagramHandle && (
                                <a href={`https://instagram.com/${profile.instagramHandle}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            )}
                            {profile.youtubeChannel && (
                                <a href={profile.youtubeChannel} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                    <Youtube className="w-5 h-5" />
                                </a>
                            )}
                            {profile.websiteUrl && (
                                <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                    <Globe className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
                        <CardContent className="p-6 text-center">
                            <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{profile.totalClients}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Clients</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
                        <CardContent className="p-6 text-center">
                            <Trophy className="w-6 h-6 text-gold mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{profile.badges.length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Awards</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
                        <CardContent className="p-6 text-center">
                            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">Top 1%</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Rank</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
                        <CardContent className="p-6 text-center">
                            <Star className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">4.9</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Rating</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Success Stories */}
                {success_stories.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-gold" />
                            Success Stories
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {success_stories.map((story) => (
                                <Card key={story.id} className="bg-slate-900 border-slate-800 overflow-hidden group hover:border-slate-700 transition-colors">
                                    <div className="grid grid-cols-2 h-48 md:h-64 relative">
                                        {/* Before Video/Image */}
                                        <div className="relative h-full border-r border-slate-800">
                                            {story.beforeVideoUrl ? (
                                                <video
                                                    src={story.beforeVideoUrl}
                                                    className="w-full h-full object-cover"
                                                    controls
                                                    playsInline
                                                    muted
                                                />
                                            ) : story.beforePhotoUrl ? (
                                                <Image src={story.beforePhotoUrl} alt="Before" fill className="object-cover" />
                                            ) : (
                                                <div className="bg-slate-800 h-full flex items-center justify-center text-slate-600">No Media</div>
                                            )}
                                            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Before</div>
                                        </div>

                                        {/* After Video/Image */}
                                        <div className="relative h-full">
                                            {story.afterVideoUrl ? (
                                                <video
                                                    src={story.afterVideoUrl}
                                                    className="w-full h-full object-cover"
                                                    controls
                                                    playsInline
                                                    muted
                                                />
                                            ) : story.afterPhotoUrl ? (
                                                <Image src={story.afterPhotoUrl} alt="After" fill className="object-cover" />
                                            ) : (
                                                <div className="bg-slate-800 h-full flex items-center justify-center text-slate-600">No Media</div>
                                            )}
                                            <div className="absolute top-2 left-2 bg-gold text-black text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">After</div>
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-white text-lg">{story.clientName}</h3>
                                                <p className="text-slate-400 text-sm">{story.timeframe}</p>
                                            </div>
                                            {/* Metrics badges could go here */}
                                        </div>
                                        <p className="text-slate-300 text-sm italic">"{story.testimonial}"</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

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

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Public API: Get AI Persona Details
 * Used by consumer app to view full persona profile
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const persona = await prisma.aiPersona.findUnique({
      where: { id },
      select: {
        id: true,
        trainerId: true,
        name: true,
        tagline: true,
        bio: true,
        avatarUrl: true,
        voiceFileUrl: true,
        voiceSampleText: true,
        videoUrl: true,
        teachingStyle: true,
        personality: true,
        specialties: true,
        certifications: true,
        pricePerSession: true,
        isActive: true,
        isDiscoverable: true,
        totalSessions: true,
        totalEarnings: true,
        averageRating: true,
        totalRatings: true,
        elevenLabsVoiceId: true,
        createdAt: true,
        publishedAt: true,
      }
    })

    if (!persona) {
      return NextResponse.json(
        { error: 'AI persona not found' },
        { status: 404 }
      )
    }

    if (!persona.isActive || !persona.isDiscoverable) {
      return NextResponse.json(
        { error: 'AI persona not available' },
        { status: 403 }
      )
    }

    // Get trainer info
    const trainer = await prisma.user.findUnique({
      where: { id: persona.trainerId },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
      }
    })

    // TODO: Get recent feedback
    const recentFeedback = await prisma.aiPersonaFeedback.findMany({
      where: { personaId: id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        rating: true,
        comment: true,
        accuracyRating: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      persona: {
        id: persona.id,
        trainerId: persona.trainerId,
        trainerName: trainer?.name || 'Unknown Trainer',
        trainerImage: trainer?.image || persona.avatarUrl,
        personaName: persona.name,
        description: persona.bio || persona.tagline || '',
        specialties: persona.specialties,
        certifications: persona.certifications,
        teachingStyle: persona.teachingStyle,
        personality: persona.personality,
        voiceId: persona.elevenLabsVoiceId,
        voiceSample: persona.voiceSampleText,
        voiceFileUrl: persona.voiceFileUrl,
        videoUrl: persona.videoUrl,
        knowledgeBase: {
          drillCount: 0, // TODO: Count from uploaded content
          scriptCount: 0,
          videoCount: 0,
          audioCount: 0,
          totalContent: 0,
        },
        pricing: {
          model: 'pay_per_use',
          payPerUsePrice: Number(persona.pricePerSession) || 0.30,
          currency: 'USD',
        },
        stats: {
          totalUsers: Math.floor((persona.totalSessions || 0) * 0.4), // Estimate
          averageRating: Number(persona.averageRating) || 0,
          reviewCount: persona.totalRatings || 0,
          totalSessions: persona.totalSessions || 0,
        },
        status: 'active',
        trainerApproved: true, // If published, it's approved
        approvedAt: persona.publishedAt,
        featured: false, // TODO: Add featured flag
        tags: persona.specialties,
        createdAt: persona.createdAt,
        recentFeedback: recentFeedback.map(f => ({
          rating: f.rating,
          comment: f.comment,
          accuracyRating: f.accuracyRating,
          createdAt: f.createdAt,
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching AI persona:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI persona' },
      { status: 500 }
    )
  }
}


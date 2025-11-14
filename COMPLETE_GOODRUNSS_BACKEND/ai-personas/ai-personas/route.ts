import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Public API: Browse AI Trainer Personas Marketplace
 * Used by consumer app to discover AI trainers
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const specialty = searchParams.get('specialty')
    const search = searchParams.get('search')
    const teachingStyle = searchParams.get('teachingStyle')
    const minRating = searchParams.get('minRating')
    const sortBy = searchParams.get('sortBy') || 'rating' // rating, users, newest
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    // Build filter conditions
    const where: any = {
      isActive: true,
      isDiscoverable: true,
    }

    if (specialty) {
      where.specialties = {
        has: specialty
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (teachingStyle) {
      where.teachingStyle = teachingStyle
    }

    if (minRating) {
      where.averageRating = {
        gte: parseFloat(minRating)
      }
    }

    // Determine sort order
    let orderBy: any = {}
    switch (sortBy) {
      case 'users':
        orderBy = { totalSessions: 'desc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'rating':
      default:
        orderBy = [{ averageRating: 'desc' }, { totalRatings: 'desc' }]
        break
    }

    // Fetch personas
    const [personas, total] = await Promise.all([
      prisma.aiPersona.findMany({
        where,
        select: {
          id: true,
          trainerId: true,
          name: true,
          tagline: true,
          bio: true,
          avatarUrl: true,
          teachingStyle: true,
          personality: true,
          specialties: true,
          certifications: true,
          pricePerSession: true,
          totalSessions: true,
          averageRating: true,
          totalRatings: true,
          voiceSampleText: true, // Include for preview
          createdAt: true,
          publishedAt: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.aiPersona.count({ where })
    ])

    // Get trainer info for each persona
    const personasWithTrainers = await Promise.all(
      personas.map(async (persona) => {
        const trainer = await prisma.user.findUnique({
          where: { id: persona.trainerId },
          select: {
            id: true,
            name: true,
            image: true,
          }
        })

        return {
          id: persona.id,
          trainerId: persona.trainerId,
          trainerName: trainer?.name || 'Unknown Trainer',
          trainerImage: trainer?.image || persona.avatarUrl,
          personaName: persona.name,
          description: persona.tagline || persona.bio?.substring(0, 150) + '...',
          specialties: persona.specialties,
          voiceSample: persona.voiceSampleText,
          pricing: {
            model: 'pay_per_use', // Currently only pay-per-use
            payPerUsePrice: Number(persona.pricePerSession) || 0.30,
            currency: 'USD',
          },
          stats: {
            totalUsers: Math.floor((persona.totalSessions || 0) * 0.4), // Estimate unique users
            averageRating: Number(persona.averageRating) || 0,
            reviewCount: persona.totalRatings || 0,
            totalSessions: persona.totalSessions || 0,
          },
          knowledgeBase: {
            drillCount: 0, // TODO: Count from uploaded content
            scriptCount: 0,
            videoCount: 0,
            audioCount: 0,
            totalContent: 0,
          },
          status: 'active',
          featured: false, // TODO: Add featured flag to DB
          tags: persona.specialties,
          createdAt: persona.createdAt,
        }
      })
    )

    // Filter by featured if requested
    let filteredPersonas = personasWithTrainers
    if (featured === 'true') {
      // For now, treat high-rated trainers as "featured"
      filteredPersonas = personasWithTrainers.filter(p => p.stats.averageRating >= 4.5)
    }

    return NextResponse.json({
      personas: filteredPersonas,
      pagination: {
        page,
        limit,
        total: filteredPersonas.length,
        totalPages: Math.ceil(filteredPersonas.length / limit),
        hasMore: page * limit < filteredPersonas.length
      }
    })
  } catch (error) {
    console.error('Error fetching AI personas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI personas' },
      { status: 500 }
    )
  }
}


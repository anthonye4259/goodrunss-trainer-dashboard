import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTrainerProfile() {
    try {
        // Find the user by email
        const user = await prisma.users.findUnique({
            where: { email: 'anthony@goodrunss.com' }
        })

        if (!user) {
            console.error('User not found')
            return
        }

        console.log('Found user:', user.id, user.name)

        // Check if trainer_profiles already exists
        const existingProfile = await prisma.trainer_profiles.findUnique({
            where: { userId: user.id }
        })

        if (existingProfile) {
            console.log('✅ Trainer profile already exists')
            return
        }

        // Create trainer_profiles record
        const profile = await prisma.trainer_profiles.create({
            data: {
                id: crypto.randomUUID(),
                userId: user.id,
                bio: null,
                specialties: [],
                certifications: [],
                yearsExperience: null,
                instagramHandle: null,
                tiktokHandle: null,
                youtubeChannel: null,
                websiteUrl: null,
                isVerified: false,
                profilePhotoUrl: user.image,
                coverPhotoUrl: null,
                location: null,
                hourlyRate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        })

        console.log('✅ Created trainer_profiles record:', profile.id)
    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

createTrainerProfile()

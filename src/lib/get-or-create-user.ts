import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"

/**
 * Gets or creates a user in the database based on Clerk authentication
 * Always syncs name and email from Clerk to ensure data is up-to-date
 */
export async function getOrCreateUser() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress
  const name = clerkUser.firstName
    ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim()
    : clerkUser.username || email?.split('@')[0] || 'Trainer'

  // Try to find existing user
  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  })

  // If user doesn't exist by clerkId, check if they exist by email
  if (!user && email) {
    user = await prisma.user.findUnique({
      where: { email: email },
    })

    // If found by email, update with clerkId
    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          clerkId: clerkUser.id,
          name: name,
          image: clerkUser.imageUrl || user.image,
          updatedAt: new Date(),
        },
      })
    }
  }

  // If still no user, create them
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        clerkId: clerkUser.id,
        email: email || '',
        name: name,
        image: clerkUser.imageUrl || null,
        role: 'TRAINER',
        emailVerified: new Date(),
        updatedAt: new Date(),
      },
    })

    // Create trainer profile for new user
    try {
      await prisma.trainer_profiles.create({
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
          profilePhotoUrl: clerkUser.imageUrl || null,
          coverPhotoUrl: null,
          location: null,
          hourlyRate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      console.log('✅ Created trainer_profiles record for new user:', user.id)
    } catch (error) {
      console.error('❌ Failed to create trainer_profiles:', error)
      // Don't fail user creation if profile creation fails
    }
  } else {
    // Update name and email from Clerk on every login (in case they changed it)
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name,
        email: email || user.email,
        image: clerkUser.imageUrl || user.image,
        updatedAt: new Date(),
      },
    })
  }

  return user
}


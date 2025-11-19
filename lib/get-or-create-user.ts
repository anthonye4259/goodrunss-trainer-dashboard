import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"

/**
 * Gets or creates a user in the database based on Clerk authentication
 */
export async function getOrCreateUser() {
  const clerkUser = await currentUser()
  
  if (!clerkUser) {
    return null
  }

  // Try to find existing user
  let user = await prisma.users.findUnique({
    where: { clerkId: clerkUser.id },
  })

  // If user doesn't exist, create them
  if (!user) {
    const email = clerkUser.emailAddresses[0]?.emailAddress
    const name = clerkUser.firstName 
      ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim()
      : email?.split('@')[0] || 'User'

    user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        clerkId: clerkUser.id,
        email: email || '',
        name: name,
        role: 'TRAINER',
        emailVerified: new Date(),
        updatedAt: new Date(),
      },
    })
  }

  return user
}



import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Connecting to database...')
        const email = `test-${Date.now()}@example.com`
        const name = 'Test Ambassador'
        const payoutEmail = email

        console.log(`Attempting to create ambassador with email: ${email}`)

        const ambassador = await prisma.ambassadors.create({
            data: {
                email,
                name,
                referralCode: `TEST${Math.floor(Math.random() * 10000)}`,
                payoutMethod: "PAYPAL",
                payoutEmail,
                isActive: true
            }
        })

        console.log('Successfully created ambassador:', ambassador)
    } catch (error) {
        console.error('Error creating ambassador:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()

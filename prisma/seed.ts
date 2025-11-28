import { PrismaClient, PaymentStatus, PaymentMethod, SessionStatus, SessionType, BookingSource } from '@prisma/client'
import * as crypto from 'crypto'

const prisma = new PrismaClient()

// Helper to generate random ID
const randomId = () => crypto.randomUUID()

// Helper to get random item from array
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

// Helper to get random number between min and max
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

// Helper to get random date within range
const randomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

async function main() {
    console.log('🌱 Starting seed...')

    // 1. Get or Create Trainer
    let trainer = await prisma.users.findFirst({
        where: { role: 'TRAINER' }
    })

    if (!trainer) {
        console.log('Creating default trainer...')
        trainer = await prisma.users.create({
            data: {
                id: randomId(),
                email: 'trainer@example.com',
                name: 'Demo Trainer',
                role: 'TRAINER',
                updatedAt: new Date(),
            }
        })
    }
    console.log(`Using trainer: ${trainer.name} (${trainer.id})`)

    // 2. Create Clients
    console.log('Creating clients...')
    const clientNames = [
        'Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Evan Wright',
        'Fiona Gallagher', 'George Michael', 'Hannah Montana', 'Ian Somerhalder', 'Julia Roberts'
    ]

    const clients = []
    for (const name of clientNames) {
        const email = name.toLowerCase().replace(' ', '.') + '@example.com'

        // Check if client exists
        let client = await prisma.clients.findFirst({
            where: { email, trainerId: trainer.id }
        })

        if (!client) {
            client = await prisma.clients.create({
                data: {
                    id: randomId(),
                    trainerId: trainer.id,
                    name,
                    email,
                    phone: `555-${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
                    age: randomInt(20, 60),
                    goals: [randomItem(['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility'])],
                    updatedAt: new Date(),
                }
            })
        }
        clients.push(client)
    }
    console.log(`Created/Found ${clients.length} clients`)

    // 3. Create Workout Plans
    console.log('Creating workout plans...')
    const activeClients = clients

    for (const client of activeClients) {
        // 50% chance to have a workout plan
        if (Math.random() > 0.5) continue

        await prisma.workout_plans.create({
            data: {
                id: randomId(),
                trainerId: trainer.id,
                clientId: client.id,
                name: `${client.name}'s Plan`,
                goal: client.goals[0] || 'General Fitness',
                duration: 4, // weeks
                difficulty: randomItem(['Beginner', 'Intermediate', 'Advanced']),
                clientGoals: {},
                fitnessLevel: randomItem(['Beginner', 'Intermediate', 'Advanced']),
                availableTime: 60,
                sessionsPerWeek: 3,
                totalSessions: 12,
                equipment: [],
                injuries: [],
                status: 'active',
                startDate: new Date(),
                updatedAt: new Date(),
            }
        })
    }

    // 4. Create Sessions (Past & Future)
    console.log('Creating sessions...')
    const sessionTypes = Object.values(SessionType)
    const sessionStatuses = Object.values(SessionStatus)

    const now = new Date()
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0)

    for (let i = 0; i < 50; i++) {
        const client = randomItem(clients)
        const date = randomDate(startOfLastMonth, endOfNextMonth)
        const isPast = date < now

        let status: SessionStatus = SessionStatus.SCHEDULED
        if (isPast) {
            status = randomItem([SessionStatus.COMPLETED, SessionStatus.COMPLETED, SessionStatus.COMPLETED, SessionStatus.CANCELLED, SessionStatus.NO_SHOW])
        }

        const session = await prisma.trainer_sessions.create({
            data: {
                id: randomId(),
                trainerId: trainer.id,
                clientId: client.id,
                title: `${randomItem(['PT Session', 'Consultation', 'Check-in'])} with ${client.name}`,
                type: randomItem(sessionTypes),
                duration: 60,
                scheduledAt: date,
                status: status,
                bookedFrom: BookingSource.DASHBOARD,
                updatedAt: new Date(),
            }
        })

        // 5. Create Payments for Completed Sessions
        if (status === SessionStatus.COMPLETED) {
            await prisma.payments.create({
                data: {
                    id: randomId(),
                    trainerId: trainer.id,
                    clientId: client.id,
                    sessionId: session.id,
                    amount: randomItem([50, 75, 100, 120, 150]),
                    currency: 'USD',
                    status: PaymentStatus.COMPLETED,
                    method: randomItem(Object.values(PaymentMethod)),
                    description: `Payment for session on ${date.toLocaleDateString()}`,
                    paidAt: date,
                    updatedAt: new Date(),
                }
            })
        }
    }

    console.log('✅ Seed completed successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/send-email'

type EventType =
    | 'client.session_completed'
    | 'client.missed_session'
    | 'lead.created'
    | 'program.completed'

interface EventPayload {
    userId: string // Trainer ID
    entityId: string // Client ID, Lead ID, etc.
    metadata?: any
}

export async function handleEvent(type: EventType, payload: EventPayload) {
    console.log(`[Event Trigger] Handling ${type} for ${payload.entityId}`)

    try {
        switch (type) {
            case 'client.session_completed':
                await handleSessionCompleted(payload)
                break
            case 'client.missed_session':
                await handleMissedSession(payload)
                break
            case 'lead.created':
                await handleLeadCreated(payload)
                break
            default:
                console.warn(`[Event Trigger] Unknown event type: ${type}`)
        }
    } catch (error) {
        console.error(`[Event Trigger] Error handling ${type}:`, error)
    }
}

async function handleSessionCompleted(payload: EventPayload) {
    const { userId, entityId, metadata } = payload

    // Check for milestones (e.g., 10th session)
    const sessionCount = await prisma.sessions.count({
        where: { clientId: entityId, status: 'completed' }
    })

    if (sessionCount === 10 || sessionCount === 50 || sessionCount === 100) {
        // Trigger milestone celebration draft
        // In a real system, we'd add this to a "Draft Queue"
        console.log(`[Gia] Milestone detected! Client ${entityId} hit ${sessionCount} sessions.`)

        // We could auto-draft a message here and save it to a notification table
    }

    // Check for referral request opportunity (e.g., after 5th session with high rating)
    if (sessionCount === 5) {
        console.log(`[Gia] Referral opportunity detected for client ${entityId}`)
    }
}

async function handleMissedSession(payload: EventPayload) {
    const { userId, entityId } = payload

    // Increment missed session counter
    // If > 2, flag as churn risk
    console.log(`[Gia] Missed session recorded for client ${entityId}`)
}

async function handleLeadCreated(payload: EventPayload) {
    const { userId, entityId } = payload

    // Auto-score the lead
    // If score > 80, trigger "Hot Lead" notification
    console.log(`[Gia] New lead ${entityId} created. Analyzing match score...`)
}

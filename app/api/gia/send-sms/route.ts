import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import twilio from 'twilio'

// Initialize Twilio client
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
)

interface SendSmsRequest {
    clientIds?: string[]  // Send to specific clients
    phoneNumbers?: string[]  // Send to specific phone numbers
    message: string
    sendToAll?: boolean  // Send to all clients
    filters?: {
        hasUpcomingSessions?: boolean
        hasOverduePayments?: boolean
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user from database
        const dbUser = await prisma.users.findUnique({
            where: { email: user.emailAddresses[0]?.emailAddress },
            include: {
                clients: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true
                    }
                }
            }
        })

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const body: SendSmsRequest = await req.json()
        const { clientIds, phoneNumbers, message, sendToAll, filters } = body

        if (!message || message.trim().length === 0) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

        // Check if Twilio is configured
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
            console.error('[SMS] Twilio not configured')
            return NextResponse.json({
                error: 'SMS service not configured. Please add Twilio credentials.'
            }, { status: 500 })
        }

        let recipients: Array<{ id?: string, name: string, phone: string }> = []

        // Determine recipients
        if (sendToAll) {
            // Send to all clients with phone numbers
            recipients = dbUser.clients
                .filter(c => c.phone)
                .map(c => ({ id: c.id, name: c.name, phone: c.phone! }))
        } else if (clientIds && clientIds.length > 0) {
            // Send to specific clients
            recipients = dbUser.clients
                .filter(c => clientIds.includes(c.id) && c.phone)
                .map(c => ({ id: c.id, name: c.name, phone: c.phone! }))
        } else if (phoneNumbers && phoneNumbers.length > 0) {
            // Send to specific phone numbers
            recipients = phoneNumbers.map(phone => ({ name: 'Unknown', phone }))
        } else {
            return NextResponse.json({
                error: 'No recipients specified'
            }, { status: 400 })
        }

        if (recipients.length === 0) {
            return NextResponse.json({
                error: 'No valid recipients found (clients must have phone numbers)'
            }, { status: 400 })
        }

        console.log(`[SMS] Sending to ${recipients.length} recipients`)

        // Send messages
        const results = await Promise.allSettled(
            recipients.map(async (recipient) => {
                try {
                    // Personalize message
                    const personalizedMessage = message
                        .replace(/{name}/g, recipient.name)
                        .replace(/{client_name}/g, recipient.name)

                    const result = await twilioClient.messages.create({
                        body: personalizedMessage,
                        from: process.env.TWILIO_PHONE_NUMBER,
                        to: recipient.phone
                    })

                    console.log(`[SMS] Sent to ${recipient.phone}: ${result.sid}`)

                    // Track in database
                    await prisma.smsMessage.create({
                        data: {
                            trainerId: dbUser.id,
                            clientId: recipient.id,
                            phoneNumber: recipient.phone,
                            message: personalizedMessage,
                            status: 'sent',
                            twilioSid: result.sid,
                            cost: parseFloat(result.price || '0')
                        }
                    })

                    return {
                        success: true,
                        recipient: recipient.name,
                        phone: recipient.phone,
                        sid: result.sid
                    }
                } catch (error: any) {
                    console.error(`[SMS] Failed to send to ${recipient.phone}:`, error)
                    return {
                        success: false,
                        recipient: recipient.name,
                        phone: recipient.phone,
                        error: error.message
                    }
                }
            })
        )

        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
        const failed = results.length - successful

        return NextResponse.json({
            success: true,
            sent: successful,
            failed,
            total: recipients.length,
            results: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: 'Unknown error' })
        })

    } catch (error: any) {
        console.error('[SMS] Error:', error)
        return NextResponse.json({
            error: 'Failed to send messages',
            details: error.message
        }, { status: 500 })
    }
}

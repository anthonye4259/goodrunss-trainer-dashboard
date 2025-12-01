import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

interface DraftMessageRequest {
    type: 'lead_intro' | 'churn_reengagement' | 'referral_request' | 'milestone_celebration'
    recipientId: string
    recipientName: string
    context?: {
        sport?: string
        goals?: string
        level?: string
        lastSession?: string
        missedSessions?: number
        milestone?: string
        referrerName?: string
    }
}

export async function POST(req: NextRequest) {
    try {
        const dbUser = await getOrCreateUser()

        if (!dbUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body: DraftMessageRequest = await req.json()
        const { type, recipientName, context } = body

        if (!type || !recipientName) {
            return NextResponse.json(
                { error: 'Type and recipient name are required' },
                { status: 400 }
            )
        }

        // Get trainer's name
        const trainerName = dbUser.name?.split(' ')[0] || 'Coach'

        // Build the prompt based on message type
        let systemPrompt = ''
        let userPrompt = ''

        switch (type) {
            case 'lead_intro':
                systemPrompt = `You are a professional sports trainer writing a friendly, personalized intro message to a potential new client. Keep it warm, authentic, and concise (under 160 characters for SMS). Focus on their goals and how you can help.`
                userPrompt = `Write an intro message to ${recipientName} who is interested in ${context?.sport || 'training'}. Their goals: ${context?.goals || 'general fitness'}. Experience level: ${context?.level || 'beginner'}. Sign it from ${trainerName}.`
                break

            case 'churn_reengagement':
                systemPrompt = `You are a caring sports trainer reaching out to a client who hasn't trained in a while. Be empathetic, non-pushy, and focus on their wellbeing. Keep it under 160 characters for SMS.`
                userPrompt = `Write a re-engagement message to ${recipientName} who hasn't had a session in ${context?.missedSessions || 2} weeks. Last session was ${context?.lastSession || 'a while ago'}. Be supportive and offer to help them get back on track. Sign it from ${trainerName}.`
                break

            case 'referral_request':
                systemPrompt = `You are a successful sports trainer asking a happy client for referrals. Be appreciative of their progress and make the ask feel natural. Keep it under 160 characters for SMS.`
                userPrompt = `Write a referral request message to ${recipientName} who just ${context?.milestone || 'completed a great session'}. Thank them and ask if they know anyone who might benefit from training. Sign it from ${trainerName}.`
                break

            case 'milestone_celebration':
                systemPrompt = `You are an enthusiastic sports trainer celebrating a client's achievement. Be genuinely excited and encouraging. Keep it under 160 characters for SMS.`
                userPrompt = `Write a celebration message to ${recipientName} who just ${context?.milestone || 'hit a major goal'}. Be enthusiastic and motivating. Sign it from ${trainerName}.`
                break

            default:
                return NextResponse.json(
                    { error: 'Invalid message type' },
                    { status: 400 }
                )
        }

        // Generate message using OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.8,
            max_tokens: 150
        })

        const draftedMessage = completion.choices[0]?.message?.content?.trim() || ''

        // Estimate SMS segments (160 chars per segment)
        const smsSegments = Math.ceil(draftedMessage.length / 160)

        return NextResponse.json({
            success: true,
            message: draftedMessage,
            metadata: {
                type,
                recipientName,
                length: draftedMessage.length,
                smsSegments,
                estimatedCost: smsSegments * 0.0075, // Approximate Twilio cost
                channel: 'sms',
                generatedAt: new Date().toISOString()
            }
        })

    } catch (error: any) {
        console.error('Error drafting message:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to draft message' },
            { status: 500 }
        )
    }
}

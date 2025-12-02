import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import OpenAI from 'openai'
import { getRelevantMemories, formatMemoriesForPrompt } from '@/lib/gia/memory'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
    try {
        const dbUser = await getOrCreateUser()
        if (!dbUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { postContent, postTitle, platform } = await req.json()

        if (!postContent) {
            return NextResponse.json({ error: 'Missing post content' }, { status: 400 })
        }

        // Get relevant memories to personalize the reply
        const context = `${platform} post: ${postTitle}\n${postContent}`
        const relevantMemories = await getRelevantMemories(dbUser.id, context, 5)
        const memoryPrompt = formatMemoriesForPrompt(relevantMemories)

        const systemPrompt = `You are an expert fitness coach acting as a helpful assistant.
Your goal is to draft a helpful, non-salesy, and engaging reply to a social media post.
The reply should offer genuine value, answer the user's question or address their pain point, and subtly position the trainer as an authority.

Trainer Context:
Name: ${dbUser.name || 'Coach'}
Specialty: ${dbUser.specialties?.[0] || 'Fitness Coach'}
Bio: ${dbUser.bio || ''}

${memoryPrompt}

Guidelines:
- Be empathetic and encouraging.
- Provide specific, actionable advice.
- Keep it concise (appropriate for ${platform}).
- Do NOT be overly salesy. Focus on help first.
- If relevant, mention "I'm a coach" or "I tell my clients" to establish authority naturally.
- Use a friendly, professional tone.`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Draft a reply to this ${platform} post:\n\nTitle: ${postTitle}\nContent: ${postContent}` }
            ],
            temperature: 0.7,
        })

        const reply = response.choices[0].message.content

        return NextResponse.json({ reply })
    } catch (error: any) {
        console.error('Error drafting reply:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

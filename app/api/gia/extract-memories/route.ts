import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import OpenAI from 'openai'
import { storeMemory, type MemoryCategory, type MemorySource } from '@/lib/gia/memory'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

interface ExtractedMemory {
    category: MemoryCategory
    key: string
    value: string
    confidence: number
    source: MemorySource
}

const MEMORY_EXTRACTION_PROMPT = `You are a memory extraction system. Analyze the conversation and extract important information about the trainer that should be remembered for future interactions.

Extract memories in these categories:
- **preference**: Communication style, terminology preferences, favorite drills/exercises, preferred program structure
- **fact**: Specialization, experience, certifications, business type, location, client demographics
- **pattern**: Common client goals, typical session structure, recurring challenges, seasonal patterns
- **style**: Coaching philosophy, teaching approach, program design preferences, assessment methods

For each memory, provide:
1. category: One of the four categories above
2. key: A snake_case identifier (e.g., "communication_style", "favorite_drill")
3. value: The actual memory content (concise but informative)
4. confidence: 0-1 score of how confident you are (1.0 for explicit statements, 0.7-0.9 for inferred)
5. source: "explicit" (trainer stated directly), "inferred" (implied from context), or "observed" (pattern noticed)

Only extract meaningful, useful information. Ignore small talk or one-time mentions.

Return a JSON array of memories.`

export async function POST(req: NextRequest) {
    try {
        const dbUser = await getOrCreateUser()
        if (!dbUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { messages } = await req.json()

        const { extractAndStoreMemories } = await import('@/lib/gia/memory-extraction')
        const result = await extractAndStoreMemories(dbUser.id, messages)

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            memoriesExtracted: result.memoriesExtracted,
            memories: result.memories
        })
    } catch (error: any) {
        console.error('Memory extraction error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to extract memories' },
            { status: 500 }
        )
    }
}

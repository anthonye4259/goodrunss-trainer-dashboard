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

export async function extractAndStoreMemories(userId: string, messages: any[]) {
  try {
    if (!messages || messages.length === 0) {
      return { success: false, error: 'No messages provided' }
    }

    // Use GPT-4 to extract memories from the conversation
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: MEMORY_EXTRACTION_PROMPT
        },
        {
          role: 'user',
          content: `Analyze this conversation and extract memories:\n\n${JSON.stringify(messages, null, 2)}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    })

    const content = response.choices[0].message.content
    if (!content) {
      return { success: true, memoriesExtracted: 0, memories: [] }
    }

    let extractedData
    try {
      extractedData = JSON.parse(content)
    } catch (e) {
      console.error('Failed to parse memory extraction response:', e)
      return { success: false, error: 'Failed to parse response' }
    }

    const memories: ExtractedMemory[] = extractedData.memories || []

    // Store each extracted memory
    const storedMemories = []
    for (const memory of memories) {
      try {
        const stored = await storeMemory(
          userId,
          memory.category,
          memory.key,
          memory.value,
          memory.source,
          memory.confidence
        )
        storedMemories.push(stored)
      } catch (error) {
        console.error('Failed to store memory:', error)
      }
    }

    return {
      success: true,
      memoriesExtracted: storedMemories.length,
      memories: storedMemories
    }

  } catch (error: any) {
    console.error('Memory extraction error:', error)
    return { success: false, error: error.message || 'Failed to extract memories' }
  }
}
